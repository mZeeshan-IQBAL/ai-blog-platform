// app/api/feed/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

function scorePost(p, opts) {
  const { followedAuthorIdsSet, topTagsSet } = opts;
  const views = p.views || 0;
  const reactions = Array.isArray(p.reactions) ? p.reactions.length : 0;
  const comments = Array.isArray(p.comments) ? p.comments.length : 0;
  const ageDays = Math.max(1, (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  let score = (views + reactions * 3 + comments * 2) / Math.pow(ageDays, 1.2);

  if (followedAuthorIdsSet.has(String(p.authorId))) score += 50;
  const tagMatches = (p.tags || []).filter((t) => topTagsSet.has(String(t))).length;
  score += tagMatches * 10;

  return score;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  await connectToDB();

  // If anonymous, just return trending
  if (!session?.user?.id) {
    const posts = await Post.find({ published: true, $or: [{ scheduledAt: null }, { scheduledAt: { $lte: new Date() } }] })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return Response.json(posts);
  }

  // Load user and derive follows and bookmarks tags
  const user = await User.findById(session.user.id).lean();
  const followedUserIds = (user?.follows || []).map((id) => String(id));

  // Derive top tags from bookmarks (optional; if none, fallback empty)
  const bookmarks = user?.bookmarks || [];
  let topTags = [];
  if (bookmarks.length > 0) {
    const bookmarkedPosts = await Post.find({ _id: { $in: bookmarks } }).select({ tags: 1 }).lean();
    const tagCounts = new Map();
    for (const bp of bookmarkedPosts) {
      for (const t of bp.tags || []) {
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
      }
    }
    topTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
  }

  // Fetch candidate posts: by followed authors OR matching top tags OR generally recent
  const candidates = await Post.find({
    published: true,
    $or: [
      { scheduledAt: null },
      { scheduledAt: { $lte: new Date() } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const followedAuthorIdsSet = new Set(followedUserIds.map(String));
  const topTagsSet = new Set(topTags.map(String));

  const scored = candidates.map((p) => ({ ...p, _score: scorePost(p, { followedAuthorIdsSet, topTagsSet }) }));
  const ranked = scored.sort((a, b) => b._score - a._score).slice(0, 20);

  return Response.json(ranked);
}