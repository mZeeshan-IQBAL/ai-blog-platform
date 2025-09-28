// app/api/blogs/route.js
export const dynamic = "force-dynamic";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import PostVersion from "@/models/PostVersion";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { cacheDel } from "@/lib/redis";
import { revalidatePath } from "next/cache";

// ✅ Use nodejs runtime because we're using mongoose/DB
export const runtime = "nodejs";

/**
 * Handles POST request to create a new blog (supports drafts and scheduling)
 */
export async function POST(req) {
  await connectToDB();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData(); // API routes in App Router support this
    const title = formData.get("title");
    const content = formData.get("content");
    const category = formData.get("category") || "General";
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags")) : [];
    const file = formData.get("image");
    const status = (formData.get("status") || "published").toString();
    const scheduledAtRaw = formData.get("scheduledAt");
    const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw.toString()) : null;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: "Title and content are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let coverImageUrl = "";

    if (file?.size > 0) {
      // Nodejs runtime supports buffer → upload to Cloudinary
      const arrayBuffer = await file.arrayBuffer();
      const result = await uploadImage({ arrayBuffer: () => arrayBuffer });
      coverImageUrl = result.secure_url.trim();
    }

    const newPost = new Post({
      title,
      content,
      category,
      tags,
      coverImage: coverImageUrl,
      authorId: session.user.id,
      authorName: session.user.name,
      authorImage: session.user.image || "",
      status: status === "draft" ? "draft" : "published",
      scheduledAt: scheduledAt || null,
    });

    await newPost.save();

    // Create initial version
    await PostVersion.create({
      postId: newPost._id,
      version: 1,
      title: newPost.title,
      content: newPost.content,
      summary: newPost.summary || "",
      tags: newPost.tags || [],
      category: newPost.category || "General",
      coverImage: newPost.coverImage || "",
      authorId: newPost.authorId,
    });

    await cacheDel("posts:all");
    await cacheDel(`post:${newPost.slug}`);
    revalidatePath("/blog");

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
