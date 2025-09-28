// src/app/api/moderation/post-status/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });
  await connectToDB();
  const { postId, status, flags = [] } = await request.json();
  if (!postId || !status) return Response.json({ error: "postId and status required" }, { status: 400 });
  if (!["ok", "flagged", "removed"].includes(status)) return Response.json({ error: "Invalid status" }, { status: 400 });

  const post = await Post.findByIdAndUpdate(postId, { moderation: { status, flags } }, { new: true });
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });

  await logAudit({ actorId: session.user.providerId, action: "POST_STATUS", targetType: "post", targetId: String(post._id), meta: { status, flags } });

  // Revalidate affected pages
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);

  return Response.json({ ok: true, post });
}
