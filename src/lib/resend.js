// src/lib/resend.js
import { Resend } from "resend";

let client = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (client) return client;
  client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail({ to, subject, html }) {
  const resend = getClient();
  if (!resend) return { ok: false, skipped: true };
  try {
    await resend.emails.send({ from: "AI Hub <noreply@ai-hub.local>", to, subject, html });
    return { ok: true };
  } catch (e) {
    console.error("Resend error", e);
    return { ok: false };
  }
}
