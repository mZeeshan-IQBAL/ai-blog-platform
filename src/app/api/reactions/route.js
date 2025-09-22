// app/api/reactions/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";


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
  doc.reactions = doc.reactions.filter((r) => String(r.user) !== String(userId));
  // If previously had same reaction and was the only one, toggling off would be handled by above; add new if requested type set
  doc.reactions.push({ type: reaction, user: userId });
  await doc.save();

  const counts = ALLOWED.reduce((acc, t) => {
    acc[t] = doc.reactions.filter((r) => r.type === t).length;
    return acc;
  }, {});

  return Response.json({ ok: true, counts });
}