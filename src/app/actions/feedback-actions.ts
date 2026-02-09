'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(
  evaluationId: string,
  agreement: 'agree' | 'disagree',
  note: string | null
) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('candidate_feedback')
      .insert({
        evaluation_id: evaluationId,
        agreement,
        note
      })

    if (error) {
      console.error('Error submitting feedback:', error)
      return { success: false, message: 'Failed to submit feedback' }
    }

    revalidatePath('/dashboard')
    return { success: true, message: 'Feedback submitted successfully' }
  } catch (e) {
    console.error('Unexpected error submitting feedback:', e)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
