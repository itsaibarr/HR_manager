import { createClient } from '@/lib/supabase/server';
import { JobContextSchema } from '@/types/schemas';

import { z } from 'zod';
import { parseJobDescription } from '@/lib/ai/parser';
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

    // Check if we have a description to parse (uses GEMINI_API_KEY from .env)
    let parsedData: {
      responsibilities?: string[];
      mustHaveSkills?: string[];
      niceToHaveSkills?: string[];
      experienceExpectations?: Record<string, unknown>;
      nonRequirements?: string[];
    } = {};
    if (body.description) {
      parsedData = await parseJobDescription(body.title, body.description);
    }

    // Merge manual data (if any) with parsed data
    const mergedData = {
      title: body.title,
      responsibilities: body.responsibilities ?? parsedData.responsibilities ?? [],
      mustHaveSkills: body.mustHaveSkills ?? parsedData.mustHaveSkills ?? [],
      niceToHaveSkills: body.niceToHaveSkills ?? parsedData.niceToHaveSkills ?? [],
      experienceExpectations: body.experienceExpectations ?? parsedData.experienceExpectations ?? {},
      nonRequirements: body.nonRequirements ?? parsedData.nonRequirements ?? [],
    };

    // Validate merged request body
    const validatedData = JobContextSchema.pick({
      title: true,
      responsibilities: true,
      mustHaveSkills: true,
      niceToHaveSkills: true,
      experienceExpectations: true,
      nonRequirements: true,
    }).parse(mergedData);

    const { data, error } = await supabase
      .from('job_contexts')
      .insert({
        title: validatedData.title,
        responsibilities: validatedData.responsibilities,
        must_have_skills: validatedData.mustHaveSkills,
        nice_to_have_skills: validatedData.niceToHaveSkills,
        experience_expectations: validatedData.experienceExpectations as Database['public']['Tables']['job_contexts']['Insert']['experience_expectations'],
        non_requirements: validatedData.nonRequirements,
        original_description: body.description ?? null,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return apiError(error, {
        status: 500,
        userMessage: 'Failed to create job context',
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

export async function GET() {
  try {
    const supabase: SupabaseClient = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return apiError(null, { status: 401, userMessage: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('job_contexts')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return apiError(error, {
        status: 500,
        userMessage: 'Failed to fetch job contexts',
      });
    }

    return apiSuccess(data ?? []);
  } catch (error) {
    return apiError(error, { status: 500 });
  }
}
