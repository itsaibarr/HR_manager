import { createClient } from '@/lib/supabase/server';
import { CandidateProfileSchema } from '@/types/schemas';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess } from '@/lib/api/error-handler';
import type { Database } from '@/types/database';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function POST(request: Request) {
  try {
    const supabase: SupabaseClient = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(null, { status: 401, userMessage: 'Unauthorized' });
    }

    const body = await request.json();
    const validatedData = CandidateProfileSchema.omit({
      id: true,
      createdAt: true,
    }).parse(body);

    const { data, error } = await supabase
      .from('candidate_profiles')
      .insert({
        external_id: validatedData.externalId,
        education: validatedData.education as Database['public']['Tables']['candidate_profiles']['Insert']['education'],
        experience: validatedData.experience as Database['public']['Tables']['candidate_profiles']['Insert']['experience'],
        projects: validatedData.projects as Database['public']['Tables']['candidate_profiles']['Insert']['projects'],
        skills: validatedData.skills,
        collaboration_signals: validatedData.collaborationSignals,
        availability: validatedData.availability as Database['public']['Tables']['candidate_profiles']['Insert']['availability'],
        other_signals: validatedData.otherSignals as Database['public']['Tables']['candidate_profiles']['Insert']['other_signals'],
        raw_cv_text: validatedData.rawCvText,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return apiError(error, {
        status: 500,
        userMessage: 'Failed to create candidate profile',
      });
    }

    return apiSuccess(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(error);
    }
    return apiError(error, { status: 500 });
  }
}

const DeleteParamsSchema = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
});

export async function DELETE(request: Request) {
  try {
    const supabase: SupabaseClient = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(null, { status: 401, userMessage: 'Unauthorized' });
    }

    const { searchParams } = new URL(request.url);
    const parsed = DeleteParamsSchema.safeParse({
      jobId: searchParams.get('jobId'),
      candidateId: searchParams.get('candidateId'),
    });

    if (!parsed.success) {
      return apiError(parsed.error);
    }

    const { jobId, candidateId } = parsed.data;

    const { data: job } = await supabase
      .from('job_contexts')
      .select('id')
      .eq('id', jobId)
      .eq('created_by', user.id)
      .single();

    if (!job) {
      return apiError(null, { status: 404, userMessage: 'Job not found' });
    }

    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('job_context_id', jobId)
      .eq('candidate_id', candidateId);

    if (error) {
      return apiError(error, {
        status: 500,
        userMessage: 'Failed to delete evaluation',
      });
    }

    return apiSuccess({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(error);
    }
    return apiError(error, { status: 500 });
  }
}
