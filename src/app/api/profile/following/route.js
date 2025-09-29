// app/api/profile/following/route.js
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

    const user = await User.findById(session.user.id).lean();
    if (!user || !Array.isArray(user.follows) || user.follows.length === 0) {
      return Response.json([]);
    }

    // Get users that current user follows (by _id)
    const followingUsers = await User.find({ 
      _id: { $in: user.follows }
    }).select("_id name email image bio").lean();

    const results = await Promise.all(
      followingUsers.map(async (u) => {
        const postsCount = await Post.countDocuments({ authorId: String(u._id) });
        return {
          id: String(u._id),
          name: u.name,
          email: u.email,
          image: u.image,
          bio: u.bio,
          postsCount,
        };
      })
    );

    return Response.json(results);
  } catch (error) {
    console.error("Error fetching following:", error);
    return Response.json({ error: "Failed to fetch following" }, { status: 500 });
  }
}
