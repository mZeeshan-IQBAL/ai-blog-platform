// app/api/cron/publish/route.js
export const dynamic = "force-dynamic";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { cacheDel } from "@/lib/redis";
import { revalidatePath } from "next/cache";

export async function POST(req) {
  // Simple bearer token check to protect the endpoint
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await connectToDB();
  const now = new Date();

  const due = await Post.find({
    $or: [
      { status: "published", published: false, scheduledAt: { $lte: now } },
      { published: false, scheduledAt: { $lte: now } },
    ],
  });

  let updated = 0;
  for (const p of due) {
    p.status = "published";
    p.published = true;
    await p.save();
    await cacheDel(`post:${p.slug}`);
    updated++;
  }

  if (updated > 0) {
    await cacheDel("posts:all");
    revalidatePath("/blog");
  }

  return new Response(JSON.stringify({ updated }), { status: 200 });
}