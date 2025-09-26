// app/api/reactions/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { pusherServer } from "@/lib/pusherServer";

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
      } else {
        console.log(`❌ Could not find author for notification. Post authorId: ${post.authorId}`);
      }
    }
  }

  return Response.json({ ok: true, counts });
}