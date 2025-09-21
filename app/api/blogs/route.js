// app/api/blogs/route.js
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export const config = {
  runtime: "edge", // keep edge, no Node.js streams
};

/**
 * Handles POST request to create a new blog
 */
export async function POST(req) {
  await connectToDB();

  const session = await getServerSession(authOptions);

  // ✅ Debug: Log session info
  console.log("🔍 Session debug:", {
    hasSession: !!session,
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userImage: session?.user?.image
  });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData(); // works in Edge runtime
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
      // Edge-compatible Cloudinary upload
      const arrayBuffer = await file.arrayBuffer();
      const result = await uploadImage({ arrayBuffer: () => arrayBuffer });
      coverImageUrl = result.secure_url.trim();
    }

    // ✅ FIX: Use authorId and authorName instead of author
    const newPost = new Post({
      title,
      content,
      category,
      tags,
      coverImage: coverImageUrl,
      authorId: session.user.id,           // ✅ Required field from model
      authorName: session.user.name,       // ✅ Required field from model  
      authorImage: session.user.image || "", // ✅ Optional but good to include
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
      JSON.stringify({ error: "Internal server error. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}