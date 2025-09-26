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
  const resend = getClient();
  if (!resend) {
    console.log(`📧 Email skipped (no API key): ${subject} to ${to}`);
    return { ok: false, skipped: true };
  }
  
  const fromEmail = process.env.EMAIL_FROM || "AI Blog Platform <noreply@resend.dev>";
  
  try {
    console.log(`📧 Sending email: ${subject} to ${to}`);
    const result = await resend.emails.send({ 
      from: fromEmail, 
      to, 
      subject, 
      html 
    });
    console.log(`✅ Email sent successfully:`, result.data?.id);
    return { ok: true, id: result.data?.id };
  } catch (e) {
    console.error("❌ Resend error:", e);
    return { ok: false, error: e.message };
  }
}
