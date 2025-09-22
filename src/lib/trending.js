import { connectToDB } from "./db";
import Post from "@/models/Post";

// Simple trending score: views + 3*reactions + 2*comments - decay by age (per day)
export async function getTrending(limit = 10) {
  await connectToDB();
  const posts = await Post.find({ published: true }).lean();
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