'use server'

import { createClient } from '@/lib/supabase/server';
import { sendCandidateEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export type UpdateStatusResult = {
  success: boolean;
  message: string;
  emailSent?: boolean;
};

export async function updateCandidateStatus(
  evaluationId: string, 
  newStatus: 'shortlisted' | 'interviewing' | 'offered' | 'rejected' | 'pending',
  jobId: string,
  shouldSendEmail: boolean = true
): Promise<UpdateStatusResult> {
  const supabase = await createClient();
  
  try {
    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    // 2. Update Status
    const { error: updateError } = await supabase
      .from('evaluations')
      .update({ status: newStatus })
      .eq('id', evaluationId);

    if (updateError) {
      logger.error('Failed to update status', { evaluationId, newStatus, error: updateError });
      return { success: false, message: 'Failed to update status' };
    }

    // 3. Send Email (if applicable)
    let emailResult = { success: false, reason: '' };
    
    if (shouldSendEmail && newStatus !== 'pending') {
      // Fetch necessary data for email
      const { data: evaluation, error: fetchError } = await supabase
        .from('evaluations')
        .select(`
          candidate_id,
          candidate_profiles (
            full_name,
            email
          ),
          job_contexts (
            title
          )
        `)
        .eq('id', evaluationId)
        .single();

      if (fetchError || !evaluation || !evaluation.candidate_profiles || !evaluation.job_contexts) {
        logger.warn('Could not fetch data for email', { evaluationId, error: fetchError });
        return { success: true, message: 'Status updated, but failed to fetch candidate details for email.', emailSent: false };
      }

      const { email, full_name } = evaluation.candidate_profiles;
      const { title: jobTitle } = evaluation.job_contexts;

      if (!email || !email.includes('@')) {
         logger.warn('Skipping email: Candidate has no valid email address', { candidateId: evaluation.candidate_id });
         return { 
             success: true, 
             message: 'Status updated. Email NOT sent because candidate has no email address.', 
             emailSent: false 
         };
      }

      // Map status to email type
      let emailType: 'shortlist' | 'interview' | 'offer' | 'reject' | null = null;
      if (newStatus === 'shortlisted') emailType = 'shortlist';
      if (newStatus === 'interviewing') emailType = 'interview';
      if (newStatus === 'offered') emailType = 'offer';
      if (newStatus === 'rejected') emailType = 'reject';

      if (emailType) {
        // @ts-ignore
        const res = await sendCandidateEmail({
          to: email,
          candidateName: full_name || 'Candidate',
          jobTitle: jobTitle || 'Job Role',
          type: emailType,
        });
        
        emailResult = { success: res.success, reason: res.success ? 'Sent' : 'Failed' };
        
        if (!res.success) {
            logger.error('Email sending failed', { error: res.error });
        }
      }
    }

    revalidatePath(`/dashboard/${jobId}`);
    
    if (shouldSendEmail && newStatus !== 'pending' && !emailResult.success) {
        return { success: true, message: 'Status updated, but email failed to send. Check server logs.' };
    }

    return { 
      success: true, 
      message: emailResult.success 
        ? `Status updated to ${newStatus} and email sent.` 
        : `Status updated to ${newStatus}.`,
      emailSent: emailResult.success
    };

  } catch (error) {
    logger.error('Unexpected error in updateCandidateStatus', { error });
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function deleteCandidates(candidateIds: string[], jobId: string): Promise<UpdateStatusResult> {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, message: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('evaluations')
            .delete()
            .in('candidate_id', candidateIds)
            .eq('job_context_id', jobId);

        if (error) {
            logger.error('Failed to delete candidates', { candidateIds, jobId, error });
            return { success: false, message: 'Failed to delete candidates' };
        }

        revalidatePath(`/dashboard/${jobId}`);
        return { success: true, message: `Successfully deleted ${candidateIds.length} candidates` };
    } catch (error) {
        logger.error('Unexpected error deleting candidates', { error });
        return { success: false, message: 'An unexpected error occurred' };
    }
}

export async function bulkUpdateCandidateStatus(
    candidateIds: string[],
    newStatus: 'shortlisted' | 'interviewing' | 'offered' | 'rejected' | 'pending',
    jobId: string,
    shouldSendEmail: boolean = false
): Promise<UpdateStatusResult> {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        // 1. Update Status
        const { error } = await supabase
            .from('evaluations')
            .update({ status: newStatus })
            .in('candidate_id', candidateIds)
            .eq('job_context_id', jobId);

        if (error) {
            logger.error('Failed to update candidates in bulk', { candidateIds, newStatus, error });
            return { success: false, message: 'Failed to update candidates in bulk' };
        }

        // 2. Send Emails (if requested)
        let emailCount = 0;
        if (shouldSendEmail && newStatus !== 'pending') {
             const { data: evaluations, error: fetchError } = await supabase
                .from('evaluations')
                .select(`
                    candidate_id,
                    candidate_profiles (
                        full_name,
                        email
                    ),
                    job_contexts (
                        title
                    )
                `)
                .in('candidate_id', candidateIds)
                .eq('job_context_id', jobId);

            if (!fetchError && evaluations) {
                // Map status to email type
                let emailType: 'shortlist' | 'interview' | 'offer' | 'reject' | null = null;
                if (newStatus === 'shortlisted') emailType = 'shortlist';
                if (newStatus === 'interviewing') emailType = 'interview';
                if (newStatus === 'offered') emailType = 'offer';
                if (newStatus === 'rejected') emailType = 'reject';

                if (emailType) {
                    const emailPromises = evaluations.map(async (ev) => {
                        const profile = ev.candidate_profiles as { email: string | null; full_name: string | null } | null;
                        const job = ev.job_contexts as { title: string | null } | null;
                        
                        if (!profile || !job) return false;
                        
                        const { email, full_name } = profile;
                        const { title: jobTitle } = job;
                        
                        if (email && email.includes('@')) {
                            const res = await sendCandidateEmail({
                                to: email,
                                candidateName: full_name || 'Candidate',
                                jobTitle: jobTitle || 'Job Role',
                                type: emailType!,
                            });
                            return res.success;
                        }
                        return false;
                    });

                    const results = await Promise.all(emailPromises);
                    emailCount = results.filter(Boolean).length;
                }
            }
        }

        revalidatePath(`/dashboard/${jobId}`);
        
        let message = `Successfully updated ${candidateIds.length} candidates to ${newStatus}`;
        if (shouldSendEmail) {
            message += `. Emailed ${emailCount} candidates.`;
        }

        return { success: true, message };
    } catch (error) {
        logger.error('Unexpected error in bulk update', { error });
        return { success: false, message: 'An unexpected error occurred' };
    }
}
