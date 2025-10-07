// app/api/posts/[id]/route.js — ENHANCED WITH SUBSCRIPTION ENFORCEMENT
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import PostVersion from "@/models/PostVersion";
import User from "@/models/User";
import { cacheDel } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { withSubscription } from "@/lib/subscriptionMiddleware";
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

/**
 * PATCH /api/posts/[id] - Update a post with subscription enforcement
 */
async function patchPostHandler(request, { params }) {
  const { id } = await params;
  const user = request.user; // Provided by middleware
  const subscription = request.subscription; // Provided by middleware

  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

  const update = { ...parsed.data };
  
  // Check scheduling feature access
  if (update.scheduledAt) {
    const scheduledDate = new Date(update.scheduledAt);
    if (scheduledDate > new Date()) {
      if (!user.hasFeatureAccess('scheduled-posts') || !user.canPerformAction('schedule_post')) {
        return Response.json({ 
          error: "Scheduled posts require a premium plan",
          upgradeRequired: true,
          currentPlan: subscription.plan,
          requiredFeature: 'scheduled-posts'
        }, { status: 403 });
      }
    }
    update.scheduledAt = scheduledDate;
  }

  // Check tag limits for updates
  if (update.tags && Array.isArray(update.tags)) {
    const maxTags = subscription.plan === 'free' ? 3 : subscription.plan === 'starter' ? 5 : 10;
    if (update.tags.length > maxTags) {
      return Response.json({ 
        error: `Your plan allows maximum ${maxTags} tags per post`,
        upgradeRequired: subscription.plan === 'free',
        currentPlan: subscription.plan,
        tagLimit: maxTags
      }, { status: 400 });
    }
  }

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
  
  // Verify ownership or admin access
  if (prev.authorId.toString() !== user._id.toString() && user.role !== 'ADMIN') {
    return Response.json({ error: "Forbidden: You can only edit your own posts" }, { status: 403 });
  }

  const post = await Post.findByIdAndUpdate(id, update, { new: true });
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });

  // If post is removed by moderation, ensure published=false
  if (post.moderation?.status === 'removed' && post.published) {
    post.published = false;
    await post.save();
  }

  // Create a new version entry if content/title/summary/tags changed (premium feature)
  const changed = ["title", "content", "summary", "tags"].some((k) => update[k] !== undefined);
  if (changed && user.hasFeatureAccess('advanced')) {
    try {
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
    } catch (versionError) {
      console.warn("⚠️ Failed to create post version:", versionError);
    }
  }

  await cacheDel("posts:all");
  await cacheDel(`post:${post.slug}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);

  return Response.json({ 
    ok: true, 
    post,
    subscriptionInfo: {
      plan: subscription.plan,
      versioningEnabled: user.hasFeatureAccess('advanced')
    }
  });
}

// Apply subscription middleware to PATCH handler
export const PATCH = withSubscription(patchPostHandler, {
  // No specific action required, just need authentication and user context
});

/**
 * GET /api/posts/[id] - Fetch a specific post (no restrictions)
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectToDB();

    const post = await Post.findById(id).lean();
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Backfill author info if missing
    if (post.authorId && (!post.authorName || !post.authorImage)) {
      try {
        const author = await User.findById(post.authorId).select('name image').lean();
        if (author) {
          post.authorName = post.authorName || author.name;
          post.authorImage = post.authorImage || author.image;
        }
      } catch (error) {
        console.warn("⚠️ Could not fetch author info:", error);
      }
    }

    return Response.json(post);
  } catch (error) {
    console.error("❌ Failed to fetch post:", error);
    return Response.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id] - Delete a post (with ownership check)
 */
async function deletePostHandler(request, { params }) {
  const { id } = await params;
  const user = request.user; // Provided by middleware

  const post = await Post.findById(id);
  if (!post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  // Verify ownership or admin access
  if (post.authorId.toString() !== user._id.toString() && user.role !== 'ADMIN') {
    return Response.json({ error: "Forbidden: You can only delete your own posts" }, { status: 403 });
  }

  // Delete the post
  await Post.findByIdAndDelete(id);

  // Clean up related data (versions, cache)
  try {
    await PostVersion.deleteMany({ postId: id });
    await cacheDel("posts:all");
    await cacheDel(`post:${post.slug}`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
  } catch (cleanupError) {
    console.warn("⚠️ Cleanup after deletion failed:", cleanupError);
  }

  return Response.json({ ok: true, message: "Post deleted successfully" });
}

// Apply subscription middleware to DELETE handler
export const DELETE = withSubscription(deletePostHandler, {
  // No specific action required, just need authentication and user context
});
