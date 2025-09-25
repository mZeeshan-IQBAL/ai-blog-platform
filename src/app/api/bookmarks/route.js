// src/app/api/bookmarks/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { pusherServer } from "@/lib/pusherServer";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();
    
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    // ✅ Find user with full data
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Ensure user has email (critical for MongoDB unique index)
    if (!user.email) {
      user.email = session.user.email || `${session.user.id}@placeholder.com`;
      await user.save();
    }

    // ✅ Add bookmark if not already bookmarked
    if (!user.bookmarks.includes(postId)) {
      user.bookmarks.push(postId);
      await user.save();

      // ✅ Optional: Send bookmark notification to post author
      // You'll need to import Post model and get post author
    }

    return NextResponse.json({ success: true, bookmarked: true });
  } catch (error) {
    console.error("❌ Error adding bookmark:", error);
    return NextResponse.json({ 
      error: "Failed to bookmark post"
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();
    
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Remove from bookmarks array
    user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId.toString());
    await user.save();

    return NextResponse.json({ success: true, bookmarked: false });
  } catch (error) {
    console.error("❌ Error removing bookmark:", error);
    return NextResponse.json({ 
      error: "Failed to remove bookmark"
    }, { status: 500 });
  }
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();
    
    const user = await User.findById(session.user.id).select("bookmarks");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.bookmarks || []);
  } catch (error) {
    console.error("❌ Error getting bookmarks:", error);
    return NextResponse.json({ 
      error: "Failed to load bookmarks"
    }, { status: 500 });
  }
}