import { createClient } from '@/lib/supabase/server';
import { evaluateCandidate } from '@/lib/ai/evaluator';
import { EvaluationRequestSchema, type JobContext, type CandidateProfile } from '@/types/schemas';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess } from '@/lib/api/error-handler';
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ident = getRateLimitIdentifier(request);
    const limitResult = rateLimit(ident, { limit: 20, windowSeconds: 60 });
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many evaluation requests. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(null, { status: 401, userMessage: 'Unauthorized' });
    }

    const body = await request.json();
    const { jobContextId, candidateId } = EvaluationRequestSchema.parse(body);

    const { data: jobContextData, error: jobError } = await supabase
      .from('job_contexts')
      .select('*')
      .eq('id', jobContextId)
      .eq('created_by', user.id)
      .single();

    if (jobError || !jobContextData) {
      return apiError(null, { status: 404, userMessage: 'Job context not found' });
    }

    const { data: candidateData, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (candidateError || !candidateData) {
      return apiError(null, { status: 404, userMessage: 'Candidate profile not found' });
    }

    const jobContext: JobContext = {
      id: jobContextData.id,
      title: jobContextData.title,
      responsibilities: jobContextData.responsibilities,
      mustHaveSkills: jobContextData.must_have_skills,
      niceToHaveSkills: jobContextData.nice_to_have_skills,
      experienceExpectations: jobContextData.experience_expectations as JobContext['experienceExpectations'],
      nonRequirements: jobContextData.non_requirements,
      createdAt: new Date(jobContextData.created_at),
      updatedAt: new Date(jobContextData.updated_at),
    };

    const candidateProfile: CandidateProfile = {
      id: candidateData.id,
      externalId: candidateData.external_id ?? undefined,
      education: (candidateData.education as CandidateProfile['education']) ?? [],
      experience: (candidateData.experience as CandidateProfile['experience']) ?? [],
      projects: (candidateData.projects as CandidateProfile['projects']) ?? [],
      skills: candidateData.skills ?? [],
      collaborationSignals: candidateData.collaboration_signals ?? [],
      availability: (candidateData.availability as CandidateProfile['availability']) ?? undefined,
      otherSignals: (candidateData.other_signals as CandidateProfile['otherSignals']) ?? undefined,
      rawCvText: candidateData.raw_cv_text ?? undefined,
      createdAt: new Date(candidateData.created_at),
    };

    if (!process.env.GEMINI_API_KEY) {
      return apiError(null, {
        status: 500,
        userMessage: 'AI configuration error',
      });
    }

    const evaluationResult = await evaluateCandidate(jobContext, candidateProfile);

    const { data: savedEvaluation, error: saveError } = await supabase
      .from('evaluations')
      .insert({
        job_context_id: jobContextId,
        candidate_id: candidateId,
        core_competencies_score: evaluationResult.coreCompetenciesScore,
        experience_results_score: evaluationResult.experienceResultsScore,
        collaboration_signals_score: evaluationResult.collaborationSignalsScore,
        cultural_practical_fit_score: evaluationResult.culturalPracticalFitScore,
        education_other_score: evaluationResult.educationOtherScore,
        final_score: evaluationResult.finalScore,
        score_band: evaluationResult.scoreBand,
        reasoning: evaluationResult.reasoning,
        potential_concern: evaluationResult.potentialConcern,
        rejection_reason: evaluationResult.rejectionReason,
        evaluated_by: user.id,
        ai_model_version: evaluationResult.aiModelVersion,
      })
      .select()
      .single();

    if (saveError) {
      if (saveError.code === '23505') {
        return apiError(null, {
          status: 409,
          userMessage: 'Candidate already evaluated for this job context',
        });
      }
      return apiError(saveError, {
        status: 500,
        userMessage: 'Failed to save evaluation result',
      });
    }

    return apiSuccess(savedEvaluation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(error);
    }
    return apiError(error, { status: 500 });
  }
}
