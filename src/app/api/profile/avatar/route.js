// app/api/profile/avatar/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { uploadAvatar } from "@/lib/cloudinary";
import { cacheDel } from "@/lib/redis";
import { withSubscription } from "@/lib/subscriptionMiddleware";

async function avatarUploadHandler(request) {
  try {
    // Get user and subscription from middleware
    const user = request.user;
    const subscription = request.subscription;
    const session = { user: { id: user._id, name: user.name, email: user.email } };

    // Database already connected by middleware

    const form = await request.formData();
    const file = form.get("image");
    if (!file || !file.size) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }
    
    // Get subscription-based file size limit
    const maxSize = (subscription.limits?.maxFileSize || 5) * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      return Response.json({ 
        error: `File too large. Your ${subscription.plan} plan allows maximum ${subscription.limits?.maxFileSize || 5}MB files.`,
        upgradeRequired: true,
        currentPlan: subscription.plan,
        maxFileSize: subscription.limits?.maxFileSize || 5
      }, { status: 413 });
    }
    
    // Check storage quota
    const fileSizeMB = file.size / (1024 * 1024);
    const currentStorage = subscription.usage?.storage || 0;
    const storageLimit = subscription.limits?.storage || 100;
    
    if (storageLimit !== -1 && (currentStorage + fileSizeMB) > storageLimit) {
      return Response.json({ 
        error: `Storage limit exceeded. Your ${subscription.plan} plan allows ${storageLimit}MB total storage.`,
        upgradeRequired: true,
        currentPlan: subscription.plan,
        currentUsage: Math.round(currentStorage),
        storageLimit: storageLimit
      }, { status: 507 }); // Insufficient Storage
    }

    const result = await uploadAvatar(file);
    const url = result.secure_url?.trim();

    if (!url) {
      return Response.json({ error: "Upload failed" }, { status: 500 });
    }

    // Update user profile image
    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { image: url, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    // Increment storage usage
    await user.incrementUsage('storage', fileSizeMB);
    await user.incrementUsage('fileUploads', 1);

    // Invalidate cached blog lists so avatars refresh immediately
    try { await cacheDel("posts:all:v2"); } catch (_) {}
    try { await cacheDel("posts:all:v3"); } catch (_) {}

    return Response.json({ 
      image: updated?.image || url,
      storageUsed: Math.round((subscription.usage?.storage || 0) + fileSizeMB),
      storageLimit: storageLimit === -1 ? 'unlimited' : storageLimit,
      remainingStorage: storageLimit === -1 ? 'unlimited' : Math.max(0, storageLimit - (subscription.usage?.storage || 0) - fileSizeMB)
    });
  } catch (e) {
    console.error("Avatar upload error:", e);
    return Response.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}

// Apply subscription middleware with file upload tracking
export const POST = withSubscription(avatarUploadHandler, {
  requiredAction: 'upload_file',
  requireActiveSubscription: false, // Allow free tier with limits
  incrementUsage: {
    type: 'fileUploads',
    amount: 1
  }
});
