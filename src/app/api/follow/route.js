// src/app/api/follow/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { pusherServer } from "@/lib/pusherServer";
import { sendEmail } from "@/lib/resend";
import { emailTemplates } from "@/lib/emailTemplates";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("targetUserId");

    if (!targetUserId) {
      // Return all follows IDs if no target specified
      const user = await User.findById(session.user.id).select("follows");
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user.follows || []);
    }

    // Validate targetUserId format
    if (!/^[0-9a-fA-F]{24}$/.test(targetUserId)) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Use "follows" instead of "following"
    const isFollowing = user.follows.some(id => id.toString() === targetUserId.toString());
    
    return NextResponse.json({ isFollowing });
  } catch (error) {
    console.error("❌ Follow GET error:", error);
    return NextResponse.json({ 
      error: "Failed to load follow status"
    }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDB();
    
    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(targetUserId)) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Ensure user has email to prevent MongoDB duplicate key error
    if (!user.email) {
      user.email = session.user.email || `${session.user.id}@placeholder.com`;
      await user.save();
    }

    // ✅ Use "follows" instead of "following"
    if (!user.follows.includes(targetUserId)) {
      user.follows.push(targetUserId);
      await user.save();

        // ✅ Trigger follow notification
        const targetUser = await User.findById(targetUserId);
        if (targetUser?.providerId && targetUser.providerId !== session.user.id) {
          console.log(`📩 Sending follow notification to ${targetUser.name} (${targetUser.providerId})`);
          
          // Send push notification
          await pusherServer.trigger(
            `private-user-${targetUser.providerId}`,
            "notification",
            {
              type: "follow",
              fromUser: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image
              },
              createdAt: new Date().toISOString()
            }
          );
          
          // Send email notification
          if (targetUser.email && targetUser.emailNotifications !== false && targetUser.notificationPreferences?.follows !== false) {
            const emailData = emailTemplates.follow({
              fromUser: {
                name: session.user.name,
                image: session.user.image,
                id: session.user.id
              }
            });
            
            await sendEmail({
              to: targetUser.email,
              subject: emailData.subject,
              html: emailData.html
            });
          }
        } else {
          console.log(`❌ Could not send follow notification. Target user: ${targetUser?.name}, providerId: ${targetUser?.providerId}`);
        }
    }

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    console.error("❌ Follow POST error:", error);
    return NextResponse.json({ 
      error: "Failed to follow user"
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
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(targetUserId)) {
      return NextResponse.json({ error: "Invalid userId format" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Remove from follows array
    user.follows = user.follows.filter(id => id.toString() !== targetUserId.toString());
    await user.save();

    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    console.error("❌ Follow DELETE error:", error);
    return NextResponse.json({ 
      error: "Failed to unfollow user"
    }, { status: 500 });
  }
}