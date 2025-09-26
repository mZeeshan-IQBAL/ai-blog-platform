// src/app/api/settings/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();
    
    const user = await User.findById(session.user.id).select(
      "emailNotifications notificationPreferences"
    );
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure default values if not set
    const settings = {
      emailNotifications: user.emailNotifications ?? true,
      notificationPreferences: {
        likes: user.notificationPreferences?.likes ?? true,
        comments: user.notificationPreferences?.comments ?? true,
        bookmarks: user.notificationPreferences?.bookmarks ?? true,
        follows: user.notificationPreferences?.follows ?? true,
      }
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error("❌ Settings GET error:", error);
    return NextResponse.json({ 
      error: "Failed to load settings"
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();
    
    const body = await request.json();
    const { emailNotifications, notificationPreferences } = body;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update settings
    if (typeof emailNotifications === 'boolean') {
      user.emailNotifications = emailNotifications;
    }

    if (notificationPreferences && typeof notificationPreferences === 'object') {
      // Ensure notificationPreferences object exists
      if (!user.notificationPreferences) {
        user.notificationPreferences = {};
      }

      // Update each preference if provided
      if (typeof notificationPreferences.likes === 'boolean') {
        user.notificationPreferences.likes = notificationPreferences.likes;
      }
      if (typeof notificationPreferences.comments === 'boolean') {
        user.notificationPreferences.comments = notificationPreferences.comments;
      }
      if (typeof notificationPreferences.bookmarks === 'boolean') {
        user.notificationPreferences.bookmarks = notificationPreferences.bookmarks;
      }
      if (typeof notificationPreferences.follows === 'boolean') {
        user.notificationPreferences.follows = notificationPreferences.follows;
      }

      // Mark the nested object as modified
      user.markModified('notificationPreferences');
    }

    await user.save();

    console.log(`✅ Updated notification settings for user ${user.name}:`, {
      emailNotifications: user.emailNotifications,
      notificationPreferences: user.notificationPreferences
    });

    return NextResponse.json({ 
      success: true,
      settings: {
        emailNotifications: user.emailNotifications,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    console.error("❌ Settings PATCH error:", error);
    return NextResponse.json({ 
      error: "Failed to update settings"
    }, { status: 500 });
  }
}