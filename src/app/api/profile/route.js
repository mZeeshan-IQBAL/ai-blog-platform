// app/api/profile/route.js
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

    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, bio, website, location } = await request.json();

    await connectToDB();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name,
        bio,
        website,
        location,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}