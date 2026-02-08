import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobContextId = searchParams.get('jobContextId');
    const candidateId = searchParams.get('candidateId');

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
      .order('created_at', { ascending: false });

    if (jobContextId) {
      query = query.eq('job_context_id', jobContextId);
    }

    if (candidateId) {
      query = query.eq('candidate_id', candidateId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch evaluations' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
