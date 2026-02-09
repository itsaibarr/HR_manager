import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { parseJobDescription } from '@/lib/ai/parser';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Build update object from allowed fields
    const updateData: Record<string, any> = {};
    
    // Check if we need to re-parse the description
    if (body.original_description) {
        // Fetch user profile for AI Config
        const { data: profile } = await supabase
            .from('profiles')
            .select('ai_config')
            .eq('id', user.id)
            .single();
            
        const aiConfig = profile?.ai_config as any;
        const config = aiConfig ? { provider: aiConfig.provider, apiKey: aiConfig.keys[aiConfig.provider] } : undefined;
        
        // Use existing title if not provided in update
        let titleToUse = body.title;
        if (!titleToUse) {
            const { data: existingJob } = await supabase
                .from('job_contexts')
                .select('title')
                .eq('id', id)
                .single();
            titleToUse = existingJob?.title || "Job Role";
        }
        
        const parsedData = await parseJobDescription(titleToUse, body.original_description, config);
        
        // Update requirements based on new description
        updateData.responsibilities = parsedData.responsibilities;
        updateData.must_have_skills = parsedData.mustHaveSkills;
        updateData.nice_to_have_skills = parsedData.niceToHaveSkills;
        updateData.experience_expectations = parsedData.experienceExpectations;
        updateData.non_requirements = parsedData.nonRequirements;
    }

    if (body.title !== undefined) updateData.title = body.title;
    if (body.original_description !== undefined) updateData.original_description = body.original_description;
    // Allow manual overrides if provided specifically in the same request, otherwise they are set by parser above
    if (body.responsibilities !== undefined) updateData.responsibilities = body.responsibilities;
    if (body.must_have_skills !== undefined) updateData.must_have_skills = body.must_have_skills;
    if (body.nice_to_have_skills !== undefined) updateData.nice_to_have_skills = body.nice_to_have_skills;
    if (body.non_requirements !== undefined) updateData.non_requirements = body.non_requirements;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('job_contexts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update job context' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First delete related evaluations
    const { error: evalError } = await supabase
      .from('evaluations')
      .delete()
      .eq('job_context_id', id);

    if (evalError) {
      console.error('Database error (evaluations):', evalError);
      return NextResponse.json({ error: 'Failed to delete related evaluations' }, { status: 500 });
    }

    // Then delete the job context
    const { error } = await supabase
      .from('job_contexts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete job context' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('job_contexts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Job context not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
