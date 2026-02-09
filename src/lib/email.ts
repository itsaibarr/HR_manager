import { Resend } from 'resend';

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
    subject: `Update on your application for ${jobTitle}`,
    html: `
      <p>Hi ${candidateName},</p>
      <p>Thank you for applying to <strong>${companyName || 'our company'}</strong>. We are pleased to inform you that your application for the <strong>${jobTitle}</strong> position has been shortlisted.</p>
      <p>Our team will review your profile in more detail and reach out shortly regarding the next steps.</p>
      <p>Best regards,<br/>The Hiring Team</p>
    `
  }),
  interview: ({ candidateName, jobTitle, companyName }) => ({
    subject: `Interview Invitation: ${jobTitle} at ${companyName || 'us'}`,
    html: `
      <p>Hi ${candidateName},</p>
      <p>We happen to be very impressed by your background! We would love to invite you for an interview for the <strong>${jobTitle}</strong> role.</p>
      <p>Please let us know your availability for the coming week.</p>
      <p>Looking forward to meeting you!</p>
      <p>Best,<br/>The Hiring Team</p>
    `
  }),
  offer: ({ candidateName, jobTitle, companyName }) => ({
    subject: `Offer of Employment: ${jobTitle}`,
    html: `
      <p>Dear ${candidateName},</p>
      <p>We are thrilled to offer you the position of <strong>${jobTitle}</strong> at <strong>${companyName || 'our company'}</strong>!</p>
      <p>We believe you will be a fantastic addition to our team. Details of the offer will follow in a separate document.</p>
      <p>Congratulations!</p>
      <p>Warmly,<br/>The Hiring Team</p>
    `
  }),
  reject: ({ candidateName, jobTitle, companyName }) => ({
    subject: `Update on your application for ${jobTitle}`,
    html: `
      <p>Hi ${candidateName},</p>
      <p>Thank you for giving us the opportunity to review your application for the <strong>${jobTitle}</strong> position.</p>
      <p>While we were impressed with your qualifications, we have decided to move forward with other candidates who arguably match our current needs closer.</p>
      <p>We wish you the best in your job search.</p>
      <p>Sincerely,<br/>The Hiring Team</p>
    `
  })
};

export async function sendCandidateEmail(payload: EmailPayload) {
  const { to, type, ...templateData } = payload;
  const { subject, html } = TEMPLATES[type](templateData);

  // Mock send if no API key
  if (!resend) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Body: ${html}`);
    return { success: true, mocked: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Acme HR <onboarding@resend.dev>', // Default Resend testing domain
      to: [to], // Resend free tier only sends to verified email (usually your own)
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
