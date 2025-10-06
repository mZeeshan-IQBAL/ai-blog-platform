// app/api/posts/route.js — PURE JAVASCRIPT | PRODUCTION-GRADE
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { uploadImage } from "@/lib/cloudinary";
import { cacheDel } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusherServer";
import { z } from "zod";

/**
 * POST /api/posts
 * Create a new blog post
 */
export async function POST(request) {
  // 🔐 Authenticate user
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Please sign in." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 🌐 Connect to DB
  try {
    await connectToDB();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return new Response(
      JSON.stringify({ error: "Service unavailable. Please try again later." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // 📥 Parse form data
  let formData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("❌ Failed to parse form data:", error);
    return new Response(
      JSON.stringify({ error: "Invalid form data." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const title = formData.get("title")?.trim();
  const content = formData.get("content");

  // 🧾 Validate required fields with zod
  const schema = z.object({
    title: z.string().min(3).max(160),
    content: z.string().min(20),
  });
  const parsed = schema.safeParse({ title, content });
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid input", details: parsed.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 🖼️ Handle cover image (optional)
  let coverImageUrl = "";
  const coverImageFile = formData.get("coverImage");

  if (coverImageFile && coverImageFile.size > 0) {
    try {
      const result = await uploadImage(coverImageFile);
      coverImageUrl = result.secure_url;
    } catch (error) {
      console.error("❌ Image upload failed:", error);
      return new Response(
        JSON.stringify({ error: "Image upload failed. Please try again." }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
  }


  // Content rules: banned words + link limits (basic)
  try {
    const { validatePost } = await import("@/lib/contentRules");
    const check = validatePost({ title, content, summary: formData.get("summary") || "" }, { maxLinks: 10 });
    if (!check.ok) {
      return new Response(
        JSON.stringify({ error: "Post violates content rules", reasons: check.reasons }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (_) {}

  // 💾 Save to database
  try {
    const tags = (formData.get("tags") || "").toString().split(",").map((t) => t.trim()).filter(Boolean);
    const summary = formData.get("summary") || "";
    const published = formData.get("published") === "true";
    const scheduledAtRaw = formData.get("scheduledAt");
    const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;

    const post = new Post({
      title,
      content,
      summary,
      tags,
      coverImage: coverImageUrl,
      authorId: session.user.id,
      authorName: session.user.name,
      authorImage: session.user.image,
      published: published && (!scheduledAt || scheduledAt <= new Date()),
      scheduledAt: scheduledAt || null,
    });

    const savedPost = await post.save();

    // Populate author for response
    await savedPost.populate("author", "name image");

    // 🧹 Invalidate cache and revalidate routes
    await cacheDel("posts:all");
    await cacheDel(`post:${savedPost.slug}`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${savedPost.slug}`);

    // ✅ Trigger profile stats update for new post
    try {
      await pusherServer.trigger(
        `private-user-${session.user.id}`,
        "new-post",
        { 
          postId: savedPost._id,
          title: savedPost.title,
          published: savedPost.published 
        }
      );
    } catch (pusherError) {
      console.error("❌ Pusher notification failed:", pusherError);
    }

    return new Response(
      JSON.stringify(savedPost),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Post creation failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create post. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET /api/posts
 * Fetch all blog posts
 */
export async function GET() {
  try {
    await connectToDB();

    // Fetch posts
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for performance

    // Backfill/sanitize author info by joining with User collection
    try {
      const { default: User } = await import("@/models/User");
      const authorIds = Array.from(new Set(posts.map(p => String(p.authorId)).filter(Boolean)));
      if (authorIds.length) {
        const users = await User.find({ _id: { $in: authorIds } }).select("name image").lean();
        const userMap = new Map(users.map(u => [String(u._id), u]));
        const isValidUrl = (url) => typeof url === 'string' && /^https?:\/\//.test(url);
        for (const p of posts) {
          if (p.authorId && userMap.has(String(p.authorId))) {
            const u = userMap.get(String(p.authorId));
            if (!p.authorName || p.authorName === "") {
              p.authorName = u?.name || p.authorName || "Anonymous";
            }
            // If authorImage is missing or not a proper URL (e.g., "600x600"), replace with user's profile image
            if (!p.authorImage || !isValidUrl(p.authorImage)) {
              p.authorImage = u?.image || null;
            }
          }
        }
      }
    } catch (e) {
      console.warn("⚠ Could not backfill author info:", e?.message || e);
    }

    return new Response(
      JSON.stringify(posts),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Failed to fetch posts:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch posts. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}