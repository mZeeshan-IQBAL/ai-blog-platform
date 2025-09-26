// src/lib/resend.js
import { Resend } from "resend";

let client = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not configured - emails will be skipped");
    return null;
  }
  if (client) return client;
  client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail({ to, subject, html }) {
  console.log(`🔍 SendEmail called with:`, { to, subject: subject.substring(0, 50) + '...' });
  
  // ⚠️ RESEND TESTING MODE: Can only send to zeshansos600@gmail.com
  // For production, verify a domain at resend.com/domains
  if (process.env.NODE_ENV !== 'production') {
    // In development, only send to verified email to avoid 403 errors
    if (to !== 'zeshansos600@gmail.com') {
      console.log(`📫 Email redirect: ${to} -> zeshansos600@gmail.com (testing mode)`);
      to = 'zeshansos600@gmail.com';
    }
  }
  
  const resend = getClient();
  if (!resend) {
    console.log(`📧 Email skipped (no API key): ${subject} to ${to}`);
    return { ok: false, skipped: true };
  }
  
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  
  console.log(`📤 Email details:`);
  console.log(`  - From: ${fromEmail}`);
  console.log(`  - To: ${to}`);
  console.log(`  - Subject: ${subject}`);
  console.log(`  - API Key present: ${process.env.RESEND_API_KEY ? 'Yes' : 'No'}`);
  console.log(`  - API Key starts with: ${process.env.RESEND_API_KEY?.substring(0, 10)}...`);
  
  try {
    console.log(`📧 Attempting to send email via Resend...`);
    
    const emailPayload = { 
      from: fromEmail, 
      to, 
      subject, 
      html 
    };
    
    console.log(`📦 Email payload:`, {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
      htmlLength: emailPayload.html.length
    });
    
    const result = await resend.emails.send(emailPayload);
    
    console.log(`✅ Email sent successfully! Full result:`, result);
    console.log(`📬 Email ID:`, result.data?.id || result.id);
    
    return { ok: true, id: result.data?.id || result.id, fullResult: result };
  } catch (e) {
    console.error("❌ Resend error details:");
    console.error(`  - Error message: ${e.message}`);
    console.error(`  - Error code: ${e.code}`);
    console.error(`  - Error stack: ${e.stack}`);
    console.error(`  - Full error object:`, e);
    
    return { ok: false, error: e.message, errorCode: e.code, fullError: e };
  }
}
