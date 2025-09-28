// src/app/api/moderation/block-user/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { logAudit } from "@/lib/audit";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  await connectToDB();
  const { userId, block, reason = "" } = await request.json();
  if (!userId) return Response.json({ error: "userId required" }, { status: 400 });

  const user = await User.findById(userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  user.blocked = !!block;
  user.blockReason = block ? reason : "";
  user.blockedAt = block ? new Date() : null;
  await user.save();

  await logAudit({
    actorId: session.user.providerId,
    action: block ? "BLOCK_USER" : "UNBLOCK_USER",
    targetType: "user",
    targetId: String(user._id),
    meta: { reason },
  });

  return Response.json({ ok: true });
}
