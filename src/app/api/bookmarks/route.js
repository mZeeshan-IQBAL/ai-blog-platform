// src/app/api/bookmarks/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import { pusherServer } from "@/lib/pusherServer";
import { sendEmail } from "@/lib/resend";
import { emailTemplates } from "@/lib/emailTemplates";

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

      // ✅ Send bookmark notification to post author
      const post = await Post.findById(postId);
      if (post && String(post.authorId) !== String(session.user.id)) {
        // Find the author by their providerId
        const postAuthor = await User.findOne({ providerId: post.authorId });
        if (postAuthor?.providerId) {
          console.log(`📩 Sending bookmark notification to ${postAuthor.name} (${postAuthor.providerId})`);
          
          // Send push notification
          await pusherServer.trigger(
            `private-user-${postAuthor.providerId}`,
            "notification",
            {
              type: "bookmark",
              fromUser: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image
              },
              extra: {
                postId: postId,
                postTitle: post.title
              },
              createdAt: new Date().toISOString()
            }
          );
          
          // Send email notification
          if (postAuthor.email && postAuthor.emailNotifications !== false && postAuthor.notificationPreferences?.bookmarks !== false) {
            const emailData = emailTemplates.bookmark({
              fromUser: {
                name: session.user.name,
                image: session.user.image,
                id: session.user.id
              },
              post: {
                title: post.title,
                _id: postId
              }
            });
            
            await sendEmail({
              to: postAuthor.email,
              subject: emailData.subject,
              html: emailData.html
            });
          }
        }
      }
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