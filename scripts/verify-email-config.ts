
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verify() {
  const key = process.env.RESEND_API_KEY;
  
  if (!key) {
    console.error('❌ ERROR: RESEND_API_KEY is missing from .env');
    process.exit(1);
  }

  console.log(`✅ Found RESEND_API_KEY: ${key.substring(0, 5)}...`);

  if (key.startsWith('re_123')) {
      console.warn('⚠️ WARNING: Key looks like a placeholder/example key.');
  }

  const resend = new Resend(key);

  try {
    console.log('📧 Attempting to send test email...');
    const data = await resend.emails.send({
      from: 'Acme HR <onboarding@resend.dev>',
      to: 'delivered@resend.dev', // safe test address
      subject: 'Test Email from HR Manager MVP',
      html: '<p>This is a test email to verify configuration.</p>'
    });

    if (data.error) {
        console.error('❌ Send Failed:', data.error);
        process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('ID:', data.data?.id);
    process.exit(0);

  } catch (error) {
    console.error('❌ Exception:', error);
    process.exit(1);
  }
}

verify();
