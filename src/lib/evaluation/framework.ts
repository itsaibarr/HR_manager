/**
 * Strata Screening Agent - Evaluation Framework
 * 
 * Fixed 5-dimension evaluation system with predetermined weights.
 * This is a RULE-DRIVEN system - weights and criteria are defined by humans,
 * not learned or adjusted by AI.
 */

export const EVALUATION_FRAMEWORK = {
  dimensions: {
    coreCompetencies: {
      id: 'core_competencies',
      name: 'Core Competencies',
      weight: 0.25,
      description: 'System understanding and trade-offs',
      criteria: [
        'System understanding and trade-offs',
        'Equivalent tools imply equivalent competence',
        'Do NOT require duplicate frontend frameworks'
      ]
    },
    experienceResults: {
      id: 'experience_results',
      name: 'Experience & Results',
      weight: 0.40,
      description: 'Primary signal for senior roles',
      criteria: [
        'Look for ownership, scope, complexity, and outcomes',
        'IMPLIED impact is acceptable if supported by context',
        'Primary signal for senior roles'
      ]
    },
    collaborationSignals: {
      id: 'collaboration_signals',
      name: 'Leadership & Influence',
      weight: 0.20,
      description: 'Leadership and cross-team collaboration',
      criteria: [
        'Leadership implied by owning systems/migrations',
        'Cross-team collaboration',
        'Explicit "mentorship" wording is NOT required'
      ]
    },
    culturalPracticalFit: {
      id: 'cultural_practical_fit',
      name: 'Problem Solving & Fit',
      weight: 0.15,
      description: 'Operating under ambiguity',
      criteria: [
        'Ability to operate under ambiguity',
        'Fit for role level and work context',
        'Problem Solving & Practical Fit'
      ]
    },
    educationOther: {
      id: 'education_other',
      name: 'Education & Other Signals',
      weight: 0.00,
      description: 'Neutral by default',
      criteria: [
        'Neutral by default',
        'Never penalize for absence'
      ]
    }
  } as const,

  scoreBands: {
    'Force Multiplier': { min: 85, max: 100, color: '#16A34A' },
    'Solid Contributor': { min: 70, max: 84.9, color: '#2563EB' },
    'Baseline Capable': { min: 60, max: 69.9, color: '#CA8A04' },
    'Do Not Proceed': { min: 0, max: 59.9, color: '#DC2626' }
  } as const,

  rules: {
    autoRejectIfCoreCompetenciesZero: false,
    treatMissingAsUncertainty: true,
    conservativeScoringOnWeakEvidence: true,
    maxScorePerDimension: 10,
    minScorePerDimension: 0
  }
} as const;

export type DimensionId = keyof typeof EVALUATION_FRAMEWORK.dimensions;
export type ScoreBand = keyof typeof EVALUATION_FRAMEWORK.scoreBands;

/**
 * Calculate final score from dimension scores
 */
export function calculateFinalScore(dimensionScores: Record<DimensionId, number>): number {
  let totalScore = 0;
  
  for (const [key, dimension] of Object.entries(EVALUATION_FRAMEWORK.dimensions)) {
    const score = dimensionScores[key as DimensionId] || 0;
    totalScore += score * dimension.weight * 10; // Scale to 100
  }
  
  return Math.round(totalScore * 10) / 10; // Round to 1 decimal
}

/**
 * Determine score band from final score using >= thresholds (no gaps)
 */
export function getScoreBand(finalScore: number): ScoreBand {
  if (finalScore >= 85) return 'Force Multiplier';
  if (finalScore >= 70) return 'Solid Contributor';
  if (finalScore >= 60) return 'Baseline Capable';
  return 'Do Not Proceed';
}

/**
 * Check if candidate should be auto-rejected
 */
export function shouldAutoReject(coreCompetenciesScore: number): boolean {
  return EVALUATION_FRAMEWORK.rules.autoRejectIfCoreCompetenciesZero && 
         coreCompetenciesScore === 0;
}

/**
 * Protected attributes that must be ignored in evaluation
 */
export const PROTECTED_ATTRIBUTES = [
  'age',
  'gender',
  'race',
  'ethnicity',
  'religion',
  'nationality', // unless work eligibility explicitly stated
  'photos',
  'names_implying_demographics',
  'family_information',
  'personal_information'
] as const;
