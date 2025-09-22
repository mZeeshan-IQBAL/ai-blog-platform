// app/api/follow/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json([], { status: 200 });
    
    console.log("📋 Getting follows for user:", session.user.id);
    
    await connectToDB();
    
    const user = await User.findOne({ providerId: session.user.id }).select("follows");
    const follows = user?.follows || [];
    
    console.log("📋 User follows:", follows);
    return Response.json(follows.map(String));
  } catch (error) {
    console.error("❌ Error fetching follows:", error);
    return Response.json({ error: "Failed to fetch follows", details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    await connectToDB();
    
    const { userId } = await request.json();
    
    if (userId === session.user.id) {
      return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    console.log("👤 Following user:", userId, "by:", session.user.id);

    // Ensure current user exists - use upsert but handle duplicates properly
    let user = await User.findOne({ providerId: session.user.id });
    
    if (!user) {
      // Check if user exists with this email
      const existingUser = await User.findOne({ email: session.user.email });
      
      if (existingUser) {
        // Update existing user
        user = await User.findOneAndUpdate(
          { email: session.user.email },
          {
            name: session.user.name,
            image: session.user.image || "",
            provider: "google",
            providerId: session.user.id,
            updatedAt: new Date(),
          },
          { new: true }
        );
      } else {
        // Create new user
        user = await User.create({
          name: session.user.name,
          email: session.user.email,
          image: session.user.image || "",
          provider: "google",
          providerId: session.user.id,
        });
      }
    }

    // Add to follows list
    const result = await User.findOneAndUpdate(
      { providerId: session.user.id },
      { $addToSet: { follows: userId } },
      { new: true }
    );

    console.log("✅ Follow successful. User now follows:", result?.follows?.length || 0, "users");
    return Response.json({ ok: true, followsCount: result?.follows?.length || 0 });
  } catch (error) {
    console.error("❌ Error following user:", error);
    return Response.json({ error: "Failed to follow user", details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    
    await connectToDB();
    
    const { userId } = await request.json();
    
    console.log("👤 Unfollowing user:", userId, "by:", session.user.id);
    
    const result = await User.findOneAndUpdate(
      { providerId: session.user.id },
      { $pull: { follows: userId } },
      { new: true }
    );

    console.log("✅ Unfollow successful. User now follows:", result?.follows?.length || 0, "users");
    return Response.json({ ok: true, followsCount: result?.follows?.length || 0 });
  } catch (error) {
    console.error("❌ Error unfollowing user:", error);
    return Response.json({ error: "Failed to unfollow user", details: error.message }, { status: 500 });
  }
}