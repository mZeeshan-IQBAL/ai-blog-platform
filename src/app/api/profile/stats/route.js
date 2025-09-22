// app/api/profile/stats/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get user
    const user = await User.findOne({ providerId: session.user.id });
    
    // Get user's posts
    const posts = await Post.find({ authorId: session.user.id });
    
    // Calculate stats
    const stats = {
      posts: posts.length,
      followers: user?.followers?.length || 0,
      following: user?.follows?.length || 0,
      totalLikes: posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0),
      totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      bookmarks: user?.bookmarks?.length || 0
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}