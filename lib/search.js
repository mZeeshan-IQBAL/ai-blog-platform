// lib/search.js
import { connectToDB } from "./db";
import Post from "@/models/Post";

export async function searchPosts(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  await connectToDB();

  try {
    // Create case-insensitive regex for search
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const results = await Post.find({
      published: true,
      $or: [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } },
        { category: { $regex: searchRegex } },
        { summary: { $regex: searchRegex } }
      ]
    })
    .select({
      _id: 1,
      slug: 1,
      title: 1,
      summary: 1,
      content: 1,
      tags: 1,
      category: 1,
      coverImage: 1,
      views: 1,
      createdAt: 1,
      authorName: 1,
      authorImage: 1
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Add excerpt if no summary
    const processedResults = results.map(post => ({
      ...post,
      id: post._id.toString(),
      excerpt: post.summary || (post.content ? post.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...' : '')
    }));

    return processedResults;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}