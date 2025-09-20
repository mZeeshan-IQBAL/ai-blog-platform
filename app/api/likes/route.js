import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { pusherServer } from "@/lib/pusher";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDB();
  const { postId } = await request.json();
  const userId = session.user.id;

  const post = await Post.findById(postId);
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });

  const hasLiked = post.likes.includes(userId);
  if (hasLiked) post.likes.pull(userId);
  else post.likes.push(userId);

  await post.save();
  pusherServer.trigger(`post-${postId}`, "like-update", {
    likes: post.likes.length,
    liked: !hasLiked,
  });

  return Response.json({ likes: post.likes.length, liked: !hasLiked });
}