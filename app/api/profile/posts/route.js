// app/api/profile/posts/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";

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
      coverImage: post.coverImage,
      authorName: post.authorName,
      authorImage: post.authorImage,
      authorId: post.authorId,
      likes: post.likes,
      comments: post.comments,
      views: post.views,
      createdAt: post.createdAt
    }));

    return Response.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}