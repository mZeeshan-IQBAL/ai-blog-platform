// app/api/trending/route.js
export const dynamic = "force-dynamic";
import { getTrending } from "@/lib/trending";

export async function GET() {
  const posts = await getTrending(10);
  const mapped = posts.map((p) => ({ id: p._id?.toString?.() || p.id, slug: p.slug, title: p.title, score: p.score }));
  return Response.json(mapped);
}