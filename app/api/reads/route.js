import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";

export async function POST(request) {
  try {
    const { postId, ms } = await request.json();
    if (!postId) return Response.json({ error: "postId required" }, { status: 400 });
    await connectToDB();
    await Post.findByIdAndUpdate(postId, { $inc: { reads: 1, readMs: Math.max(0, Number(ms) || 0) } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false }, { status: 400 });
  }
}