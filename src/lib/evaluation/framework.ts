/**
 * HR Screening Agent - Evaluation Framework
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
      weight: 0.35,
      description: 'Technical skills relevance and depth',
      criteria: [
        'Relevance of skills to the job context',
        'Evidence of applying those skills in practice',
        'Depth over keyword matching'
      ]
    },
    experienceResults: {
      id: 'experience_results',
      name: 'Experience & Results',
      weight: 0.25,
      description: 'Hands-on experience and ownership',
      criteria: [
        'Hands-on experience (internships, projects, junior roles)',
        'Ownership of work',
        'Measurable impact if available (optional for junior roles)'
      ]
    },
    collaborationSignals: {
      id: 'collaboration_signals',
      name: 'Collaboration Signals',
      weight: 0.20,
      description: 'Evidence of teamwork and feedback exposure',
      criteria: [
        'Evidence of working with others',
        'Exposure to feedback, iteration, or team environments',
        'Signals only — not proven behavior'
      ]
    },
    culturalPracticalFit: {
      id: 'cultural_practical_fit',
      name: 'Cultural & Practical Fit',
      weight: 0.15,
      description: 'Role level fit and logistics',
      criteria: [
        'Fit for role level and work environment',
        'Availability, language, logistics if stated',
        'No personality or values inference'
      ]
    },
    educationOther: {
      id: 'education_other',
      name: 'Education & Other Signals',
      weight: 0.05,
      description: 'Educational background (low weight by design)',
      criteria: [
        'Relevant education or learning activity',
        'Low weight by design'
      ]
    }
  } as const,

  scoreBands: {
    'Strong Fit': { min: 85, max: 100, color: '#16A34A' },
    'Good Fit': { min: 70, max: 84, color: '#2563EB' },
    'Borderline': { min: 60, max: 69, color: '#CA8A04' },
    'Reject': { min: 0, max: 59, color: '#DC2626' }
  } as const,

  rules: {
    autoRejectIfCoreCompetenciesZero: true,
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
 * Determine score band from final score
 */
export function getScoreBand(finalScore: number): ScoreBand {
  for (const [band, range] of Object.entries(EVALUATION_FRAMEWORK.scoreBands)) {
    if (finalScore >= range.min && finalScore <= range.max) {
      return band as ScoreBand;
    }
  }
  return 'Reject';
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
