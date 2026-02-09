import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type EmailType = 'shortlist' | 'interview' | 'offer' | 'reject';

interface EmailPayload {
  to: string;
  candidateName: string;
  jobTitle: string;
  type: EmailType;
  companyName?: string;
}

const TEMPLATES: Record<EmailType, (data: Omit<EmailPayload, 'to' | 'type'>) => { subject: string; html: string }> = {
  shortlist: ({ candidateName, jobTitle, companyName }) => ({
    subject: `Update regarding your application for ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <p>Dear ${candidateName},</p>
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName || 'our company'}</strong>.</p>
        <p>After a careful review of your application, we are pleased to inform you that you have been advanced to the next stage of our selection process. Your qualifications and experience stood out to our hiring team.</p>
        <p>We will be in touch shortly with further details regarding the next steps.</p>
        <p>Best regards,</p>
        <p><strong>The Hiring Team</strong><br/>${companyName || ''}</p>
      </div>
    `
  }),
  interview: ({ candidateName, jobTitle, companyName }) => ({
    subject: `Interview Invitation from ${companyName || 'us'}: ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <p>Dear ${candidateName},</p>
        <p>We are excited to invite you to interview for the <strong>${jobTitle}</strong> role at <strong>${companyName || 'our company'}</strong>.</p>
        <p>We were impressed by your background and would like to learn more about your experience and discuss how you could contribute to our team.</p>
        <p>Please reply to this email with your availability for a conversation over the next few days, or let us know if you have any questions.</p>
        <p>We look forward to speaking with you.</p>
        <p>Best regards,</p>
        <p><strong>The Hiring Team</strong><br/>${companyName || ''}</p>
      </div>
    `
  }),
  offer: ({ candidateName, jobTitle, companyName }) => ({
    subject: `Offer of Employment: ${jobTitle} at ${companyName || 'us'}`,
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <p>Dear ${candidateName},</p>
        <p>It is with great pleasure that we offer you the position of <strong>${jobTitle}</strong> at <strong>${companyName || 'our company'}</strong>.</p>
        <p>Throughout the interview process, we were consistently impressed with your skills and potential. We are confident that you will be a valuable asset to our team.</p>
        <p>Formal details of this offer will be sent in a separate communication. Please look out for it shortly.</p>
        <p>Congratulations, and we hope to welcome you to the team soon!</p>
        <p>Sincerely,</p>
        <p><strong>The Hiring Team</strong><br/>${companyName || ''}</p>
      </div>
    `
  }),
  reject: ({ candidateName, jobTitle, companyName }) => ({
    subject: `Status of your application for ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <p>Dear ${candidateName},</p>
        <p>Thank you for giving us the opportunity to consider you for the <strong>${jobTitle}</strong> position at <strong>${companyName || 'our company'}</strong>.</p>
        <p>We received many applications from qualified candidates, and after careful consideration, we have decided not to move forward with your application at this time.</p>
        <p>We appreciate the time you invested in applying and wish you the best in your future career endeavors.</p>
        <p>Sincerely,</p>
        <p><strong>The Hiring Team</strong><br/>${companyName || ''}</p>
      </div>
    `
  })
};

export async function sendCandidateEmail(payload: EmailPayload) {
  const { to, type, ...templateData } = payload;
  const { subject, html } = TEMPLATES[type](templateData);

  if (!resend) {
    logger.warn('Mock email send (no RESEND_API_KEY)', { to, subject });
    return { success: true, mocked: true };
  }

  try {
    // FIX: Resend Test Mode Restriction
    // We can ONLY send to the verified email (aibarerzhuman13@gmail.com) when using the free/test tier.
    // We cannot send FROM a gmail address due to DMARC, so we keep onboarding@resend.dev.
    const safeRecipient = 'aibarerzhuman13@gmail.com';
    
    logger.warn(`[TEST MODE] Redirecting email for ${to} to ${safeRecipient} because Resend Test Mode only allows sending to verified address.`, { originalTo: to });

    const data = await resend.emails.send({
      from: 'Acme HR <onboarding@resend.dev>',
      to: [safeRecipient], // Override recipient
      subject: `[TEST for ${to}] ${subject}`, // Add original recipient to subject
      html,
    });
    return { success: true, data };
  } catch (error) {
    logger.error('Error sending email', { error, to });
    return { success: false, error };
  }
}
