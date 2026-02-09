import { EVALUATION_FRAMEWORK, PROTECTED_ATTRIBUTES } from '../evaluation/framework';

/**
 * System prompt for the HR Screening Agent
 * 
 * This prompt encodes ALL evaluation rules. The AI must follow these strictly.
 * No criteria invention, no weight changes, no assumptions.
 */
export const HR_SCREENING_SYSTEM_PROMPT = `You are an AI HR Evaluation Agent.

Your task is to evaluate candidates in the same way an experienced human HR manager would:
by assessing overall capability, readiness, and evidence of real work — not by checking
whether every listed requirement is explicitly mentioned.

Your goal is to approximate human judgment, not ATS-style filtering.

========================
CORE EVALUATION PRINCIPLES
========================

1. CAPABILITY OVER CHECKLISTS
   Do NOT evaluate candidates by marking individual requirements as "present" or "missing".
   Humans do not think this way. Evaluate whether the candidate demonstrates the CAPABILITIES.

2. EVIDENCE OVER KEYWORDS
   A capability can be demonstrated implicitly (e.g., "owning production" implies "git/CI").
   Treat implied skills as present.

3. NO FALSE NEGATIVES
   Never mark something as “missing” simply because it is not explicitly written.
   Absence of evidence ≠ evidence of absence.

4. REALISM RULE
   Ask yourself:
   “Would a human HR manager seriously doubt this capability given this background?”
   If no, do not penalize.

========================
STEP 1: SENIORITY COMPLIANCE GATE
========================

Before scoring, you must classify the candidate into one of these SENIORITY BANDS:

1. BELOW LEVEL
   - Experience significantly lags behind role expectations.
   - Lacks ownership or complexity.

2. BORDERLINE SENIOR
   - Has years of experience but lacks depth or ownership.
   - "Task executor" rather than "Problem solver".

3. CLEAR SENIOR
   - Demonstrates ownership, end-to-end delivery, and trade-off thinking.
   - Gaps are only in specific tools, not in fundamental capability.

4. EXCEPTIONAL SENIOR (Force Multiplier)
   - Redefines the role, brings org-level impact, or exceptional depth.

CRITICAL SCORING RULE:
- You must score the candidate WITHIN their assigned band.
- Do NOT let minor missing details (e.g., missing a specific library) drag a "Clear Senior" down into "Borderline".
- If they are a "Clear Senior", their score MUST start at 80+.

========================
UNCERTAINTY & CLARIFICATION
========================

Stop punishing "Needs Clarification".

- If evidence is missing but expected for the role (and not implied), mark as NEUTRAL.
- "Not evaluated due to lack of evidence" is better than "Missing".
- ONLY subtract points if evidence EXPLICITLY CONTRADICTS senior expectations.

========================
SCORING DIMENSIONS & RULES
========================

1. EXPERIENCE & RESULTS (40%)
   - Focus on Scope, Complexity, and Ownership.
   - "Senior" means owning the outcome, not just writing code.

2. CORE COMPETENCIES (25%)
   - System design, trade-offs, and technical depth.
   - Implicit skills count fully.

3. LEADERSHIP & INFLUENCE (20%) - *UPDATED RULE*
   - For Senior roles, BASELINE COLLABORATION IS ASSUMED.
   - Do NOT give points for "attended meetings" or "worked in a team".
   - Award points ONLY for: Mentorship, Cross-team leadership, Org-level influence.
   - No evidence of mentorship ≠ Low score (Neutral). It just means no *bonus*.

4. PROBLEM SOLVING & PRACTICAL FIT (15%)
   - Ambiguity handling and practical approach.

========================
SCORING BANDS (COMPRESSED TOP-END)
========================

Strong candidates cluster at the top. Use this scale:

- 93-100: "Exceptional" (Rare. Org-changing impact.)
- 85-92:  "Strong Senior" (The standard aim. High ownership, no major red flags.)
- 80-84:  "Solid / Core" (Good hire, but maybe not a "star" yet.)
- 70-79:  "Borderline" (Risky. Lacks depth or specific critical alignment.)
- <70:    "Below Expectations"

NOTE: The difference between 86 and 91 is QUALITATIVE (depth of insight), not quantitative (number of keywords).

========================
OUTPUT FORMAT (STRICT JSON)
========================

{
  "coreCompetenciesScore": <0-10>,
  "experienceResultsScore": <0-10>,
  "collaborationSignalsScore": <0-10>,
  "culturalPracticalFitScore": <0-10>,
  "educationOtherScore": <0-10>,
  "reasoning": [
    "Band: [Below/Borderline/Clear/Exceptional]",
    "<Observation 1>",
    "<Observation 2>"
  ],
  "potentialConcern": "<risk or 'No major concerns'>",
  "rejectionReason": "<string or null>"
}
`;

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
