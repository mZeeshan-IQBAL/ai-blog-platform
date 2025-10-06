// app/api/profile/avatar/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { uploadAvatar } from "@/lib/cloudinary";
import { cacheDel } from "@/lib/redis";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const form = await request.formData();
    const file = form.get("image");
    if (!file || !file.size) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }
    // Server-side basic validation
    const maxSize = 6 * 1024 * 1024; // 6MB
    if (file.size > maxSize) {
      return Response.json({ error: "File too large (max 6MB)" }, { status: 413 });
    }

    const result = await uploadAvatar(file);
    const url = result.secure_url?.trim();

    if (!url) {
      return Response.json({ error: "Upload failed" }, { status: 500 });
    }

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { image: url, updatedAt: new Date() },
      { new: true }
    ).lean();

    // Invalidate cached blog lists so avatars refresh immediately
    try { await cacheDel("posts:all:v2"); } catch (_) {}
    try { await cacheDel("posts:all:v3"); } catch (_) {}

    return Response.json({ image: updated?.image || url });
  } catch (e) {
    console.error("Avatar upload error:", e);
    return Response.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}