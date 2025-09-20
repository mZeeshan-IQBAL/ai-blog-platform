import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Comment from "@/models/Comment";
import { pusherServer } from "@/lib/pusher";
import { CommentCreateSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";
import Post from "@/models/Post";
import { sendEmail } from "@/lib/resend";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Basic per-IP rate limit for comment creation
  const ip = request.headers.get("x-forwarded-for") || "local";
  const allowed = await rateLimit({ key: `comment:${ip}`, limit: 10, windowSec: 60 });
  if (!allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  await connectToDB();
  const body = await request.json();
  const parsed = CommentCreateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  const { content, postId, parentComment } = parsed.data;

  const comment = new Comment({ content, author: session.user.id, post: postId, parentComment });
  await comment.save();
  await comment.populate("author", "name image");

  // Notify post author via email (best-effort, only if RESEND_API_KEY present)
  try {
    const post = await (await Post.findById(postId).populate("author", "email name slug title")).toObject();
    const authorId = post?.author?._id?.toString?.();
    const to = post?.author?.email;
    if (to && authorId && authorId !== String(session.user.id)) {
      const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
      await sendEmail({
        to,
        subject: `New comment on: ${post.title}`,
        html: `<p>Hi ${post.author.name || "there"},</p>
<p>You have a new comment on <strong>${post.title}</strong>.</p>
<p>${comment.content}</p>
<p><a href="${base}/blog/${post.slug}">View the discussion</a></p>`,
      });
    }
  } catch (e) {
    console.warn("Email notify failed", e?.message);
  }

  pusherServer.trigger(`post-${postId}`, "new-comment", { comment });
  return Response.json(comment, { status: 201 });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  if (!postId) return Response.json({ error: "postId required" }, { status: 400 });

  await connectToDB();
  const comments = await Comment.find({ post: postId })
    .populate("author", "name image")
    .sort({ createdAt: -1 })
    .lean();

  return Response.json(comments);
}
