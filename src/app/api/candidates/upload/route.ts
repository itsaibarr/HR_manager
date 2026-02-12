import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { parseCvText } from '@/lib/ai/parser';
import { evaluateCandidate } from '@/lib/ai/evaluator';
import { JobContextSchema } from '@/types/schemas';
import { apiError, apiSuccess } from '@/lib/api/error-handler';
import { rateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

if (typeof global.DOMMatrix === 'undefined') {
  (global as unknown as Record<string, unknown>).DOMMatrix = class DOMMatrix {};
}
if (typeof global.ImageData === 'undefined') {
  (global as unknown as Record<string, unknown>).ImageData = class ImageData {
    constructor(
      public data: Uint8ClampedArray,
      public width: number,
      public height: number
    ) {}
  };
}
if (typeof global.Path2D === 'undefined') {
  (global as unknown as Record<string, unknown>).Path2D = class Path2D {};
}

let pdf: ((buffer: Buffer) => Promise<{ text: string }>) | null = null;
try {
  pdf = require('pdf-parse');
} catch (e) {
  logger.error('Failed to load pdf-parse', { error: e });
}

export async function POST(request: Request) {
  try {
    const ident = getRateLimitIdentifier(request);
    const limitResult = rateLimit(ident, { limit: 10, windowSeconds: 60 });
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many upload requests. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(null, { status: 401, userMessage: 'Unauthorized' });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const jobId = formData.get('jobId') as string | null;
    const providedRawText = formData.get('rawText') as string | null;
    const manualName = formData.get('name') as string | null;
    const manualEmail = formData.get('email') as string | null;

    if (!jobId || (!file && !providedRawText)) {
      return apiError(null, {
        status: 400,
        userMessage: 'Missing jobId or content (file/rawText)',
      });
    }

    let rawText = '';

    if (providedRawText) {
      rawText = providedRawText;
    } else if (file) {
      if (!pdf) {
        return apiError(null, {
          status: 500,
          userMessage: 'PDF parsing is not available',
        });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.type === 'application/pdf') {
        try {
          const data = await pdf(buffer);
          rawText = data.text;
        } catch (e) {
          logger.error('PDF parse error', { error: e });
          return apiError(null, {
            status: 400,
            userMessage: 'Failed to parse PDF',
          });
        }
      } else if (file.type === 'text/plain' || file.name?.endsWith('.txt')) {
        rawText = buffer.toString('utf-8');
      } else {
        return apiError(null, {
          status: 400,
          userMessage: 'Only PDF and TXT files are supported',
        });
      }
    }

    rawText = rawText.replace(/\n\s*\n/g, '\n').trim();

    if (rawText.length < 50) {
      return apiError(null, {
        status: 400,
        userMessage: 'Extracted text is too short to be a valid CV',
      });
    }

    let candidateProfile;
    try {
      candidateProfile = await parseCvText(rawText);
    } catch (e) {
      logger.error('AI parsing failed', { error: e, candidateName: manualName });
      return apiError(null, {
        status: 500,
        userMessage: 'AI parsing failed',
      });
    }

    const { data: jobData, error: jobError } = await supabase
      .from('job_contexts')
      .select('*')
      .eq('id', jobId)
      .eq('created_by', user.id)
      .single();

    if (jobError || !jobData) {
      return apiError(jobError, {
        status: 404,
        userMessage: 'Job context not found',
      });
    }

    const jobContext = {
      id: jobData.id,
      title: jobData.title,
      responsibilities: jobData.responsibilities,
      mustHaveSkills: jobData.must_have_skills,
      niceToHaveSkills: jobData.nice_to_have_skills,
      experienceExpectations: jobData.experience_expectations,
      nonRequirements: jobData.non_requirements,
      createdAt: new Date(jobData.created_at),
      updatedAt: new Date(jobData.updated_at),
    };

    const safeJobContext = JobContextSchema.parse(jobContext);

    const evaluationResult = await evaluateCandidate(safeJobContext, candidateProfile);

    const { data: profileData, error: profileError } = await supabase
      .from('candidate_profiles')
      .insert({
        full_name: manualName ?? candidateProfile.fullName ?? '',
        email: manualEmail ?? candidateProfile.email ?? '',
        education: candidateProfile.education ?? [],
        experience: candidateProfile.experience ?? [],
        projects: candidateProfile.projects ?? [],
        skills: candidateProfile.skills ?? [],
        collaboration_signals: candidateProfile.collaborationSignals ?? [],
        availability: candidateProfile.availability ?? null,
        other_signals: candidateProfile.otherSignals ?? null,
        raw_cv_text: rawText,
        created_by: user.id,
      })
      .select()
      .single();

    if (profileError) {
      logger.error('Profile insert error', { error: profileError, candidateName: manualName });
      return apiError(profileError, {
        status: 500,
        userMessage: 'Failed to save candidate profile',
      });
    }

    const { data: evalData, error: evalError } = await supabase
      .from('evaluations')
      .insert({
        job_context_id: jobId,
        candidate_id: profileData.id,
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
        confidence_score: Math.round(evaluationResult.confidenceScore * 100),
        confidence_reason: evaluationResult.confidenceReason,
        evaluated_by: user.id,
        ai_model_version: evaluationResult.aiModelVersion,
      })
      .select()
      .single();

    if (evalError) {
      return apiError(evalError, {
        status: 500,
        userMessage: 'Failed to save evaluation',
      });
    }

    return apiSuccess({
      success: true,
      candidateId: profileData.id,
      evaluationId: evalData.id,
    });
  } catch (error) {
    return apiError(error, { status: 500 });
  }
}
