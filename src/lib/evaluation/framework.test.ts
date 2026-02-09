import { describe, it, expect } from 'vitest';
import {
  calculateFinalScore,
  getScoreBand,
  shouldAutoReject,
  EVALUATION_FRAMEWORK,
  type DimensionId,
} from './framework';

describe('calculateFinalScore', () => {
  it('returns weighted sum scaled to 100', () => {
    const scores: Record<DimensionId, number> = {
      coreCompetencies: 8,
      experienceResults: 7,
      collaborationSignals: 6,
      culturalPracticalFit: 5,
      educationOther: 4,
    };
    const result = calculateFinalScore(scores);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('returns 0 when all scores are 0', () => {
    const scores: Record<DimensionId, number> = {
      coreCompetencies: 0,
      experienceResults: 0,
      collaborationSignals: 0,
      culturalPracticalFit: 0,
      educationOther: 0,
    };
    expect(calculateFinalScore(scores)).toBe(0);
  });

  it('returns high score when all dimensions are maxed', () => {
    const scores: Record<DimensionId, number> = {
      coreCompetencies: 10,
      experienceResults: 10,
      collaborationSignals: 10,
      culturalPracticalFit: 10,
      educationOther: 10,
    };
    const result = calculateFinalScore(scores);
    expect(result).toBeGreaterThan(80);
  });
});

describe('getScoreBand', () => {
  it('returns Force Multiplier for 85+', () => {
    expect(getScoreBand(85)).toBe('Force Multiplier');
    expect(getScoreBand(100)).toBe('Force Multiplier');
  });

  it('returns Solid Contributor for 70-84.9', () => {
    expect(getScoreBand(70)).toBe('Solid Contributor');
    expect(getScoreBand(84.9)).toBe('Solid Contributor');
  });

  it('returns Baseline Capable for 60-69.9', () => {
    expect(getScoreBand(60)).toBe('Baseline Capable');
    expect(getScoreBand(69.9)).toBe('Baseline Capable');
  });

  it('returns Do Not Proceed for <60', () => {
    expect(getScoreBand(0)).toBe('Do Not Proceed');
    expect(getScoreBand(59.9)).toBe('Do Not Proceed');
  });
});

describe('shouldAutoReject', () => {
  it('returns false when autoReject rule is disabled', () => {
    expect(EVALUATION_FRAMEWORK.rules.autoRejectIfCoreCompetenciesZero).toBe(false);
    expect(shouldAutoReject(0)).toBe(false);
  });
});
