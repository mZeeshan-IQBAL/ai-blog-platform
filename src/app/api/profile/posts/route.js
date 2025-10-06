// app/api/profile/posts/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const posts = await Post.find({ authorId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Backfill author fields from current user profile to avoid stale/empty post.authorImage
    let userProfile = null;
    try {
      userProfile = await User.findById(session.user.id).select("name image").lean();
    } catch (_) {}

    // Format posts for BlogCard component
    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      _id: post._id.toString(),
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.summary || (post.content ? post.content.substring(0, 150) + "..." : ""),
      category: post.category,
      tags: post.tags,
      coverImage: post.coverImage || "/images/placeholder.jpg",
      authorName: post.authorName || userProfile?.name || session.user.name || "Anonymous",
      authorImage: post.authorImage || userProfile?.image || session.user.image || "/images/placeholder.jpg",
      authorId: post.authorId,
      likes: Array.isArray(post.likes) ? post.likes.length : post.likes || 0,
      comments: Array.isArray(post.comments) ? post.comments.length : 0,
      views: post.views || 0,
      createdAt: post.createdAt
    }));

    return Response.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}