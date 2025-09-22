// app/api/search/route.js
export const dynamic = "force-dynamic";
import { searchPosts } from "@/lib/search";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return Response.json([]);
    }

    const results = await searchPosts(q);
    return Response.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}