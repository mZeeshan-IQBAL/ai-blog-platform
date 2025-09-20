import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDB();
  const user = await User.findById(session.user.id).populate({ path: "bookmarks", select: "title slug coverImage createdAt" });
  return Response.json(user.bookmarks || []);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDB();
  const { postId } = await request.json();
  const post = await Post.findById(postId);
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });
  await User.findByIdAndUpdate(session.user.id, { $addToSet: { bookmarks: post._id } });
  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDB();
  const { postId } = await request.json();
  await User.findByIdAndUpdate(session.user.id, { $pull: { bookmarks: postId } });
  return Response.json({ ok: true });
}