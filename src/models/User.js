// src/models/User.js
import mongoose from "mongoose";

// =======================
// Subscription Schema
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
      enum: ["active", "cancelled", "expired", "trial"],
      default: "active",
    },
    // PayPal fields
    paymentId: String,
    subscriptionId: String,
    payerEmail: String,
    amount: { type: Number, default: 0 },

    // Billing dates
    startDate: { type: Date, default: Date.now },
    nextBillingDate: Date,
    cancelledAt: Date,

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
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },

  // Provider Fields (critical for notifications / NextAuth)
  provider: { type: String, required: true, default: "credentials" },
  providerId: { type: String, required: true }, // now required + unique per provider
  // index to ensure uniqueness across providers
}, 
{
  timestamps: true,
});

// Enforce uniqueness for provider + providerId combination
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true });

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
});

// Email notification preferences
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

  // If providerId is missing somehow, ensure fallback
  if (!this.providerId) {
    this.providerId = this._id.toString();
  }

  if (this.isModified("subscription.plan")) {
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