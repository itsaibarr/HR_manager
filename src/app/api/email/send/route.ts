import { NextResponse } from 'next/server';
import { sendCandidateEmail } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { candidateId, type, jobId } = await request.json();

    if (!candidateId || !type || !jobId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch Candidate Email & Name
    const { data: candidate, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('email, full_name')
      .eq('id', candidateId)
      .single() as { data: { email: string | null, full_name: string | null } | null, error: any };

    if (candidateError || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // 2. Fetch Job Title/Company
    const { data: job, error: jobError } = await supabase
      .from('job_contexts')
      .select('title, company_name')
      .eq('id', jobId)
      .single() as { data: { title: string, company_name: string | null } | null, error: any };

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (!candidate.email) {
      return NextResponse.json({ error: 'Candidate has no email' }, { status: 400 });
    }

    // 3. Send Email
    const result = await sendCandidateEmail({
      to: candidate.email,
      candidateName: candidate.full_name || 'Candidate',
      jobTitle: job.title,
      companyName: job.company_name || undefined,
      type,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
