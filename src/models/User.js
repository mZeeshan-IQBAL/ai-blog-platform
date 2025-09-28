// src/models/User.js
import mongoose from "mongoose";

// =======================
// Subscription Schema (Updated for EasyPaisa/JazzCash)
// =======================
const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["free", "starter", "pro", "business"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    // Payment details (generic for EasyPaisa/JazzCash)
    transactionId: String, // e.g., EasyPaisa transaction ID
    payerEmail: String,
    amount: { type: Number, default: 0 }, // in PKR
    currency: { type: String, default: "PKR" },

    // Time-based access (CRITICAL for one-time payments)
    startDate: Date,        // Set when payment succeeds
    expiresAt: Date,        // startDate + 30 days (or plan duration)

    // Usage tracking
    usage: {
      storage: { type: Number, default: 0 }, // in GB
      posts: { type: Number, default: 0 },
      apiCalls: { type: Number, default: 0 },
    },

    // Plan limits
    limits: {
      storage: { type: Number, default: 5 },
      posts: { type: Number, default: 5 },
      apiCalls: { type: Number, default: 1000 },
    },
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
  const planLimits = {
    free: { storage: 5, posts: 5, apiCalls: 1000 },
    starter: { storage: 20, posts: -1, apiCalls: 5000 },
    pro: { storage: 50, posts: -1, apiCalls: 10000 },
    business: { storage: 100, posts: -1, apiCalls: -1 },
  };
  this.subscription.limits = planLimits[this.subscription.plan] || planLimits.free;
};

UserSchema.methods.hasFeatureAccess = function (feature) {
  // Check if access is still valid (not expired)
  if (this.subscription.expiresAt && new Date() > new Date(this.subscription.expiresAt)) {
    this.subscription.status = "expired";
    this.save(); // Optional: auto-update status
    return feature === "basic";
  }

  if (!this.subscription || this.subscription.status !== "active") {
    return feature === "basic";
  }

  const planFeatures = {
    free: ["basic"],
    starter: ["basic", "advanced", "priority-support", "analytics"],
    pro: ["basic", "advanced", "priority-support", "analytics", "custom-domain", "team-collaboration"],
    business: ["basic", "advanced", "priority-support", "analytics", "custom-domain", "team-collaboration", "api", "unlimited", "white-label"],
  };
  return planFeatures[this.subscription.plan]?.includes(feature) || false;
};

UserSchema.methods.canPerformAction = function (actionType) {
  // First check if subscription is still valid
  if (this.subscription.expiresAt && new Date() > new Date(this.subscription.expiresAt)) {
    return actionType === "basic"; // or false for all paid actions
  }

  const { usage, limits } = this.subscription;
  switch (actionType) {
    case "create_post": return limits.posts === -1 || usage.posts < limits.posts;
    case "upload_file": return limits.storage === -1 || usage.storage < limits.storage;
    case "api_call": return limits.apiCalls === -1 || usage.apiCalls < limits.apiCalls;
    default: return true;
  }
};

UserSchema.methods.incrementUsage = function (actionType, amount = 1) {
  switch (actionType) {
    case "posts": this.subscription.usage.posts += amount; break;
    case "storage": this.subscription.usage.storage += amount; break;
    case "apiCalls": this.subscription.usage.apiCalls += amount; break;
  }
  return this.save();
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