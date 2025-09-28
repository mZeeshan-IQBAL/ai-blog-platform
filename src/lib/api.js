// lib/api.js — fixed for Option 1 (use /images/placeholder.jpg)
import { connectToDB } from "./db";
import Post from "@/models/Post";
import { cacheGet, cacheSet } from "./redis";

function isObjectIdLike(val) {
  return /^[a-f\d]{24}$/i.test(String(val));
}

/**
 * Get all unique tags (cached)
 */
export async function getAllTags() {
  const key = "tags:all";
  const cached = await cacheGet(key);
  if (cached) return JSON.parse(cached);

  await connectToDB();
  const tags = await Post.distinct("tags", { 
    published: true,
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
  });
  const clean = (tags || []).filter(Boolean).sort();
  await cacheSet(key, JSON.stringify(clean), 300);
  return clean;
}

function toSummary(content, summary) {
  if (summary) return summary;
  if (!content) return "";
  return content.slice(0, 150) + (content.length > 150 ? "..." : "");
}

/**
 * Fetch all published blogs (cached)
 */
export async function getAllBlogs() {
  const cacheKey = "posts:all";
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  await connectToDB();
  try {
    const now = new Date();
    const posts = await Post.find({
      published: true,
      $or: [{ scheduledAt: null }, { scheduledAt: { $lte: now } }],
      $and: [{ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }]
    })
      .sort({ createdAt: -1 })
      .lean();

    const data = posts.map((post) => {
      const words = String(post.content || "").trim().split(/\s+/).length;
      const readTimeMins = Math.max(1, Math.ceil(words / 200));
      return {
        id: post._id.toString(),
        slug: post.slug,
        title: post.title,
        excerpt: toSummary(post.content, post.summary),
        content: post.content,
        author: {
          id: post.authorId,
          name: post.authorName || "Anonymous",
          image: post.authorImage || "/images/placeholder.jpg", // ✅ fixed
        },
        tags: post.tags || [],
        likes: Array.isArray(post.likes) ? post.likes.length : post.likes || 0,
        comments: Array.isArray(post.comments) ? post.comments.length : 0,
        published: post.published,
        createdAt: post.createdAt,
        views: post.views || 0,
        readTimeMins,
        coverImage: post.coverImage || "/images/placeholder.jpg", // ✅ fixed
      };
    });

    await cacheSet(cacheKey, JSON.stringify(data), 60);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch blogs:", error);
    return [];
  }
}

/**
 * Fetch a single blog by slug or id (cached)
 */
export async function getBlog(idOrSlug) {
  const key = `post:${idOrSlug}`;
  const cached = await cacheGet(key);
  if (cached) return JSON.parse(cached);

  await connectToDB();
  try {
    const query = isObjectIdLike(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const post = await Post.findOne(query).lean();
    if (!post) return null;
    if (post.deletedAt) return null;

    const words = String(post.content || "").trim().split(/\s+/).length;
    const readTimeMins = Math.max(1, Math.ceil(words / 200));

    const data = {
      id: post._id.toString(),
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: toSummary(post.content, post.summary),
      author: {
        id: post.authorId,
        name: post.authorName || "Anonymous",
        image: post.authorImage || "/images/placeholder.jpg", // ✅ fixed
      },
      tags: post.tags || [],
      likes: Array.isArray(post.likes) ? post.likes.length : post.likes || 0,
      comments: Array.isArray(post.comments) ? post.comments.length : 0,
      views: post.views || 0,
      readTimeMins,
      createdAt: post.createdAt,
      coverImage: post.coverImage || "/images/placeholder.jpg", // ✅ fixed
    };

    await cacheSet(key, JSON.stringify(data), 300);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch blog:", error);
    return null;
  }
}

/**
 * Fetch posts filtered by tag (cached)
 */
export async function getPostsByTag(tag) {
  const key = `posts:tag:${tag}`;
  const cached = await cacheGet(key);
  if (cached) return JSON.parse(cached);

  await connectToDB();
  try {
    const now = new Date();
    const posts = await Post.find({
      published: true,
      $or: [{ scheduledAt: null }, { scheduledAt: { $lte: now } }],
      tags: tag,
      $and: [{ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }]
    })
      .sort({ createdAt: -1 })
      .lean();

    const data = posts.map((post) => ({
      id: post._id.toString(),
      slug: post.slug,
      title: post.title,
      excerpt: toSummary(post.content, post.summary),
      author: {
        id: post.authorId,
        name: post.authorName || "Anonymous",
        image: post.authorImage || "/images/placeholder.jpg", // ✅ fixed
      },
      tags: post.tags || [],
      createdAt: post.createdAt,
    }));

    await cacheSet(key, JSON.stringify(data), 60);
    return data;
  } catch (e) {
    console.error("❌ getPostsByTag failed:", e);
    return [];
  }
}
