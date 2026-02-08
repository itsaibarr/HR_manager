import { createClient } from '@/lib/supabase/server';
import { evaluateCandidate } from '@/lib/ai/evaluator';
import { EvaluationRequestSchema, type JobContext, type CandidateProfile } from '@/types/schemas';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobContextId, candidateId } = EvaluationRequestSchema.parse(body);

    // 1. Fetch Job Context
    const { data: jobContextData, error: jobError } = await supabase
      .from('job_contexts')
      .select('*')
      .eq('id', jobContextId)
      .single();

    if (jobError || !jobContextData) {
      return NextResponse.json({ error: 'Job context not found' }, { status: 404 });
    }

    // 2. Fetch Candidate Profile
    const { data: candidateData, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (candidateError || !candidateData) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    // Map DB types to Schema types for the evaluator
    const jobContext: JobContext = {
      id: jobContextData.id,
      title: jobContextData.title,
      responsibilities: jobContextData.responsibilities,
      mustHaveSkills: jobContextData.must_have_skills,
      niceToHaveSkills: jobContextData.nice_to_have_skills,
      experienceExpectations: jobContextData.experience_expectations as any,
      nonRequirements: jobContextData.non_requirements,
      createdAt: new Date(jobContextData.created_at),
      updatedAt: new Date(jobContextData.updated_at)
    };

    const candidateProfile: CandidateProfile = {
      id: candidateData.id,
      externalId: candidateData.external_id || undefined,
      education: (candidateData.education as any) || [],
      experience: (candidateData.experience as any) || [],
      projects: (candidateData.projects as any) || [],
      skills: candidateData.skills || [],
      collaborationSignals: candidateData.collaboration_signals || [],
      availability: (candidateData.availability as any) || undefined,
      otherSignals: (candidateData.other_signals as any) || undefined,
      rawCvText: candidateData.raw_cv_text || undefined,
      createdAt: new Date(candidateData.created_at)
    };

    // 3. Run AI Evaluation
    if (!process.env.GEMINI_API_KEY) {
       console.error("GEMINI_API_KEY is missing");
       return NextResponse.json({ error: 'AI configuration error' }, { status: 500 });
    }

    const evaluationResult = await evaluateCandidate(jobContext, candidateProfile, process.env.GEMINI_API_KEY);

    // 4. Save Evaluation
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
        ai_model_version: evaluationResult.aiModelVersion
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save evaluation:', saveError);
      
      // If uniqueness constraint violation, it means it was already evaluated
      if (saveError.code === '23505') { 
         return NextResponse.json({ error: 'Candidate already evaluated for this job context' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to save evaluation result' }, { status: 500 });
    }

    return NextResponse.json(savedEvaluation);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Evaluation error:', error);
    return NextResponse.json({ error: 'Internal server error during evaluation' }, { status: 500 });
  }
}
