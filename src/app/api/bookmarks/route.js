// app/api/bookmarks/route.js
import Post from "@/models/Post";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📋 Getting bookmarks for user:", session.user.id);

    await connectToDB();

    // Get user's bookmarked post IDs (you might store these differently)
    const user = await User.findOne({ providerId: session.user.id }).select("bookmarks");
    
    if (!user || !user.bookmarks || user.bookmarks.length === 0) {
      return Response.json([]);
    }

    // Get the actual posts
    const bookmarkedPosts = await Post.find({
      _id: { $in: user.bookmarks }
    }).select("title slug coverImage createdAt category authorName authorImage");

    return Response.json(bookmarkedPosts);
  } catch (error) {
    console.error("❌ Error fetching bookmarks:", error);
    return Response.json({ error: "Failed to fetch bookmarks", details: error.message }, { status: 500 });
  }
}

// Add bookmark
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await request.json();

    await connectToDB();

    await User.findOneAndUpdate(
      { providerId: session.user.id },
      { $addToSet: { bookmarks: postId } },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Error adding bookmark:", error);
    return Response.json({ error: "Failed to add bookmark" }, { status: 500 });
  }
}

// Remove bookmark
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await request.json();

    await connectToDB();

    await User.findOneAndUpdate(
      { providerId: session.user.id },
      { $pull: { bookmarks: postId } }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Error removing bookmark:", error);
    return Response.json({ error: "Failed to remove bookmark" }, { status: 500 });
  }
}