// src/app/api/auth/reset/route.js
export const dynamic = "force-dynamic";

import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return Response.json({ error: "Invalid request" }, { status: 400 });
    if (password.length < 6) return Response.json({ error: "Password too short" }, { status: 400 });

    await connectToDB();
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } });
    if (!user) return Response.json({ error: "Invalid or expired token" }, { status: 400 });

    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return Response.json({ ok: true });
  } catch (e) {
    console.error("reset error", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
