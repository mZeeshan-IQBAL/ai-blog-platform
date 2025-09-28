// app/api/posts/[id]/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import PostVersion from "@/models/PostVersion";
import { cacheDel } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PatchSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  content: z.string().min(20).optional(),
  summary: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  published: z.boolean().optional(), // backward compat
  scheduledAt: z.string().datetime().optional(),
});

export async function PATCH(request, { params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDB();
  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

  const update = { ...parsed.data };
  if (update.scheduledAt) update.scheduledAt = new Date(update.scheduledAt);

  // Normalize status/published
  if (typeof update.published === "boolean" && update.published) {
    if (update.scheduledAt && new Date(update.scheduledAt) > new Date()) {
      update.published = false;
      update.status = update.status || "published";
    } else {
      update.status = "published";
    }
  }

  // Capture previous version for history
  const prev = await Post.findById(id);
  if (!prev) return Response.json({ error: "Not found" }, { status: 404 });

  const post = await Post.findByIdAndUpdate(id, update, { new: true });
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });

  // Create a new version entry if content/title/summary/tags changed
  const changed = ["title", "content", "summary", "tags"].some((k) => update[k] !== undefined);
  if (changed) {
    const latest = await PostVersion.findOne({ postId: post._id }).sort({ version: -1 }).lean();
    const nextVersion = (latest?.version || 1) + 1;
    await PostVersion.create({
      postId: post._id,
      version: nextVersion,
      title: post.title,
      content: post.content,
      summary: post.summary || "",
      tags: post.tags || [],
      category: post.category || "General",
      coverImage: post.coverImage || "",
      authorId: post.authorId,
    });
  }

  await cacheDel("posts:all");
  await cacheDel(`post:${post.slug}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);

  return Response.json({ ok: true, post });
}
