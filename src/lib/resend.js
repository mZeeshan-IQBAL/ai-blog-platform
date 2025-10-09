// src/lib/resend.js
import { Resend } from "resend";

const DEBUG = process.env.DEBUG === 'true';

let client = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) {
    if (DEBUG) console.warn("⚠️ RESEND_API_KEY not configured - emails will be skipped");
    return null;
  }
  if (client) return client;
  client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail({ to, subject, html }) {
  if (DEBUG) {
    console.log('🔍 sendEmail called', { to, subject: (subject || '').substring(0, 50) + '...' });
  }

  // Optional dev redirect to a configured address only (no hardcoded personal email)
  if (process.env.NODE_ENV !== 'production') {
    const devRedirect = process.env.RESEND_DEV_REDIRECT_TO;
    if (devRedirect && to !== devRedirect) {
      if (DEBUG) console.log(`📫 Email redirect (dev): ${to} -> ${devRedirect}`);
      to = devRedirect;
    }
  }

  const resend = getClient();
  if (!resend) {
    if (DEBUG) console.log(`📧 Email skipped (no API key): ${subject} to ${to}`);
    return { ok: false, skipped: true };
  }

  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

  if (DEBUG) {
    console.log('📤 Email details:', { from: fromEmail, to, subject });
  }

  try {
    const emailPayload = { from: fromEmail, to, subject, html };
    const result = await resend.emails.send(emailPayload);

    if (DEBUG) {
      console.log('✅ Email sent', { id: result.data?.id || result.id });
    }

    return { ok: true, id: result.data?.id || result.id };
  } catch (e) {
    console.error('❌ Resend error:', e?.message || e);
    if (DEBUG && e?.stack) console.error('Stack:', e.stack);
    return { ok: false, error: e?.message, errorCode: e?.code };
  }
}
