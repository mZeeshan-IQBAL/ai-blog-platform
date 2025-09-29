// app/api/profile/followers/route.js
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

    // Find users who follow the current user (by _id)
    const followers = await User.find({ 
      follows: { $in: [session.user.id] }
    }).select("_id name email image bio").lean();

    // Compute posts count for each follower
    const results = await Promise.all(
      followers.map(async (u) => {
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
    console.error("Error fetching followers:", error);
    return Response.json({ error: "Failed to fetch followers" }, { status: 500 });
  }
}
