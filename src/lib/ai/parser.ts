import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { CandidateProfileSchema } from '@/types/schemas';
import { z } from 'zod';

// --- Interfaces & Configuration ---

export type AIProviderType = 'gemini' | 'openai' | 'claude';

export interface AIConfig {
    provider: AIProviderType;
    apiKey: string;
}

export interface AIProvider {
    generateJSON(userPrompt: string, systemPrompt: string): Promise<any>;
}

// --- Prompts ---

const CV_SYSTEM_PROMPT = `
You are an expert HR Data Parser with adaptive intelligence. Your goal is to extract structured information from ANY resume format, regardless of structure, language, or completeness.

CORE PRINCIPLES:
1. Be format-agnostic: Handle traditional resumes, portfolios, LinkedIn exports, minimal CVs, or any other format
2. Extract what exists: Work with partial information - some resumes may only have name + skills, others may be comprehensive
3. Intelligent inference: Recognize field variations (e.g., "work experience" = "employment history" = "career" = "professional background")
4. Multi-language support: Extract information regardless of language
5. Preserve context: When uncertain, include the raw text for human review

EXTRACTION STRATEGY:
- First, identify what type of document this is (traditional CV, portfolio, LinkedIn export, etc.)
- Locate contact information anywhere in the document (name, email, phone)
- Find experience sections regardless of heading (work, employment, career, positions, etc.)
- Identify skills even if not explicitly labeled (look in descriptions, projects, tools mentioned)
- Extract education from any format (degrees, certifications, courses, self-taught)
- Recognize projects/portfolio items even if mixed with work experience
- Infer collaboration signals from descriptions (team, collaborated, led, mentored, etc.)

FIELD VARIATIONS TO RECOGNIZE:
- Name: "name", "full name", "candidate name", or first text block
- Email: any email format anywhere in document
- Experience: "work experience", "employment", "career", "professional background", "positions"
- Skills: "skills", "technologies", "tools", "expertise", "proficiencies", "tech stack"
- Education: "education", "academic background", "degrees", "certifications", "learning"
- Projects: "projects", "portfolio", "work samples", "case studies", "achievements"

HANDLING EDGE CASES:
- If name is missing: extract from email or mark as "Not provided"
- If experience is unclear: look for company names, dates, role descriptions
- If skills aren't listed: extract from project/experience descriptions
- If format is non-standard: do your best to categorize information logically
- If language is non-English: extract and preserve in original language

OUTPUT REQUIREMENTS:
Return valid JSON with these fields (all optional except attempting to find name/email):
{
  "fullName": "extracted or inferred name",
  "email": "extracted email or empty string",
  "education": [{"institution": "", "degree": "", "field": "", "year": ""}],
  "experience": [{"company": "", "title": "", "description": "", "duration": "", "achievements": []}],
  "projects": [{"name": "", "description": "", "technologies": [], "url": ""}],
  "skills": ["skill1", "skill2"],
  "collaborationSignals": ["inferred from descriptions"],
  "availability": {"workType": "", "remote": null, "notes": ""},
  "otherSignals": {"languages": [], "certifications": [], "portfolio": ""},
  "extractionNotes": "any uncertainties or format observations"
}

IMPORTANT: Extract whatever you can find. Empty arrays/strings are acceptable. The goal is maximum adaptability.
`;

const JD_SYSTEM_PROMPT = `
You are an expert HR Data Parser. Extract structured data from the Job Description into JSON.
Rules:
1. Extract responsibilities, mustHaveSkills, niceToHaveSkills.
2. Extract experienceExpectations (minYears, level).
3. If brief, INFER standard requirements based on title.
4. Return ONLY valid JSON.
`;

// --- Provder Implementations ---

class GeminiProvider implements AIProvider {
    private genAI: GoogleGenerativeAI;
    private modelName = 'gemini-2.0-flash';

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateJSON(userPrompt: string, systemPrompt: string): Promise<any> {
        const model = this.genAI.getGenerativeModel({
            model: this.modelName,
            systemInstruction: systemPrompt,
            generationConfig: { responseMimeType: 'application/json' }
        });
        const result = await model.generateContent(userPrompt);
        return JSON.parse(result.response.text());
    }
}

class OpenAIProvider implements AIProvider {
    private client: OpenAI;
    private modelName = 'gpt-4o'; 

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    }

    async generateJSON(userPrompt: string, systemPrompt: string): Promise<any> {
        const response = await this.client.chat.completions.create({
            model: this.modelName,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0].message.content;
        return content ? JSON.parse(content) : {};
    }
}

class ClaudeProvider implements AIProvider {
    private client: Anthropic;
    private modelName = 'claude-3-5-sonnet-20240620';

    constructor(apiKey: string) {
        this.client = new Anthropic({ apiKey });
    }

    async generateJSON(userPrompt: string, systemPrompt: string): Promise<any> {
        const msg = await this.client.messages.create({
            model: this.modelName,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
                { role: 'user', content: `${userPrompt}\n\nReturn the result as valid JSON.` }
            ]
        });
        const content = msg.content[0].type === 'text' ? msg.content[0].text : '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }
}

// --- Factory & Exports ---

export function getProvider(config?: AIConfig): AIProvider {
    const providerType = config?.provider || 'gemini';
    const apiKey = config?.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(`API Key missing for provider: ${providerType}`);
    }

    switch (providerType) {
        case 'openai': return new OpenAIProvider(apiKey);
        case 'claude': return new ClaudeProvider(apiKey);
        case 'gemini':
        default: return new GeminiProvider(apiKey);
    }
}

// --- Public API ---

export async function parseCvText(
  rawText: string, 
  config?: AIConfig
): Promise<z.infer<typeof CandidateProfileSchema>> {
   try {
     const provider = getProvider(config);
     const parsed = await provider.generateJSON(
        `Extract structured information from this resume/CV. Handle any format gracefully:\n\n${rawText.substring(0, 30000)}`, 
        CV_SYSTEM_PROMPT
     );
     
     // Adaptive normalization - handle multiple field name variations
     const normalizedName = 
       parsed.fullName || 
       parsed.full_name || 
       parsed.name || 
       parsed.candidateName || 
       parsed.candidate_name ||
       "";
     
     const normalizedEmail = 
       parsed.email || 
       parsed.emailAddress || 
       parsed.email_address || 
       parsed.contact?.email ||
       "";
     
     // Normalize arrays - handle both array and object formats
     const normalizeArray = (field: any): any[] => {
       if (Array.isArray(field)) return field;
       if (field && typeof field === 'object') return [field];
       return [];
     };
     
     // Extract skills from multiple possible locations
     const skills = [
       ...normalizeArray(parsed.skills),
       ...normalizeArray(parsed.technologies),
       ...normalizeArray(parsed.technicalSkills),
       ...normalizeArray(parsed.tech_stack)
     ].filter((skill, index, self) => 
       skill && self.indexOf(skill) === index // deduplicate
     );
     
     // Normalize experience - handle various formats
     const experience = normalizeArray(parsed.experience || parsed.workExperience || parsed.employment || parsed.career);
     
     // Normalize education
     const education = normalizeArray(parsed.education || parsed.academicBackground || parsed.degrees);
     
     // Normalize projects
     const projects = normalizeArray(parsed.projects || parsed.portfolio || parsed.workSamples);
     
     // Extract collaboration signals from descriptions if not explicitly provided
     const explicitSignals = normalizeArray(parsed.collaborationSignals || parsed.collaboration_signals);
     const inferredSignals: string[] = [];
     
     // Look for collaboration keywords in experience/project descriptions
     const collaborationKeywords = ['team', 'collaborated', 'led', 'mentored', 'coordinated', 'managed team', 'worked with'];
     const allDescriptions = [
       ...experience.map((e: any) => e.description || ''),
       ...projects.map((p: any) => p.description || '')
     ].join(' ').toLowerCase();
     
     collaborationKeywords.forEach(keyword => {
       if (allDescriptions.includes(keyword)) {
         inferredSignals.push(`Mentioned "${keyword}" in descriptions`);
       }
     });
     
     const collaborationSignals = [...explicitSignals, ...inferredSignals.slice(0, 3)]; // limit inferred signals
     
     return {
        fullName: normalizedName,
        email: normalizedEmail,
        education,
        experience,
        projects,
        skills,
        collaborationSignals,
        availability: parsed.availability || undefined,
        otherSignals: parsed.otherSignals || parsed.other_signals || undefined,
        rawCvText: rawText,
     };
   } catch (error) {
     console.error("AI Parsing Failed:", error);
     // Return minimal valid profile instead of throwing
     return {
       fullName: "",
       email: "",
       education: [],
       experience: [],
       projects: [],
       skills: [],
       collaborationSignals: [],
       rawCvText: rawText,
     };
   }
}

export async function parseJobDescription(
  title: string,
  description: string,
  config?: AIConfig
): Promise<{
  responsibilities: string[];
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  experienceExpectations: any;
  nonRequirements: string[];
}> {
    try {
        const provider = getProvider(config);
        const parsed = await provider.generateJSON(
            `Parse this JD:\nTitle: ${title}\nDescription: ${description.substring(0, 30000)}`,
            JD_SYSTEM_PROMPT
        );

        return {
            responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : ["General Responsibilities"],
            mustHaveSkills: Array.isArray(parsed.mustHaveSkills) ? parsed.mustHaveSkills : [],
            niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills) ? parsed.niceToHaveSkills : [],
            experienceExpectations: parsed.experienceExpectations || {},
            nonRequirements: Array.isArray(parsed.nonRequirements) ? parsed.nonRequirements : []
        };
    } catch (error) {
        console.error("AI JD Parsing Failed:", error);
        return {
            responsibilities: ["Parsed from description (Fallback)"],
            mustHaveSkills: [],
            niceToHaveSkills: [],
            experienceExpectations: {},
            nonRequirements: []
        };
    }
}
