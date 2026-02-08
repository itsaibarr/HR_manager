import { createClient } from '@/lib/supabase/server';
import { JobContextSchema } from '@/types/schemas';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJobDescription } from '@/lib/ai/parser';

export async function POST(request: Request) {
  try {
    const supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Fetch user profile for AI Config
    const { data: profile } = await supabase
        .from('profiles')
        .select('ai_config')
        .eq('id', user.id)
        .single();
    
    // Check if we have a description to parse (or generate from title + short desc)
    let parsedData: any = {};
    if (body.description) {
        const aiConfig = profile?.ai_config as any;
        const config = aiConfig ? { provider: aiConfig.provider, apiKey: aiConfig.keys[aiConfig.provider] } : undefined;
        parsedData = await parseJobDescription(body.title, body.description, config);
    }

    // Merge manual data (if any) with parsed data
    const mergedData = {
        title: body.title,
        responsibilities: body.responsibilities || parsedData.responsibilities || [],
        mustHaveSkills: body.mustHaveSkills || parsedData.mustHaveSkills || [],
        niceToHaveSkills: body.niceToHaveSkills || parsedData.niceToHaveSkills || [],
        experienceExpectations: body.experienceExpectations || parsedData.experienceExpectations || {},
        nonRequirements: body.nonRequirements || parsedData.nonRequirements || []
    };

    // Validate merged request body
    const validatedData = JobContextSchema.pick({
      title: true,
      responsibilities: true,
      mustHaveSkills: true,
      niceToHaveSkills: true,
      experienceExpectations: true,
      nonRequirements: true
    }).parse(mergedData);

    const { data, error } = await (supabase as any)
      .from('job_contexts')
      .insert({
        title: validatedData.title,
        responsibilities: validatedData.responsibilities,
        must_have_skills: validatedData.mustHaveSkills,
        nice_to_have_skills: validatedData.niceToHaveSkills,
        experience_expectations: validatedData.experienceExpectations as any, // Supabase types are JSON
        non_requirements: validatedData.nonRequirements,
        original_description: body.description || null, // Store original JD text
        is_active: true,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to create job context', 
        details: JSON.stringify(error) 
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.flatten() }, { status: 400 });
    }
    console.error('Request error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('job_contexts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch job contexts' }, { status: 500 });
    }

    // Map database snake_case to camelCase if needed, or return as is
    // For simplicity returning as is for now, frontend will handle mapping or we update later
    return NextResponse.json(data);
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
