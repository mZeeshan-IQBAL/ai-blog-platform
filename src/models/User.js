// src/models/User.js
import mongoose from "mongoose";

// =======================
// Subscription Schema (Enhanced with comprehensive limits)
// =======================
const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["free", "starter", "pro", "business", "enterprise"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "past_due", "trialing"],
      default: "active",
    },
    // Payment details (generic for EasyPaisa/JazzCash/Stripe/PayPal)
    transactionId: String, // e.g., EasyPaisa transaction ID
    // Stripe fields
    stripeSubscriptionId: String, // For Stripe recurring subscriptions
    stripeCustomerId: String,
    stripePriceId: String,
    // PayPal fields
    paypalOrderId: String,
    paypalPayerId: String,
    // Common fields
    payerEmail: String,
    amount: { type: Number, default: 0 }, // monetary amount
    currency: { type: String, default: "USD" },
    interval: { type: String, enum: ["month", "year", "one-time"], default: "one-time" },
    gateway: { type: String, enum: ["stripe", "paypal", "local"], default: "local" },

    // Time-based access (CRITICAL for one-time payments)
    startDate: Date,        // Set when payment succeeds
    expiresAt: Date,        // startDate + plan duration
    currentPeriodStart: Date, // For recurring subscriptions
    currentPeriodEnd: Date,   // For recurring subscriptions
    cancelledAt: Date,
    lastPaymentFailed: Date,

    // Enhanced usage tracking
    usage: {
      storage: { type: Number, default: 0 }, // in MB
      posts: { type: Number, default: 0 },
      aiCalls: { type: Number, default: 0 },
      aiTokens: { type: Number, default: 0 }, // AI tokens used
      fileUploads: { type: Number, default: 0 },
      customDomains: { type: Number, default: 0 },
      teamMembers: { type: Number, default: 0 },
      analyticsViews: { type: Number, default: 0 },
      emailsSent: { type: Number, default: 0 },
    },

    // Enhanced plan limits
    limits: {
      storage: { type: Number, default: 100 }, // in MB (100MB for free)
      posts: { type: Number, default: 5 }, // -1 for unlimited
      aiCalls: { type: Number, default: 10 }, // AI assistance calls per month
      aiTokens: { type: Number, default: 10000 }, // AI tokens per month
      fileUploads: { type: Number, default: 10 }, // File uploads per month
      maxFileSize: { type: Number, default: 5 }, // Max file size in MB
      customDomains: { type: Number, default: 0 },
      teamMembers: { type: Number, default: 1 },
      analyticsRetention: { type: Number, default: 30 }, // Days of analytics data
      emailsPerMonth: { type: Number, default: 50 },
      scheduledPosts: { type: Number, default: 0 }, // Scheduled posts allowed
      exportData: { type: Boolean, default: false }, // Can export data
      prioritySupport: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
    },

    // Feature flags
    features: {
      aiWritingAssistant: { type: String, enum: ["basic", "advanced", "premium"], default: "basic" },
      analytics: { type: String, enum: ["basic", "advanced", "premium"], default: "basic" },
      customization: { type: String, enum: ["basic", "advanced", "premium"], default: "basic" },
      collaboration: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false },
      sslSupport: { type: Boolean, default: false },
      backups: { type: String, enum: ["none", "weekly", "daily"], default: "none" },
    },

    // Usage reset tracking
    lastResetDate: { type: Date, default: Date.now },
    resetPeriod: { type: String, enum: ["daily", "monthly", "never"], default: "monthly" },
  },
  { timestamps: true }
);

// =======================
// User Schema
// =======================
const UserSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
  },
  image: { type: String },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },

  // Credentials
  passwordHash: { type: String },

  // Provider Fields
  provider: { type: String, required: true, default: "credentials" },
  providerId: { type: String, required: true },

  // Password reset
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
}, 
{
  timestamps: true,
});

// Enforce uniqueness
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

// =======================
// Social relationships
// =======================
UserSchema.add({
  follows: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

// Profile extras
UserSchema.add({
  bio: { type: String },
  website: { type: String },
  location: { type: String },
});

// Account status
UserSchema.add({
  verified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  blocked: { type: Boolean, default: false },
  blockReason: { type: String, default: "" },
  blockedAt: { type: Date },
});

UserSchema.index({ blocked: 1, active: 1 });

// Email preferences
UserSchema.add({
  emailNotifications: { type: Boolean, default: true },
  notificationPreferences: {
    likes: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    bookmarks: { type: Boolean, default: true },
    follows: { type: Boolean, default: true }
  }
});

// Subscription
UserSchema.add({
  subscription: {
    type: subscriptionSchema,
    default: () => ({
      plan: "free",
      status: "active",
      limits: { storage: 5, posts: 5, apiCalls: 1000 },
    }),
  },
});

// =======================
// Pre-save hook
// =======================
UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();

  if (!this.providerId) {
    this.providerId = this._id.toString();
  }

  // Only auto-set startDate if it's a new paid subscription
  if (this.isModified("subscription.plan") && this.subscription.plan !== "free") {
    if (!this.subscription.startDate) {
      this.subscription.startDate = new Date();
      // Set expiresAt to 30 days from now (adjust per plan if needed)
      this.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    this.updatePlanLimits();
  }

  next();
});

// =======================
// Instance Methods
// =======================
UserSchema.methods.updatePlanLimits = function () {
  const planConfigs = {
    free: {
      limits: {
        storage: 100, // 100MB
        posts: 5,
        aiCalls: 10,
        aiTokens: 10000,
        fileUploads: 10,
        maxFileSize: 5, // 5MB
        customDomains: 0,
        teamMembers: 1,
        analyticsRetention: 30,
        emailsPerMonth: 50,
        scheduledPosts: 0,
        exportData: false,
        prioritySupport: false,
        customBranding: false,
        apiAccess: false,
        advancedAnalytics: false,
      },
      features: {
        aiWritingAssistant: "basic",
        analytics: "basic",
        customization: "basic",
        collaboration: false,
        whiteLabel: false,
        sslSupport: false,
        backups: "none",
      }
    },
    starter: {
      limits: {
        storage: 2048, // 2GB
        posts: -1, // Unlimited
        aiCalls: 100,
        aiTokens: 50000,
        fileUploads: 50,
        maxFileSize: 25, // 25MB
        customDomains: 1,
        teamMembers: 1,
        analyticsRetention: 90,
        emailsPerMonth: 500,
        scheduledPosts: 10,
        exportData: true,
        prioritySupport: false,
        customBranding: false,
        apiAccess: false,
        advancedAnalytics: true,
      },
      features: {
        aiWritingAssistant: "advanced",
        analytics: "advanced",
        customization: "advanced",
        collaboration: false,
        whiteLabel: false,
        sslSupport: true,
        backups: "weekly",
      }
    },
    pro: {
      limits: {
        storage: 10240, // 10GB
        posts: -1, // Unlimited
        aiCalls: 500,
        aiTokens: 200000,
        fileUploads: 200,
        maxFileSize: 100, // 100MB
        customDomains: 3,
        teamMembers: 5,
        analyticsRetention: 365,
        emailsPerMonth: 2000,
        scheduledPosts: 50,
        exportData: true,
        prioritySupport: true,
        customBranding: true,
        apiAccess: true,
        advancedAnalytics: true,
      },
      features: {
        aiWritingAssistant: "premium",
        analytics: "premium",
        customization: "premium",
        collaboration: true,
        whiteLabel: true,
        sslSupport: true,
        backups: "daily",
      }
    },
    business: {
      limits: {
        storage: 51200, // 50GB
        posts: -1, // Unlimited
        aiCalls: -1, // Unlimited
        aiTokens: -1, // Unlimited
        fileUploads: -1, // Unlimited
        maxFileSize: 500, // 500MB
        customDomains: 10,
        teamMembers: 20,
        analyticsRetention: -1, // Forever
        emailsPerMonth: 10000,
        scheduledPosts: -1, // Unlimited
        exportData: true,
        prioritySupport: true,
        customBranding: true,
        apiAccess: true,
        advancedAnalytics: true,
      },
      features: {
        aiWritingAssistant: "premium",
        analytics: "premium",
        customization: "premium",
        collaboration: true,
        whiteLabel: true,
        sslSupport: true,
        backups: "daily",
      }
    },
    enterprise: {
      limits: {
        storage: -1, // Unlimited
        posts: -1, // Unlimited
        aiCalls: -1, // Unlimited
        aiTokens: -1, // Unlimited
        fileUploads: -1, // Unlimited
        maxFileSize: -1, // Unlimited
        customDomains: -1, // Unlimited
        teamMembers: -1, // Unlimited
        analyticsRetention: -1, // Forever
        emailsPerMonth: -1, // Unlimited
        scheduledPosts: -1, // Unlimited
        exportData: true,
        prioritySupport: true,
        customBranding: true,
        apiAccess: true,
        advancedAnalytics: true,
      },
      features: {
        aiWritingAssistant: "premium",
        analytics: "premium",
        customization: "premium",
        collaboration: true,
        whiteLabel: true,
        sslSupport: true,
        backups: "daily",
      }
    }
  };
  
  const config = planConfigs[this.subscription.plan] || planConfigs.free;
  this.subscription.limits = { ...this.subscription.limits, ...config.limits };
  this.subscription.features = { ...this.subscription.features, ...config.features };
};

UserSchema.methods.hasFeatureAccess = function (feature) {
  // Check if access is still valid (not expired)
  if (this.subscription.expiresAt && new Date() > new Date(this.subscription.expiresAt)) {
    this.subscription.status = "expired";
    return feature === "basic";
  }

  if (!this.subscription || this.subscription.status !== "active") {
    return feature === "basic";
  }

  // Check specific feature flags first
  const featureMap = {
    'ai-basic': () => true,
    'ai-advanced': () => ['advanced', 'premium'].includes(this.subscription.features.aiWritingAssistant),
    'ai-premium': () => this.subscription.features.aiWritingAssistant === 'premium',
    'analytics-basic': () => true,
    'analytics-advanced': () => ['advanced', 'premium'].includes(this.subscription.features.analytics),
    'analytics-premium': () => this.subscription.features.analytics === 'premium',
    'custom-domain': () => this.subscription.limits.customDomains > 0,
    'team-collaboration': () => this.subscription.features.collaboration,
    'priority-support': () => this.subscription.limits.prioritySupport,
    'custom-branding': () => this.subscription.limits.customBranding,
    'api-access': () => this.subscription.limits.apiAccess,
    'white-label': () => this.subscription.features.whiteLabel,
    'export-data': () => this.subscription.limits.exportData,
    'scheduled-posts': () => this.subscription.limits.scheduledPosts > 0,
    'ssl-support': () => this.subscription.features.sslSupport,
    'backups': () => this.subscription.features.backups !== 'none',
  };

  if (featureMap[feature]) {
    return featureMap[feature]();
  }

  // Fallback to legacy feature check
  const planFeatures = {
    free: ["basic"],
    starter: ["basic", "advanced", "analytics", "ssl-support"],
    pro: ["basic", "advanced", "analytics", "custom-domain", "team-collaboration", "priority-support", "custom-branding", "api-access", "export-data"],
    business: ["basic", "advanced", "analytics", "custom-domain", "team-collaboration", "priority-support", "custom-branding", "api-access", "export-data", "white-label"],
    enterprise: ["basic", "advanced", "analytics", "custom-domain", "team-collaboration", "priority-support", "custom-branding", "api-access", "export-data", "white-label"],
  };
  
  return planFeatures[this.subscription.plan]?.includes(feature) || false;
};

UserSchema.methods.canPerformAction = function (actionType, fileSize = 0) {
  // First check if subscription is still valid
  if (this.subscription.expiresAt && new Date() > new Date(this.subscription.expiresAt)) {
    return actionType === "basic" || actionType === "read";
  }

  if (!this.subscription || this.subscription.status !== "active") {
    return actionType === "basic" || actionType === "read";
  }

  const { usage, limits } = this.subscription;
  
  switch (actionType) {
    case "create_post": 
      return limits.posts === -1 || usage.posts < limits.posts;
    
    case "upload_file": 
      const hasStorageSpace = limits.storage === -1 || (usage.storage + fileSize) <= limits.storage;
      const hasUploadQuota = limits.fileUploads === -1 || usage.fileUploads < limits.fileUploads;
      const fileSizeAllowed = limits.maxFileSize === -1 || fileSize <= limits.maxFileSize;
      return hasStorageSpace && hasUploadQuota && fileSizeAllowed;
    
    case "ai_call": 
      return limits.aiCalls === -1 || usage.aiCalls < limits.aiCalls;
    
    case "ai_tokens":
      return limits.aiTokens === -1 || usage.aiTokens < limits.aiTokens;
    
    case "schedule_post":
      return limits.scheduledPosts === -1 || usage.posts < limits.scheduledPosts;
    
    case "send_email":
      return limits.emailsPerMonth === -1 || usage.emailsSent < limits.emailsPerMonth;
    
    case "add_team_member":
      return limits.teamMembers === -1 || usage.teamMembers < limits.teamMembers;
    
    case "add_custom_domain":
      return limits.customDomains === -1 || usage.customDomains < limits.customDomains;
    
    case "view_analytics":
      return this.hasFeatureAccess('analytics-basic');
    
    case "view_advanced_analytics":
      return this.hasFeatureAccess('analytics-advanced');
    
    case "export_data":
      return limits.exportData;
    
    case "api_access":
      return limits.apiAccess;
    
    default: 
      return true;
  }
};

UserSchema.methods.incrementUsage = async function (actionType, amount = 1) {
  const now = new Date();
  
  // Check if we need to reset usage (monthly reset)
  if (this.subscription.resetPeriod === 'monthly') {
    const lastReset = new Date(this.subscription.lastResetDate);
    const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());
    
    if (monthsSinceReset >= 1) {
      // Reset usage counters
      this.subscription.usage = {
        storage: this.subscription.usage.storage || 0, // Don't reset storage
        posts: 0,
        aiCalls: 0,
        aiTokens: 0,
        fileUploads: 0,
        customDomains: this.subscription.usage.customDomains || 0, // Don't reset domains
        teamMembers: this.subscription.usage.teamMembers || 0, // Don't reset team members
        analyticsViews: 0,
        emailsSent: 0,
      };
      this.subscription.lastResetDate = now;
    }
  }
  
  // Increment the specified usage counter
  switch (actionType) {
    case "posts": 
      this.subscription.usage.posts += amount; 
      break;
    case "storage": 
      this.subscription.usage.storage += amount; 
      break;
    case "aiCalls": 
      this.subscription.usage.aiCalls += amount; 
      break;
    case "aiTokens": 
      this.subscription.usage.aiTokens += amount; 
      break;
    case "fileUploads": 
      this.subscription.usage.fileUploads += amount; 
      break;
    case "emailsSent": 
      this.subscription.usage.emailsSent += amount; 
      break;
    case "analyticsViews": 
      this.subscription.usage.analyticsViews += amount; 
      break;
    case "teamMembers": 
      this.subscription.usage.teamMembers += amount; 
      break;
    case "customDomains": 
      this.subscription.usage.customDomains += amount; 
      break;
  }
  
  return this.save();
};

// Helper method to get usage percentage
UserSchema.methods.getUsagePercentage = function (usageType) {
  const usage = this.subscription.usage[usageType] || 0;
  const limit = this.subscription.limits[usageType];
  
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 100; // No allowance
  
  return Math.min((usage / limit) * 100, 100);
};

// Helper method to check if user is close to limit
UserSchema.methods.isNearLimit = function (usageType, threshold = 80) {
  return this.getUsagePercentage(usageType) >= threshold;
};

// Helper method to get remaining quota
UserSchema.methods.getRemainingQuota = function (usageType) {
  const usage = this.subscription.usage[usageType] || 0;
  const limit = this.subscription.limits[usageType];
  
  if (limit === -1) return Infinity; // Unlimited
  return Math.max(0, limit - usage);
};

// =======================
// Static Methods
// =======================
UserSchema.statics.findByProviderId = function (providerId) {
  return this.findOne({ providerId });
};

// =======================
// Export
// =======================
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;