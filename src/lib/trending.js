// src/lib/trending.js
import { connectToDB } from "./db";
import Post from "@/models/Post";
import User from "@/models/User";

// Simple trending score: views + 3*reactions + 2*comments - decay by age (per day)
export async function getTrending(limit = 10) {
  await connectToDB();
  const posts = await Post.find({ 
    published: true,
    $or: [ { trending: true }, { trending: { $exists: false } } ] // treat missing as true for backward compatibility
  }).lean();

  // Backfill author info if missing
  try {
    const authorIds = Array.from(new Set(posts.map((p) => String(p.authorId)).filter(Boolean)));
    if (authorIds.length) {
      const users = await User.find({ _id: { $in: authorIds } }).select("name image").lean();
      const userMap = new Map(users.map((u) => [String(u._id), u]));
      for (const p of posts) {
        if ((!p.authorName || p.authorName === "") && p.authorId && userMap.has(String(p.authorId))) {
          const u = userMap.get(String(p.authorId));
          p.authorName = u?.name || p.authorName || "Anonymous";
          p.authorImage = u?.image || p.authorImage || "/images/placeholder.jpg";
        }
      }
    }
  } catch (e) {
    console.warn("⚠ trending backfill author failed:", e?.message || e);
  }

  const now = Date.now();
  const scored = posts.map((p) => {
    const reactions = Array.isArray(p.reactions) ? p.reactions.length : 0;
    const comments = Array.isArray(p.comments) ? p.comments.length : 0;
    const views = p.views || 0;
    const ageDays = Math.max(1, (now - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const score = views + reactions * 3 + comments * 2;
    const decayed = score / Math.pow(ageDays, 1.2);
    return { ...p, score: decayed };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
