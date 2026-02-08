import { createClient } from '@/lib/supabase/server';
import { CandidateProfileSchema } from '@/types/schemas';
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

    // Validate request body
    const validatedData = CandidateProfileSchema.omit({ 
      id: true, 
      createdAt: true 
    }).parse(body);

    const { data, error } = await (supabase as any)
      .from('candidate_profiles')
      .insert({
        external_id: validatedData.externalId,
        education: validatedData.education as any,
        experience: validatedData.experience as any,
        projects: validatedData.projects as any,
        skills: validatedData.skills,
        collaboration_signals: validatedData.collaborationSignals,
        availability: validatedData.availability as any,
        other_signals: validatedData.otherSignals as any,
        raw_cv_text: validatedData.rawCvText,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create candidate profile' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const candidateId = searchParams.get('candidateId');

    if (!jobId || !candidateId) {
      return NextResponse.json({ error: 'Missing jobId or candidateId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('job_context_id', jobId)
      .eq('candidate_id', candidateId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete evaluation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
