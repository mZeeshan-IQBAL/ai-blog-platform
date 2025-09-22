// app/api/posts/route.js — PURE JAVASCRIPT | PRODUCTION-GRADE
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { generateSummary, suggestTags } from "@/lib/openai";
import { uploadImage } from "@/lib/cloudinary";
import { cacheDel } from "@/lib/redis";
import { revalidatePath } from "next/cache";
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

  // 🤖 AI Enhancements — Non-blocking (post still saves if AI fails)
  let summary = "";
  let tags = [];
  const publishedRaw = formData.get("published");
  const scheduledAtRaw = formData.get("scheduledAt");
  const published = publishedRaw === "true" || publishedRaw === true;
  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;

  try {
    // Generate summary and tags concurrently for performance
    const [aiSummary, aiTags] = await Promise.all([
      generateSummary(content),
      suggestTags(content)
    ]);
    summary = aiSummary;
    tags = aiTags;
  } catch (error) {
    console.warn("⚠️ AI processing failed — saving without AI enhancements:", error.message);
    // Do NOT fail the request — AI is enhancement, not requirement
  }

  // 💾 Save to database
  try {
    const post = new Post({
      title,
      content,
      summary,
      tags,
      coverImage: coverImageUrl,
      author: session.user.id,
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

    const posts = await Post.find()
      .populate("author", "name image")
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

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