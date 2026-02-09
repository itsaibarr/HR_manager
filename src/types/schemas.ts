import { z } from "zod";

/**
 * Job Context Schema - defines what candidates are evaluated against
 */
export const JobContextSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Role title is required"),
  responsibilities: z.array(z.string()).default([]),
  mustHaveSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  experienceExpectations: z.object({
    minYears: z.coerce.number().min(0).optional(),
    maxYears: z.coerce.number().optional(),
    level: z.preprocess((val) => {
      if (typeof val !== 'string') return 'any';
      const normalized = val.toLowerCase();
      if (['junior', 'mid', 'senior', 'lead'].includes(normalized)) return normalized;
      if (normalized.includes('mid') || normalized.includes('intermediate')) return 'mid';
      if (normalized.includes('senior') || normalized.includes('sr')) return 'senior';
      if (normalized.includes('junior') || normalized.includes('jr') || normalized.includes('entry')) return 'junior';
      if (normalized.includes('lead') || normalized.includes('principal') || normalized.includes('staff')) return 'lead';
      return 'any';
    }, z.enum(['junior', 'mid', 'senior', 'lead', 'any'])).default('any'),
    notes: z.string().optional()
  }).optional(),
  nonRequirements: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type JobContext = z.infer<typeof JobContextSchema>;

/**
 * Candidate Profile Schema - normalized structure from CV
 */
export const CandidateProfileSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().optional(),
  email: z.string().optional(), // Fully optional - no validation required
  externalId: z.string().optional(),
  
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    year: z.string().optional(),
  })).optional().default([]),
  
  experience: z.array(z.object({
    company: z.string(),
    title: z.string(),
    description: z.string().optional(),
    duration: z.string().optional(),
    achievements: z.array(z.string()).optional(),
  })).optional().default([]),
  
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    url: z.string().optional(),
  })).optional().default([]),
  
  skills: z.array(z.string()).optional().default([]),
  
  collaborationSignals: z.array(z.string()).optional().default([]),
  
  availability: z.object({
    workType: z.string().optional(),
    remote: z.boolean().optional(),
    notes: z.string().optional()
  }).optional(),
  
  
  otherSignals: z.object({
    languages: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    portfolio: z.string().optional(),
    publications: z.array(z.string()).optional(),
    awards: z.array(z.string()).optional()
  }).optional(),
  
  rawCvText: z.string().optional(),
  
  createdAt: z.date().optional()
});

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

/**
 * Evaluation Result Schema
 */
export const EvaluationResultSchema = z.object({
  id: z.string().uuid().optional(),
  jobContextId: z.string().uuid(),
  candidateId: z.string().uuid(),
  
  // Dimension scores (0-10)
  coreCompetenciesScore: z.number().min(0).max(10),
  experienceResultsScore: z.number().min(0).max(10),
  collaborationSignalsScore: z.number().min(0).max(10),
  culturalPracticalFitScore: z.number().min(0).max(10),
  educationOtherScore: z.number().min(0).max(10),
  
  // Computed
  finalScore: z.number().min(0).max(100),
  scoreBand: z.enum(['Force Multiplier', 'Solid Contributor', 'Baseline Capable', 'Do Not Proceed', 'Reject']),
  
  // Explanations
  reasoning: z.array(z.string()),
  potentialConcern: z.string(),
  rejectionReason: z.string().optional(),
  
  // Confidence
  confidenceScore: z.number().min(0).max(1).optional().default(1.0),
  confidenceReason: z.string().optional(),
  
  // Metadata
  evaluatedBy: z.string().uuid().optional(),
  aiModelVersion: z.string().optional(),
  createdAt: z.date().optional()
});

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

/**
 * Evaluation Request Schema
 */
export const EvaluationRequestSchema = z.object({
  jobContextId: z.string().uuid(),
  candidateId: z.string().uuid()
});

export type EvaluationRequest = z.infer<typeof EvaluationRequestSchema>;

/**
 * Batch Evaluation Request Schema
 */
export const BatchEvaluationRequestSchema = z.object({
  jobContextId: z.string().uuid(),
  candidateIds: z.array(z.string().uuid()).min(1).max(50)
});

export type BatchEvaluationRequest = z.infer<typeof BatchEvaluationRequestSchema>;
