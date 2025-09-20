import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { cacheDel } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PatchSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  content: z.string().min(20).optional(),
  summary: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
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
  if (typeof update.published === "boolean" && update.published) {
    // If scheduling in the future, keep unpublished until time
    if (update.scheduledAt && new Date(update.scheduledAt) > new Date()) {
      update.published = false;
    }
  }

  const post = await Post.findByIdAndUpdate(id, update, { new: true });
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });

  await cacheDel("posts:all");
  await cacheDel(`post:${post.slug}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);

  return Response.json({ ok: true, post });
}