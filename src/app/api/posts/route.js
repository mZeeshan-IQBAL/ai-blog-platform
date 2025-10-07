// app/api/posts/route.js — ENHANCED WITH COMPREHENSIVE SUBSCRIPTION LIMITS
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { uploadImage } from "@/lib/cloudinary";
import { cacheDel } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusherServer";
import { z } from "zod";
import { withSubscription } from "@/lib/subscriptionMiddleware";

/**
 * POST /api/posts - Create a new blog post with comprehensive subscription checks
 * Uses the withSubscription middleware for proper enforcement
 */
async function createPostHandler(request) {
  // User is already authenticated and subscription checked by middleware
  const user = request.user;
  const subscription = request.subscription;
  const session = { user: { id: user._id, name: user.name, email: user.email, image: user.image } };

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
  const published = formData.get("published") === "true";
  const scheduledAtRaw = formData.get("scheduledAt");
  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;

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

  // 📅 Check scheduled post feature access (premium feature)
  if (scheduledAt && scheduledAt > new Date()) {
    if (!user.hasFeatureAccess('scheduled-posts') || !user.canPerformAction('schedule_post')) {
      return new Response(
        JSON.stringify({ 
          error: "Scheduled posts require a premium plan",
          upgradeRequired: true,
          currentPlan: subscription.plan,
          requiredFeature: 'scheduled-posts'
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 🖼️ Handle cover image (optional) - File upload limits are checked by middleware
  let coverImageUrl = "";
  const coverImageFile = formData.get("coverImage");

  if (coverImageFile && coverImageFile.size > 0) {
    // File size and upload limits already checked by middleware
    try {
      const result = await uploadImage(coverImageFile);
      coverImageUrl = result.secure_url;
      
      // Increment usage counters
      const fileSizeMB = coverImageFile.size / (1024 * 1024);
      await user.incrementUsage('storage', fileSizeMB);
      await user.incrementUsage('fileUploads', 1);
    } catch (error) {
      console.error("❌ Image upload failed:", error);
      return new Response(
        JSON.stringify({ error: "Image upload failed. Please try again." }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
  }


  // 🔍 Content validation with plan-based limits
  const tags = (formData.get("tags") || "").toString().split(",").map((t) => t.trim()).filter(Boolean);
  const summary = formData.get("summary") || "";
  
  // Check tag limits based on subscription
  const maxTags = subscription.plan === 'free' ? 3 : subscription.plan === 'starter' ? 5 : 10;
  if (tags.length > maxTags) {
    return new Response(
      JSON.stringify({ 
        error: `Your plan allows maximum ${maxTags} tags per post`,
        upgradeRequired: subscription.plan === 'free',
        currentPlan: subscription.plan,
        tagLimit: maxTags
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Content rules: banned words + link limits (plan-based)
  try {
    const { validatePost } = await import("@/lib/contentRules");
    const maxLinks = subscription.plan === 'free' ? 2 : subscription.plan === 'starter' ? 5 : 10;
    const check = validatePost({ title, content, summary }, { maxLinks });
    if (!check.ok) {
      return new Response(
        JSON.stringify({ 
          error: "Post violates content rules", 
          reasons: check.reasons,
          currentPlan: subscription.plan,
          linkLimit: maxLinks
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.warn("⚠️ Content validation failed:", error?.message);
  }

  // 💾 Save to database
  try {
    const post = new Post({
      title,
      content,
      summary,
      tags,
      coverImage: coverImageUrl,
      authorId: session.user.id,
      authorName: session.user.name,
      authorImage: session.user.image,
      published: published && (!scheduledAt || scheduledAt <= new Date()),
      scheduledAt: scheduledAt || null,
      // Add premium features based on plan
      isPremium: subscription.plan !== 'free',
      planType: subscription.plan,
    });

    const savedPost = await post.save();

    // Increment post usage counter (handled by middleware, but ensure it's tracked)
    await user.incrementUsage('posts', 1);

    // Populate author for response
    await savedPost.populate("author", "name image");

    // 🧹 Invalidate cache and revalidate routes
    await cacheDel("posts:all");
    await cacheDel(`post:${savedPost.slug}`);
    revalidatePath("/blog");
    revalidatePath(`/blog/${savedPost.slug}`);

    // ✅ Trigger profile stats update for new post
    try {
      await pusherServer.trigger(
        `private-user-${session.user.id}`,
        "new-post",
        { 
          postId: savedPost._id,
          title: savedPost.title,
          published: savedPost.published,
          planType: subscription.plan,
          usageInfo: {
            current: subscription.usage.posts + 1,
            limit: subscription.limits.posts,
            percentage: user.getUsagePercentage('posts')
          }
        }
      );
    } catch (pusherError) {
      console.error("❌ Pusher notification failed:", pusherError);
    }

    return new Response(
      JSON.stringify({
        ...savedPost.toObject(),
        subscriptionInfo: {
          plan: subscription.plan,
          usage: {
            posts: subscription.usage.posts + 1,
            limit: subscription.limits.posts,
            remaining: user.getRemainingQuota('posts')
          }
        }
      }),
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

// Apply subscription middleware to POST handler with comprehensive checks
export const POST = withSubscription(createPostHandler, {
  requiredAction: 'create_post',
  incrementUsage: {
    type: 'posts',
    amount: 1,
  }
});

/**
 * GET /api/posts
 * Fetch all blog posts (no subscription restrictions)
 */
export async function GET() {
  try {
    await connectToDB();

    // Fetch posts
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for performance

    // Backfill/sanitize author info by joining with User collection
    try {
      const { default: User } = await import("@/models/User");
      const authorIds = Array.from(new Set(posts.map(p => String(p.authorId)).filter(Boolean)));
      if (authorIds.length) {
        const users = await User.find({ _id: { $in: authorIds } }).select("name image").lean();
        const userMap = new Map(users.map(u => [String(u._id), u]));
        const isValidUrl = (url) => typeof url === 'string' && /^https?:\/\//.test(url);
        for (const p of posts) {
          if (p.authorId && userMap.has(String(p.authorId))) {
            const u = userMap.get(String(p.authorId));
            if (!p.authorName || p.authorName === "") {
              p.authorName = u?.name || p.authorName || "Anonymous";
            }
            // If authorImage is missing or not a proper URL (e.g., "600x600"), replace with user's profile image
            if (!p.authorImage || !isValidUrl(p.authorImage)) {
              p.authorImage = u?.image || null;
            }
          }
        }
      }
    } catch (e) {
      console.warn("⚠ Could not backfill author info:", e?.message || e);
    }

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