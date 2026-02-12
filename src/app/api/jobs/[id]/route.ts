import { createClient } from '@/lib/supabase/server';
import { parseJobDescription } from '@/lib/ai/parser';
import { apiError, apiSuccess } from '@/lib/api/error-handler';
import { z } from 'zod';
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const JobUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  original_description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  must_have_skills: z.array(z.string()).optional(),
  nice_to_have_skills: z.array(z.string()).optional(),
  non_requirements: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(id);

    const supabase: SupabaseClient = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(null, { status: 401, userMessage: 'Unauthorized' });
    }

    const body = await request.json();
    const parsed = JobUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    if (parsed.original_description) {
      let titleToUse = parsed.title;
      if (!titleToUse) {
        const { data: existingJob } = await supabase
          .from('job_contexts')
          .select('title')
          .eq('id', id)
          .single();
        titleToUse = existingJob?.title ?? 'Job Role';
      }

      const parsedData = await parseJobDescription(titleToUse, parsed.original_description);
      updateData.responsibilities = parsedData.responsibilities;
      updateData.must_have_skills = parsedData.mustHaveSkills;
      updateData.nice_to_have_skills = parsedData.niceToHaveSkills;
      updateData.experience_expectations = parsedData.experienceExpectations;
      updateData.non_requirements = parsedData.nonRequirements;
    }

    if (parsed.title !== undefined) updateData.title = parsed.title;
    if (parsed.original_description !== undefined) updateData.original_description = parsed.original_description;
    if (parsed.responsibilities !== undefined) updateData.responsibilities = parsed.responsibilities;
    if (parsed.must_have_skills !== undefined) updateData.must_have_skills = parsed.must_have_skills;
    if (parsed.nice_to_have_skills !== undefined) updateData.nice_to_have_skills = parsed.nice_to_have_skills;
    if (parsed.non_requirements !== undefined) updateData.non_requirements = parsed.non_requirements;
    if (parsed.is_active !== undefined) updateData.is_active = parsed.is_active;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('job_contexts')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', user.id)
      .select()
      .single();

    if (error || !data) {
      return apiError(error, {
        status: error ? 500 : 404,
        userMessage: error ? 'Failed to update job context' : 'Job context not found',
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    z.string().uuid().parse(id);

    const supabase: SupabaseClient = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(null, { status: 401, userMessage: 'Unauthorized' });
    }

    const { data: job } = await supabase
      .from('job_contexts')
      .select('id')
      .eq('id', id)
      .eq('created_by', user.id)
      .single();

    if (!job) {
      return apiError(null, { status: 404, userMessage: 'Job context not found' });
    }

    const { error: evalError } = await supabase
      .from('evaluations')
      .delete()
      .eq('job_context_id', id);

    if (evalError) {
      return apiError(evalError, {
        status: 500,
        userMessage: 'Failed to delete related evaluations',
      });
    }

    const { error } = await supabase
      .from('job_contexts')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      return apiError(error, {
        status: 500,
        userMessage: 'Failed to delete job context',
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    z.string().uuid().parse(id);

    const supabase: SupabaseClient = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(null, { status: 401, userMessage: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('job_contexts')
      .select('*')
      .eq('id', id)
      .eq('created_by', user.id)
      .single();

    if (error || !data) {
      return apiError(error, {
        status: 404,
        userMessage: 'Job context not found',
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
