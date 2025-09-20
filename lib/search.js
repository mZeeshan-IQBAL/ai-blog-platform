// lib/search.js
import { connectToDB } from "./db";
import Post from "@/models/Post";

export async function searchPosts(query) {
  await connectToDB();

  const results = await Post.aggregate([
    {
      $search: {
        index: "default",
        text: { query, path: ["title", "content", "tags"] }
      }
    },
    { $limit: 20 },
    {
      $project: {
        title: 1,
        summary: 1,
        tags: 1,
        coverImage: 1,
        views: 1,
        createdAt: 1
      }
    }
  ]);
  return results;
}