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

    // Get current user by _id (not providerId)
    const user = await User.findById(session.user.id).lean();

    // Get user's posts
    const posts = await Post.find({ authorId: session.user.id }).lean();

    // Followers = number of users whose 'follows' array contains this user's _id
    const followersCount = await User.countDocuments({ follows: session.user.id });

    // Calculate total likes from reactions of type 'like'
    const totalLikes = posts.reduce((sum, post) => {
      const reactions = post.reactions || [];
      const likeCount = reactions.filter((r) => r.type === "like").length;
      return sum + likeCount;
    }, 0);

    // Calculate stats
    const stats = {
      posts: posts.length,
      followers: followersCount,
      following: user?.follows?.length || 0,
      totalLikes,
      totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      bookmarks: user?.bookmarks?.length || 0,
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
