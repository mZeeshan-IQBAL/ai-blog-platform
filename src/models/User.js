// 1. Updated src/models/User.js (with subscription schema added)
import mongoose from "mongoose";

// Subscription schema for billing
const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'business'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial'],
    default: 'active'
  },
  // PayPal specific fields
  paymentId: String,
  subscriptionId: String, // PayPal subscription ID for recurring payments
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
    apiCalls: { type: Number, default: 0 }
  },
  
  // Plan limits based on subscription
  limits: {
    storage: { type: Number, default: 5 }, // GB
    posts: { type: Number, default: 5 },
    apiCalls: { type: Number, default: 1000 }
  }
}, {
  timestamps: true
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  
  // OAuth provider info
  provider: { type: String },
   providerId: { type: String, sparse: true },
  
  // Social features
  follows: [{ type: String }], // Array of providerIds that this user follows
  followers: [{ type: String }], // Array of providerIds that follow this user
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  
  // Additional user info
  bio: { type: String },
  website: { type: String },
  location: { type: String },
  
  // Account status
  verified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  
  // Billing subscription - NEW
  subscription: {
    type: subscriptionSchema,
    default: () => ({
      plan: 'free',
      status: 'active',
      limits: {
        storage: 5,
        posts: 5,
        apiCalls: 1000
      }
    })
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update plan limits when subscription plan changes
  if (this.isModified('subscription.plan')) {
    this.updatePlanLimits();
  }
  
  next();
});

// Method to update plan limits based on subscription
UserSchema.methods.updatePlanLimits = function() {
  const planLimits = {
    free: { storage: 5, posts: 5, apiCalls: 1000 },
    starter: { storage: 20, posts: -1, apiCalls: 5000 }, // -1 means unlimited
    pro: { storage: 50, posts: -1, apiCalls: 10000 },
    business: { storage: 100, posts: -1, apiCalls: -1 }
  };
  
  const limits = planLimits[this.subscription.plan] || planLimits.free;
  this.subscription.limits = limits;
};

// Method to check if user has feature access
UserSchema.methods.hasFeatureAccess = function(feature) {
  if (!this.subscription || this.subscription.status !== 'active') {
    return feature === 'basic';
  }
  
  const planFeatures = {
    free: ['basic'],
    starter: ['basic', 'advanced', 'priority-support', 'analytics'],
    pro: ['basic', 'advanced', 'priority-support', 'analytics', 'custom-domain', 'team-collaboration'],
    business: ['basic', 'advanced', 'priority-support', 'analytics', 'custom-domain', 'team-collaboration', 'api', 'unlimited', 'white-label']
  };
  
  return planFeatures[this.subscription.plan]?.includes(feature) || false;
};

// Method to check usage limits
UserSchema.methods.canPerformAction = function(actionType) {
  const usage = this.subscription.usage;
  const limits = this.subscription.limits;
  
  switch (actionType) {
    case 'create_post':
      return limits.posts === -1 || usage.posts < limits.posts;
    case 'upload_file':
      return limits.storage === -1 || usage.storage < limits.storage;
    case 'api_call':
      return limits.apiCalls === -1 || usage.apiCalls < limits.apiCalls;
    default:
      return true;
  }
};

// Method to increment usage
UserSchema.methods.incrementUsage = function(actionType, amount = 1) {
  switch (actionType) {
    case 'posts':
      this.subscription.usage.posts += amount;
      break;
    case 'storage':
      this.subscription.usage.storage += amount;
      break;
    case 'apiCalls':
      this.subscription.usage.apiCalls += amount;
      break;
  }
  return this.save();
};

// Static method to find user by provider ID (for your OAuth system)
UserSchema.statics.findByProviderId = function(providerId) {
  return this.findOne({ providerId });
};

// Prevent recompilation during development
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;