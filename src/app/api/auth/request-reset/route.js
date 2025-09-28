// src/app/api/auth/request-reset/route.js
export const dynamic = "force-dynamic";

import crypto from "crypto";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/resend";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return Response.json({ error: "Email is required" }, { status: 400 });

    await connectToDB();
    const user = await User.findOne({ email });

    // Always respond success to avoid user enumeration
    if (!user) {
      return Response.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await user.save();

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 30 minutes.</p>`
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error("request-reset error", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
