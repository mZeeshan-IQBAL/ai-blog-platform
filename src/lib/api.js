// lib/api.js — fixed for Option 1 (use /images/placeholder.jpg)
import { connectToDB } from "./db";
import Post from "@/models/Post";
import { cacheGet, cacheSet } from "./redis";

function isObjectIdLike(val) {
  return /^[a-f\d]{24}$/i.test(String(val));
}

function stripHtml(input) {
  if (!input) return "";
  // Remove HTML tags and collapse whitespace
  return String(input).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function isValidUrl(url) {
  return typeof url === "string" && /^https?:\/\//.test(url);
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

/**
 * Get all unique categories used by posts (cached)
 */
export async function getAllCategories() {
  const key = "categories:all";
  const cached = await cacheGet(key);
  if (cached) return JSON.parse(cached);

  await connectToDB();
  const categories = await Post.distinct("category", {
    published: true,
    $or: [{ scheduledAt: null }, { scheduledAt: { $lte: new Date() } }],
    $and: [{ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }],
  });
  const clean = (categories || [])
    .map((c) => (c || "").toString().trim())
    .filter(Boolean)
    .filter((c) => c.toLowerCase() !== "")
    .sort((a, b) => a.localeCompare(b));
  await cacheSet(key, JSON.stringify(clean), 300);
  return clean;
}

function toSummary(content, summary) {
  const s = stripHtml(summary || "");
  if (s) return s.length > 150 ? s.slice(0, 150) + "..." : s;
  const c = stripHtml(content || "");
  return c.slice(0, 150) + (c.length > 150 ? "..." : "");
}

/**
 * Fetch all published blogs (cached)
 */
export async function getAllBlogs() {
  // Bump the cache key version to avoid stale values that had missing author info
  const cacheKey = "posts:all:v3";
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

    // Backfill/sanitize author info from User collection
    try {
      const { default: User } = await import("@/models/User");
      const authorIds = Array.from(new Set(posts.map(p => String(p.authorId)).filter(Boolean)));
      if (authorIds.length) {
        const users = await User.find({ _id: { $in: authorIds } }).select("name image").lean();
        const userMap = new Map(users.map(u => [String(u._id), u]));
        for (const p of posts) {
          const u = p.authorId ? userMap.get(String(p.authorId)) : null;
          if (!p.authorName || p.authorName === "") {
            p.authorName = u?.name || p.authorName || "Anonymous";
          }
          if (!isValidUrl(p.authorImage)) {
            // Replace non-URL or empty values with the actual user image if available
            p.authorImage = isValidUrl(u?.image) ? u.image : "";
          }
        }
      }
    } catch (e) {
      console.warn("⚠ Could not backfill author info in getAllBlogs:", e?.message || e);
    }

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
          image: isValidUrl(post.authorImage) ? post.authorImage : undefined,
        },
        tags: post.tags || [],
        likes: Array.isArray(post.likes) ? post.likes.length : post.likes || 0,
        comments: Array.isArray(post.comments) ? post.comments.length : 0,
        published: post.published,
        createdAt: post.createdAt,
        views: post.views || 0,
        readTimeMins,
        coverImage: post.coverImage || "/images/placeholder.jpg",
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

    // Backfill/sanitize author image for this single post
    try {
      if (!isValidUrl(post.authorImage) && post.authorId) {
        const { default: User } = await import("@/models/User");
        const u = await User.findById(post.authorId).select("image name").lean();
        if (u) {
          if (!post.authorName || post.authorName === "") post.authorName = u.name || post.authorName || "Anonymous";
          post.authorImage = isValidUrl(u?.image) ? u.image : "";
        }
      }
    } catch (_) {}

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
        image: isValidUrl(post.authorImage) ? post.authorImage : undefined, // sanitize
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
 * Get related posts based on shared tags/category (excludes the current post)
 */
export async function getRelatedPosts(idOrSlug, limit = 6) {
  try {
    await connectToDB();
    const query = isObjectIdLike(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
    const base = await Post.findOne(query).lean();
    if (!base) return [];

    const now = new Date();
    const related = await Post.find({
      _id: { $ne: base._id },
      published: true,
      $or: [{ scheduledAt: null }, { scheduledAt: { $lte: now } }],
      $and: [{ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }],
      $or: [
        { tags: { $in: base.tags || [] } },
        { category: base.category || "General" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return related.map((post) => ({
      id: post._id.toString(),
      slug: post.slug,
      title: post.title,
      excerpt: toSummary(post.content, post.summary),
      author: {
        id: post.authorId,
        name: post.authorName || "Anonymous",
        image: post.authorImage || "/images/placeholder.jpg",
      },
      tags: post.tags || [],
      createdAt: post.createdAt,
      coverImage: post.coverImage || "/images/placeholder.jpg",
    }));
  } catch (e) {
    console.error("❌ getRelatedPosts failed:", e);
    return [];
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

    // Backfill/sanitize author images
    try {
      const { default: User } = await import("@/models/User");
      const authorIds = Array.from(new Set(posts.map(p => String(p.authorId)).filter(Boolean)));
      const users = await User.find({ _id: { $in: authorIds } }).select("name image").lean();
      const userMap = new Map(users.map(u => [String(u._id), u]));
      for (const p of posts) {
        const u = userMap.get(String(p.authorId));
        if (!p.authorName || p.authorName === "") p.authorName = u?.name || p.authorName || "Anonymous";
        if (!isValidUrl(p.authorImage)) p.authorImage = isValidUrl(u?.image) ? u.image : "";
      }
    } catch (_) {}

    const data = posts.map((post) => ({
      id: post._id.toString(),
      slug: post.slug,
      title: post.title,
      excerpt: toSummary(post.content, post.summary),
      author: {
        id: post.authorId,
        name: post.authorName || "Anonymous",
        image: isValidUrl(post.authorImage) ? post.authorImage : undefined, // sanitize
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

/**
 * Fetch posts filtered by category (cached)
 */
export async function getPostsByCategory(category) {
  const key = `posts:category:${category}`;
  const cached = await cacheGet(key);
  if (cached) return JSON.parse(cached);

  await connectToDB();
  try {
    const now = new Date();
    const posts = await Post.find({
      published: true,
      $or: [{ scheduledAt: null }, { scheduledAt: { $lte: now } }],
      category,
      $and: [{ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }]
    })
      .sort({ createdAt: -1 })
      .lean();

    // Backfill/sanitize author images
    try {
      const { default: User } = await import("@/models/User");
      const authorIds = Array.from(new Set(posts.map(p => String(p.authorId)).filter(Boolean)));
      const users = await User.find({ _id: { $in: authorIds } }).select("name image").lean();
      const userMap = new Map(users.map(u => [String(u._id), u]));
      for (const p of posts) {
        const u = userMap.get(String(p.authorId));
        if (!p.authorName || p.authorName === "") p.authorName = u?.name || p.authorName || "Anonymous";
        if (!isValidUrl(p.authorImage)) p.authorImage = isValidUrl(u?.image) ? u.image : "";
      }
    } catch (_) {}

    const data = posts.map((post) => ({
      id: post._id.toString(),
      slug: post.slug,
      title: post.title,
      excerpt: toSummary(post.content, post.summary),
      author: {
        id: post.authorId,
        name: post.authorName || "Anonymous",
        image: isValidUrl(post.authorImage) ? post.authorImage : undefined,
      },
      tags: post.tags || [],
      createdAt: post.createdAt,
      coverImage: post.coverImage || "/images/placeholder.jpg",
    }));

    await cacheSet(key, JSON.stringify(data), 60);
    return data;
  } catch (e) {
    console.error("❌ getPostsByCategory failed:", e);
    return [];
  }
}
