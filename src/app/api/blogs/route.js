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
import { withSubscription } from "@/lib/subscriptionMiddleware";
import { z } from "zod";

// ✅ Use nodejs runtime because we're using mongoose/DB
export const runtime = "nodejs";

/**
 * Handles POST request to create a new blog (supports drafts and scheduling)
 */
async function createBlogHandler(req) {
  // Get user and subscription from middleware
  const user = req.user;
  const subscription = req.subscription;
  const session = { user: { id: user._id, name: user.name, email: user.email, image: user.image } };

  try {
    const formData = await req.formData(); // API routes in App Router support this
    const title = formData.get("title")?.trim();
    const content = formData.get("content");
    const category = formData.get("category") || "General";
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags")) : [];
    const file = formData.get("image");
    const status = (formData.get("status") || "published").toString();
    const scheduledAtRaw = formData.get("scheduledAt");
    const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw.toString()) : null;

    // Validate required fields with zod
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
    
    // Check scheduled post feature access (premium feature)
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

    let coverImageUrl = "";

    if (file?.size > 0) {
      // Check file size limits
      const maxFileSize = (subscription.limits?.maxFileSize || 5) * 1024 * 1024; // MB to bytes
      if (file.size > maxFileSize) {
        return new Response(
          JSON.stringify({ 
            error: `File too large. Your ${subscription.plan} plan allows maximum ${subscription.limits?.maxFileSize || 5}MB files.`,
            upgradeRequired: true,
            currentPlan: subscription.plan
          }),
          { status: 413, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // Check storage quota
      const fileSizeMB = file.size / (1024 * 1024);
      const currentStorage = subscription.usage?.storage || 0;
      const storageLimit = subscription.limits?.storage || 100;
      
      if (storageLimit !== -1 && (currentStorage + fileSizeMB) > storageLimit) {
        return new Response(
          JSON.stringify({ 
            error: `Storage limit exceeded. Your ${subscription.plan} plan allows ${storageLimit}MB total storage.`,
            upgradeRequired: true,
            currentPlan: subscription.plan
          }),
          { status: 507, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // Nodejs runtime supports buffer → upload to Cloudinary
      const arrayBuffer = await file.arrayBuffer();
      const result = await uploadImage({ arrayBuffer: () => arrayBuffer });
      coverImageUrl = result.secure_url.trim();
      
      // Increment storage usage
      await user.incrementUsage('storage', fileSizeMB);
      await user.incrementUsage('fileUploads', 1);
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
      // Add premium features based on plan
      isPremium: subscription.plan !== 'free',
      planType: subscription.plan,
    });

    await newPost.save();
    
    // Increment post usage counter
    await user.incrementUsage('posts', 1);

    // Create initial version (premium feature for version tracking)
    if (user.hasFeatureAccess('advanced')) {
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
    }

    await cacheDel("posts:all");
    await cacheDel(`post:${newPost.slug}`);
    revalidatePath("/blog");

    return new Response(JSON.stringify({
      ...newPost.toObject(),
      subscriptionInfo: {
        plan: subscription.plan,
        usage: {
          posts: subscription.usage.posts + 1,
          limit: subscription.limits.posts,
          remaining: user.getRemainingQuota('posts')
        }
      }
    }), {
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

// Apply subscription middleware to POST handler with comprehensive checks
export const POST = withSubscription(createBlogHandler, {
  requiredAction: 'create_post',
  requireActiveSubscription: false, // Allow free tier with limits
  incrementUsage: {
    type: 'posts',
    amount: 1,
  }
});
