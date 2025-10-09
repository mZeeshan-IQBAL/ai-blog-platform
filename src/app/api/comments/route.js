// src/app/api/comments/route.js
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { pusherServer } from "@/lib/pusherServer";
import { sendEmail } from "@/lib/resend";
import { emailTemplates } from "@/lib/emailTemplates";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) return Response.json({ error: "postId required" }, { status: 400 });

    await connectToDB();
    const comments = await Comment.find({ post: postId, status: "approved" })
      .populate("author", "name image providerId")
      .sort({ createdAt: -1 });

    return Response.json(comments);
  } catch (e) {
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();
    const { postId, content } = await request.json();
    const providerId = session.user.providerId;
    const post = await Post.findById(postId);
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const user = await User.findOne({ providerId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });
    if (user.blocked) return Response.json({ error: "User is blocked" }, { status: 403 });
    
    // Check subscription limits for comments
    const subscription = user.subscription;
    const commentsToday = subscription.usage?.commentsToday || 0;
    const maxCommentsPerDay = subscription.plan === 'free' ? 10 : 
                             subscription.plan === 'starter' ? 50 : 
                             subscription.plan === 'pro' ? 200 : -1;
    
    if (maxCommentsPerDay !== -1 && commentsToday >= maxCommentsPerDay) {
      return Response.json({ 
        error: `Daily comment limit reached. Your ${subscription.plan} plan allows ${maxCommentsPerDay} comments per day.`,
        upgradeRequired: true,
        currentPlan: subscription.plan,
        resetTime: "24 hours"
      }, { status: 429 });
    }
    
    // Check content length limits
    const maxContentLength = subscription.plan === 'free' ? 500 : 
                            subscription.plan === 'starter' ? 1000 : 
                            subscription.plan === 'pro' ? 2000 : 5000;
    
    if (content.length > maxContentLength) {
      return Response.json({ 
        error: `Comment too long. Your ${subscription.plan} plan allows maximum ${maxContentLength} characters per comment.`,
        upgradeRequired: true,
        currentPlan: subscription.plan
      }, { status: 400 });
    }

    // Content rules: banned words + link limits
    try {
      const { validateComment } = await import("@/lib/contentRules");
      const check = validateComment({ content }, { maxLinks: 3 });
      if (!check.ok) {
        return Response.json({ error: "Comment violates content rules", reasons: check.reasons }, { status: 422 });
      }
    } catch (_) {}

    const comment = new Comment({ content, author: user._id, post: postId });
    await comment.save();
    post.comments.push(comment._id);
    await post.save();
    
    // Increment comment usage counters
    if (!user.subscription.usage.commentsToday) {
      user.subscription.usage.commentsToday = 0;
    }
    await user.incrementUsage('commentsToday', 1);

    // Live update
    pusherServer.trigger(`post-${postId}`, "comment-update", {
      comment: {
        id: comment._id,
        content: comment.content,
        author: { id: providerId, name: session.user.name, image: session.user.image },
      },
    });

    // Notify post author - ✅ Use consistent private-user channel
    const postAuthor = await User.findOne({ providerId: post.authorId });
    if (postAuthor?.providerId && postAuthor.providerId !== providerId) {
      console.log(`📩 Sending comment notification to ${postAuthor.name} (${postAuthor.providerId})`);
      await pusherServer.trigger(`private-user-${postAuthor.providerId}`, "notification", {
        type: "comment",
        message: "commented on your post",
        fromUser: { id: providerId, name: session.user.name, image: session.user.image },
        postId,
        createdAt: new Date().toISOString(),
      });

      // Send email notification
      if (postAuthor.email && postAuthor.emailNotifications !== false && postAuthor.notificationPreferences?.comments !== false) {
        const emailData = emailTemplates.comment({
          fromUser: {
            name: session.user.name,
            image: session.user.image,
            id: providerId
          },
          post: {
            title: post.title,
            _id: postId
          },
          comment: {
            content: comment.content
          }
        });
        
        await sendEmail({
          to: postAuthor.email,
          subject: emailData.subject,
          html: emailData.html
        });
      }
    }

    return Response.json({ ok: true, commentId: comment._id });
  } catch (e) {
    console.error("Comment POST error:", e);
    return Response.json({ error: "Failed to create comment" }, { status: 500 });
  }
}