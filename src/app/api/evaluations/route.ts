import { createClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/api/error-handler';
import { z } from 'zod';

const QuerySchema = z.object({
  jobContextId: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(null, { status: 401, userMessage: 'Unauthorized' });
    }

    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      jobContextId: searchParams.get('jobContextId') ?? undefined,
      candidateId: searchParams.get('candidateId') ?? undefined,
    });

    if (!parsed.success) {
      return apiError(parsed.error);
    }

    const { jobContextId, candidateId } = parsed.data;

    const { data: userJobs } = await supabase
      .from('job_contexts')
      .select('id')
      .eq('created_by', user.id);
    const jobIds = (userJobs ?? []).map((j) => j.id);
    if (jobIds.length === 0) {
      return apiSuccess([]);
    }

    let query = supabase
      .from('evaluations')
      .select(`
        *,
        job_contexts (
          title
        ),
        candidate_profiles (
          external_id
        )
      `)
      .in('job_context_id', jobIds)
      .order('created_at', { ascending: false });

    if (jobContextId) {
      if (!jobIds.includes(jobContextId)) {
        return apiSuccess([]);
      }
      query = query.eq('job_context_id', jobContextId);
    }

    if (candidateId) {
      query = query.eq('candidate_id', candidateId);
    }

    const { data, error } = await query;

    if (error) {
      return apiError(error, {
        status: 500,
        userMessage: 'Failed to fetch evaluations',
      });
    }

    return apiSuccess(data ?? []);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(error);
    }
    return apiError(error, { status: 500 });
  }
}
