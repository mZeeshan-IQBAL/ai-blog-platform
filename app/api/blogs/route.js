// app/api/blogs/route.js
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export const config = {
  runtime: "edge",
};

export async function POST(req) {
  await connectToDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const file = formData.get("image");

    if (!title || !content) {
      return Response.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    let coverImageUrl = "";

    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await uploadImage({
          arrayBuffer: async () => arrayBuffer,
        });

        // ✅ FIX: Trim whitespace from URL
        coverImageUrl = result.secure_url.trim();
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed:", uploadError.message);
        return Response.json(
          { error: "Failed to upload image. Please try again." },
          { status: 500 }
        );
      }
    }

    const newPost = new Post({
      title,
      content,
      coverImage: coverImageUrl, // ← Now clean and valid
      author: session.user.id,
      published: true,
    });

    await newPost.save();

    console.log("✅ Blog created:", newPost._id);
    return Response.json(newPost, { status: 201 });
  } catch (error) {
    console.error("❌ API Error:", error.message);
    return Response.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}