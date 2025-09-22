// app/api/blogs/route.js
export const dynamic = "force-dynamic";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

// ✅ Use nodejs runtime because we're using mongoose/DB
export const runtime = "nodejs";

/**
 * Handles POST request to create a new blog
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
      published: true,
    });

    await newPost.save();

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