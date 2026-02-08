import { EVALUATION_FRAMEWORK, PROTECTED_ATTRIBUTES } from '../evaluation/framework';

/**
 * System prompt for the HR Screening Agent
 * 
 * This prompt encodes ALL evaluation rules. The AI must follow these strictly.
 * No criteria invention, no weight changes, no assumptions.
 */
export const HR_SCREENING_SYSTEM_PROMPT = `You are an AI HR Screening Agent operating as part of a startup MVP.

Your role is NOT to decide who to hire.
Your role is to apply a human-defined evaluation framework consistently,
transparently, and explainably to candidate profiles.

You must strictly follow the rules below.
You may NOT invent criteria, change weights, or make assumptions beyond the provided data.

========================
SYSTEM PRINCIPLES
========================

- This is a rule-driven system, not a learning system.
- Humans define what matters; you apply it.
- Transparency is more important than optimization.
- Missing information must be treated as uncertainty, not failure.
- Junior candidates must not be evaluated as seniors.

========================
EVALUATION FRAMEWORK (FIXED)
========================

You must evaluate the candidate using these dimensions and weights:

1. Core Competencies (35%)
   - Relevance of skills to the job context
   - Evidence of applying those skills in practice
   - Depth over keyword matching

2. Experience & Results (25%)
   - Hands-on experience (internships, projects, junior roles)
   - Ownership of work
   - Measurable impact if available (optional for junior roles)

3. Collaboration Signals (20%)
   - Evidence of working with others
   - Exposure to feedback, iteration, or team environments
   - Signals only — not proven behavior

4. Cultural & Practical Fit (15%)
   - Fit for role level and work environment
   - Availability, language, logistics if stated
   - No personality or values inference

5. Education & Other Signals (5%)
   - Relevant education or learning activity
   - Low weight by design

========================
SCORING RULES
========================

- Score each dimension from 0 to 10.
- Apply the fixed weights to compute a final score (0–100).
- If Core Competencies = 0 → automatic rejection.

Score Bands:
- 85–100 → Strong Fit
- 70–84 → Good Fit
- 60–69 → Borderline
- <60 → Reject

Exact scores are internal; bands are primary.

========================
BIAS & SAFETY RULES
========================

You must ignore and exclude from evaluation:
- Age, gender, race, ethnicity, religion
- Nationality (unless work eligibility is explicitly stated)
- Photos, names implying demographics
- Family or personal information

Protected attributes must not affect scores or explanations.

========================
OUTPUT FORMAT (STRICT JSON)
========================

Return your evaluation as a valid JSON object with this exact structure:

{
  "coreCompetenciesScore": <number 0-10>,
  "experienceResultsScore": <number 0-10>,
  "collaborationSignalsScore": <number 0-10>,
  "culturalPracticalFitScore": <number 0-10>,
  "educationOtherScore": <number 0-10>,
  "reasoning": [
    "<string: specific evidence linked to Core Competencies or Experience>",
    "<string: specific evidence linked to Collaboration or Fit>",
    "<string: concrete project, skill, or absence thereof>"
  ],
  "potentialConcern": "<string: one clear, evidence-based risk or 'No major concerns identified'>",
  "rejectionReason": "<string or null: if rejected, state primary reason>"
}

========================
BEHAVIOR CONSTRAINTS
========================

- Be consistent across candidates.
- Do not optimize for kindness or harshness.
- Do not hallucinate skills, tools, or experience.
- Prefer conservative scoring when evidence is weak.
- If something is not explicitly stated, treat as "Not stated" - do not infer.

This output will be reviewed by humans.`;

/**
 * Build the evaluation prompt with job context and candidate data
 */
export function buildEvaluationPrompt(
  jobContext: {
    title: string;
    responsibilities: string[];
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    experienceExpectations?: {
      minYears?: number;
      maxYears?: number;
      level?: string;
      notes?: string;
    };
    nonRequirements: string[];
  },
  candidateProfile: {
    education?: Array<{ institution: string; degree: string; field?: string }>;
    experience?: Array<{ company: string; title: string; description?: string; achievements?: string[] }>;
    projects?: Array<{ name: string; description?: string; technologies?: string[] }>;
    skills: string[];
    collaborationSignals: string[];
    availability?: { workType?: string; remote?: boolean; notes?: string };
    otherSignals?: { languages?: string[]; certifications?: string[] };
    rawCvText?: string;
  }
): string {
  return `
========================
JOB CONTEXT
========================

Role Title: ${jobContext.title}

Responsibilities:
${jobContext.responsibilities.map(r => `- ${r}`).join('\n')}

Must-Have Skills:
${jobContext.mustHaveSkills.map(s => `- ${s}`).join('\n')}

Nice-to-Have Skills:
${jobContext.niceToHaveSkills.length > 0 ? jobContext.niceToHaveSkills.map(s => `- ${s}`).join('\n') : '- None specified'}

Experience Expectations:
${jobContext.experienceExpectations ? `
- Level: ${jobContext.experienceExpectations.level || 'any'}
- Years: ${jobContext.experienceExpectations.minYears || 0}${jobContext.experienceExpectations.maxYears ? `-${jobContext.experienceExpectations.maxYears}` : '+'}
${jobContext.experienceExpectations.notes ? `- Notes: ${jobContext.experienceExpectations.notes}` : ''}
` : '- Not specified'}

Non-Requirements (explicitly NOT required):
${jobContext.nonRequirements.length > 0 ? jobContext.nonRequirements.map(n => `- ${n}`).join('\n') : '- None specified'}

========================
CANDIDATE PROFILE
========================

Education:
${candidateProfile.education && candidateProfile.education.length > 0 
  ? candidateProfile.education.map(e => `- ${e.degree} in ${e.field || 'N/A'} from ${e.institution}`).join('\n')
  : '- Not stated'}

Experience:
${candidateProfile.experience && candidateProfile.experience.length > 0
  ? candidateProfile.experience.map(e => `
- ${e.title} at ${e.company}
  ${e.description || 'No description'}
  ${e.achievements ? `Achievements: ${e.achievements.join(', ')}` : ''}
`).join('\n')
  : '- Not stated'}

Projects:
${candidateProfile.projects && candidateProfile.projects.length > 0
  ? candidateProfile.projects.map(p => `
- ${p.name}
  ${p.description || 'No description'}
  ${p.technologies ? `Technologies: ${p.technologies.join(', ')}` : ''}
`).join('\n')
  : '- Not stated'}

Skills:
${candidateProfile.skills.length > 0 ? candidateProfile.skills.join(', ') : 'Not stated'}

Collaboration Signals:
${candidateProfile.collaborationSignals.length > 0 
  ? candidateProfile.collaborationSignals.map(s => `- ${s}`).join('\n')
  : '- Not stated'}

Availability:
${candidateProfile.availability 
  ? `- Work Type: ${candidateProfile.availability.workType || 'Not stated'}
- Remote: ${candidateProfile.availability.remote !== undefined ? (candidateProfile.availability.remote ? 'Yes' : 'No') : 'Not stated'}
${candidateProfile.availability.notes ? `- Notes: ${candidateProfile.availability.notes}` : ''}`
  : '- Not stated'}

Other Signals:
${candidateProfile.otherSignals
  ? `- Languages: ${candidateProfile.otherSignals.languages?.join(', ') || 'Not stated'}
- Certifications: ${candidateProfile.otherSignals.certifications?.join(', ') || 'Not stated'}`
  : '- Not stated'}

${candidateProfile.rawCvText ? `
Raw CV Text (for additional context):
${candidateProfile.rawCvText.substring(0, 3000)}${candidateProfile.rawCvText.length > 3000 ? '...[truncated]' : ''}
` : ''}

========================
INSTRUCTION
========================

Evaluate this candidate against the job context using the fixed framework.
Return ONLY a valid JSON object matching the required structure.
Do not include any text before or after the JSON.
`;
}
