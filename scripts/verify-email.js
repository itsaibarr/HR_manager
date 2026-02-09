
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

// Manually load .env
const envPath = path.resolve(process.cwd(), '.env');
let apiKey = null;

try {
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/RESEND_API_KEY=(.+)/);
        if (match && match[1]) {
            apiKey = match[1].trim();
        }
    }
} catch (e) {
    console.error('Error reading .env:', e);
}

if (!apiKey) {
    console.error('❌ ERROR: Could not find RESEND_API_KEY in .env file.');
    console.log('Current directory:', process.cwd());
    console.log('Looking for file at:', envPath);
    process.exit(1);
}

console.log(`✅ Found API Key: ${apiKey.substring(0, 5)}...`);

const resend = new Resend(apiKey);

async function send() {
    try {
        console.log('📧 Sending test email...');
        const data = await resend.emails.send({
            from: 'Acme HR <onboarding@resend.dev>',
            to: 'delivered@resend.dev',
            subject: 'Test Email Verification',
            html: '<p>If you see this, the API key works!</p>'
        });

        if (data.error) {
            console.error('❌ API Error:', data.error);
        } else {
            console.log('✅ Success! Email ID:', data.data.id);
        }
    } catch (e) {
        console.error('❌ Exception:', e);
    }
}

send();
