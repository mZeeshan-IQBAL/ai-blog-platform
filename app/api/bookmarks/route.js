// app/api/bookmarks/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

// GET /api/bookmarks → return all bookmarks for the logged in user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();

    const user = await User.findOne({ email: session.user.email }).populate({
      path: "bookmarks",
      select: "title slug coverImage createdAt",
    });

    return Response.json(user?.bookmarks || [], { status: 200 });
  } catch (err) {
    console.error("GET /api/bookmarks error:", err);
    return Response.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

// POST /api/bookmarks → add a bookmark
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();
    const { postId } = await request.json();

    if (!postId) {
      return Response.json({ error: "Missing postId" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $addToSet: { bookmarks: post._id } }
    );

    return Response.json({ success: true, postId }, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookmarks error:", err);
    return Response.json({ error: "Failed to add bookmark" }, { status: 500 });
  }
}

// DELETE /api/bookmarks → remove a bookmark
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();
    const { postId } = await request.json();

    if (!postId) {
      return Response.json({ error: "Missing postId" }, { status: 400 });
    }

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { bookmarks: postId } }
    );

    return Response.json({ success: true, postId }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/bookmarks error:", err);
    return Response.json({ error: "Failed to remove bookmark" }, { status: 500 });
  }
}