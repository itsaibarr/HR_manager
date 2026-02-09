import { HR_SCREENING_SYSTEM_PROMPT, buildEvaluationPrompt } from './prompts';
import {
  calculateFinalScore,
  getScoreBand,
  shouldAutoReject,
  type DimensionId,
} from '../evaluation/framework';
import type { JobContext, CandidateProfile, EvaluationResult } from '@/types/schemas';
import { getProvider } from './parser';
import { logger } from '@/lib/logger';

/**
 * Evaluate a candidate against a job context using AI Strategy
 */
export async function evaluateCandidate(
  jobContext: JobContext,
  candidateProfile: CandidateProfile
): Promise<Omit<EvaluationResult, 'id' | 'jobContextId' | 'candidateId' | 'evaluatedBy' | 'createdAt'>> {
  
  const provider = getProvider();
  
  const prompt = buildEvaluationPrompt(
    {
      title: jobContext.title,
      responsibilities: jobContext.responsibilities,
      mustHaveSkills: jobContext.mustHaveSkills,
      niceToHaveSkills: jobContext.niceToHaveSkills,
      experienceExpectations: jobContext.experienceExpectations,
      nonRequirements: jobContext.nonRequirements
    },
    {
      education: candidateProfile.education,
      experience: candidateProfile.experience,
      projects: candidateProfile.projects,
      skills: candidateProfile.skills,
      collaborationSignals: candidateProfile.collaborationSignals,
      availability: candidateProfile.availability,
      otherSignals: candidateProfile.otherSignals,
      rawCvText: candidateProfile.rawCvText
    }
  );

  let parsed: {
    coreCompetenciesScore: number;
    experienceResultsScore: number;
    collaborationSignalsScore: number;
    culturalPracticalFitScore: number;
    educationOtherScore: number;
    reasoning: string[];
    potentialConcern: string;
    rejectionReason?: string;
    confidenceScore?: number;
    confidenceReason?: string;
  };

  try {
    parsed = await provider.generateJSON(prompt, HR_SCREENING_SYSTEM_PROMPT);
  } catch (error: any) {
    throw new Error(`Failed to generate evaluation: ${error.message}`);
  }

  // Validate scores are within range
  const validateScore = (score: number, name: string): number => {
    if (typeof score !== 'number' || score < 0 || score > 10) {
      logger.warn('Invalid score, defaulting to 0', { dimension: name, score });
      return 0;
    }
    return Math.round(score * 10) / 10; // Round to 1 decimal
  };

  const scores: Record<DimensionId, number> = {
    coreCompetencies: validateScore(parsed.coreCompetenciesScore, 'coreCompetencies'),
    experienceResults: validateScore(parsed.experienceResultsScore, 'experienceResults'),
    collaborationSignals: validateScore(parsed.collaborationSignalsScore, 'collaborationSignals'),
    culturalPracticalFit: validateScore(parsed.culturalPracticalFitScore, 'culturalPracticalFit'),
    educationOther: validateScore(parsed.educationOtherScore, 'educationOther')
  };

  // Check for auto-rejection
  const autoReject = shouldAutoReject(scores.coreCompetencies);
  
  // Calculate final score
  const finalScore = autoReject ? 0 : calculateFinalScore(scores);
  const scoreBand = autoReject ? 'Reject' : getScoreBand(finalScore);

  return {
    coreCompetenciesScore: scores.coreCompetencies,
    experienceResultsScore: scores.experienceResults,
    collaborationSignalsScore: scores.collaborationSignals,
    culturalPracticalFitScore: scores.culturalPracticalFit,
    educationOtherScore: scores.educationOther,
    finalScore,
    scoreBand,
    reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning : [],
    potentialConcern: parsed.potentialConcern || 'No major concerns identified',
    rejectionReason: autoReject 
      ? 'Core Competencies score is 0 - automatic rejection per framework rules'
      : parsed.rejectionReason,
    confidenceScore: parsed.confidenceScore ?? 1.0,
    confidenceReason: parsed.confidenceReason || "Standard evaluation based on provided details.",
    aiModelVersion: 'gemini-2.0-flash'
  };
}

/**
 * Batch evaluate multiple candidates
 */
export async function evaluateCandidatesBatch(
  jobContext: JobContext,
  candidateProfiles: CandidateProfile[],
  onProgress?: (completed: number, total: number) => void
): Promise<Array<{
  candidateId: string;
  result: Awaited<ReturnType<typeof evaluateCandidate>> | null;
  error?: string;
}>> {
  const results: Array<{
    candidateId: string;
    result: Awaited<ReturnType<typeof evaluateCandidate>> | null;
    error?: string;
  }> = [];

  for (let i = 0; i < candidateProfiles.length; i++) {
    const candidate = candidateProfiles[i];
    
    try {
      const result = await evaluateCandidate(jobContext, candidate);
      results.push({
        candidateId: candidate.id || `candidate-${i}`,
        result
      });
    } catch (error) {
      results.push({
        candidateId: candidate.id || `candidate-${i}`,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    onProgress?.(i + 1, candidateProfiles.length);
    
    // Rate limiting: wait 500ms between requests
    if (i < candidateProfiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}
