'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

export async function submitFeedback(
  evaluationId: string,
  agreement: 'agree' | 'disagree',
  note: string | null
) {
  if (!evaluationId || typeof evaluationId !== 'string') {
    return { success: false, message: 'Invalid evaluation ID' }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('candidate_feedback')
      .insert({
        evaluation_id: evaluationId,
        agreement,
        note: note?.slice(0, 2000) ?? null
      })

    if (error) {
      logger.error('Error submitting feedback', { error, evaluationId })
      return { success: false, message: 'Failed to submit feedback' }
    }

    revalidatePath('/dashboard')
    return { success: true, message: 'Feedback submitted successfully' }
  } catch (e) {
    logger.error('Unexpected error submitting feedback', { error: e, evaluationId })
    return { success: false, message: 'An unexpected error occurred' }
  }
}
