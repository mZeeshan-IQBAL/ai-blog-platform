// app/api/profile/following/route.js
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

    await connectToDB();

    const user = await User.findOne({ providerId: session.user.id });
    if (!user || !user.follows) {
      return Response.json([]);
    }

    // Get users that current user follows
    const following = await User.find({ 
      providerId: { $in: user.follows } 
    }).select("name email image bio providerId");

    return Response.json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    return Response.json({ error: "Failed to fetch following" }, { status: 500 });
  }
}