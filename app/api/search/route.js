// app/api/search/route.js
import { searchPosts } from "@/lib/search";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const results = await searchPosts(q);
  return Response.json(results);
}