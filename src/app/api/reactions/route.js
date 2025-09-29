// app/api/reactions/route.js
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

const ALLOWED = ["like", "love", "fire"];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");
  if (!targetType || !targetId) return Response.json({ error: "Bad request" }, { status: 400 });
  await connectToDB();
  let doc;
  if (targetType === "post") doc = await Post.findById(targetId).lean();
  else if (targetType === "comment") doc = await Comment.findById(targetId).lean();
  else return Response.json({ error: "Bad target" }, { status: 400 });
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
  const reactions = doc.reactions || [];
  const counts = { like: 0, love: 0, fire: 0 };
  for (const r of reactions) { if (counts[r.type] !== undefined) counts[r.type]++; }
  return Response.json({ counts });
}

export async function POST(request) {
  // Blocked users cannot react
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const { connectToDB } = await import('@/lib/db');
    const User = (await import('@/models/User')).default;
    const session = await getServerSession(authOptions);
    if (session?.user?.providerId) {
      await connectToDB();
      const u = await User.findOne({ providerId: session.user.providerId });
      if (u?.blocked) return Response.json({ error: 'User is blocked' }, { status: 403 });
    }
  } catch (_) {}
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { targetType, targetId, reaction } = await request.json();
  if (!ALLOWED.includes(reaction)) return Response.json({ error: "Bad reaction" }, { status: 400 });

  await connectToDB();
  let doc;
  if (targetType === "post") doc = await Post.findById(targetId);
  else if (targetType === "comment") doc = await Comment.findById(targetId);
  else return Response.json({ error: "Bad target" }, { status: 400 });

  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  // Toggle user's reaction; ensure unique per user per target
  doc.reactions = doc.reactions || [];
  const userId = session.user.id;
  // Remove any existing reaction by user (switching types)
  const existingReactionIndex = doc.reactions.findIndex((r) => String(r.user) === String(userId));
  const hadExistingReaction = existingReactionIndex !== -1;
  const existingReactionType = hadExistingReaction ? doc.reactions[existingReactionIndex].type : null;
  
  if (hadExistingReaction) {
    doc.reactions.splice(existingReactionIndex, 1);
  }
  
  // Only add new reaction if it's different from existing or if we're toggling on
  if (!hadExistingReaction || existingReactionType !== reaction) {
    doc.reactions.push({ type: reaction, user: userId });
  }

  await doc.save();

  const counts = ALLOWED.reduce((acc, t) => {
    acc[t] = doc.reactions.filter((r) => r.type === t).length;
    return acc;
  }, {});

  // ✅ Trigger real-time update for reactions
  pusherServer.trigger(`${targetType}-${targetId}`, "reaction-update", {
    counts,
    userReaction: reaction
  });

  // ✅ Send notification for likes on posts
  if (targetType === "post" && reaction === "like" && (!hadExistingReaction || existingReactionType !== "like")) {
    const post = doc;
    if (String(post.authorId) !== String(userId)) {
      // Find the author by their providerId (which is stored in authorId for posts)
      const author = await User.findOne({ providerId: post.authorId });
      if (author?.providerId) {
        console.log(`📩 Sending like notification to ${author.name} (${author.providerId})`);
        
        // Send push notification
        await pusherServer.trigger(
          `private-user-${author.providerId}`,
          "notification",
          {
            type: "like",
            fromUser: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image
            },
            extra: {
              postId: targetId,
              postTitle: post.title
            },
            createdAt: new Date().toISOString()
          }
        );
        
        // Send email notification
        if (author.email && author.emailNotifications !== false && author.notificationPreferences?.likes !== false) {
          const emailData = emailTemplates.like({
            fromUser: {
              name: session.user.name,
              image: session.user.image,
              id: session.user.id
            },
            post: {
              title: post.title,
              _id: targetId
            }
          });
          
          await sendEmail({
            to: author.email,
            subject: emailData.subject,
            html: emailData.html
          });
        }
        
        // ✅ Trigger profile stats update for the post author
        await pusherServer.trigger(
          `private-user-${author.providerId}`,
          "profile-stats-update",
          { type: "like", postId: targetId }
        );
      } else {
        console.log(`❌ Could not find author for notification. Post authorId: ${post.authorId}`);
      }
    }
  }

  return Response.json({ ok: true, counts });
}