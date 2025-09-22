// app/api/profile/followers/route.js
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

    await connectToDB();

    // Find users who follow the current user
    const followers = await User.find({ 
      follows: { $in: [session.user.id] } 
    }).select("name email image bio providerId");

    return Response.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    return Response.json({ error: "Failed to fetch followers" }, { status: 500 });
  }
}