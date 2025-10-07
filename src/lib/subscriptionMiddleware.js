// src/lib/subscriptionMiddleware.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Subscription middleware to check user limits and permissions
 * @param {Function} handler - The API handler function
 * @param {Object} options - Configuration options
 * @returns {Function} - Enhanced API handler with subscription checks
 */
export function withSubscription(handler, options = {}) {
  return async function enhancedHandler(req, ...args) {
    try {
      // Get user session
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Connect to database
      await connectToDB();

      // Get user with subscription data
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Check if subscription is still valid
      if (user.subscription.expiresAt && new Date() > new Date(user.subscription.expiresAt)) {
        user.subscription.status = "expired";
        await user.save();
      }

      // Extract middleware options
      const {
        requiredFeature,
        requiredAction,
        fileSize = 0,
        incrementUsage,
        requireActiveSubscription = false,
      } = options;

      // Check if active subscription is required
      if (requireActiveSubscription && user.subscription.status !== "active") {
        return NextResponse.json(
          { 
            error: "Active subscription required",
            upgradeRequired: true,
            currentPlan: user.subscription.plan,
            status: user.subscription.status
          },
          { status: 402 } // Payment Required
        );
      }

      // Check feature access
      if (requiredFeature && !user.hasFeatureAccess(requiredFeature)) {
        return NextResponse.json(
          {
            error: `Feature '${requiredFeature}' not available in your current plan`,
            upgradeRequired: true,
            currentPlan: user.subscription.plan,
            requiredFeature,
          },
          { status: 403 }
        );
      }

      // Check action permissions
      if (requiredAction && !user.canPerformAction(requiredAction, fileSize)) {
        const usageInfo = getUsageInfo(user, requiredAction);
        return NextResponse.json(
          {
            error: `Action '${requiredAction}' not allowed - limit exceeded`,
            upgradeRequired: true,
            currentPlan: user.subscription.plan,
            usage: usageInfo,
            requiredAction,
          },
          { status: 429 } // Too Many Requests
        );
      }

      // Add user and subscription context to request
      req.user = user;
      req.subscription = user.subscription;

      // Call the original handler
      const response = await handler(req, ...args);

      // Increment usage if specified and request was successful
      if (incrementUsage && response.status >= 200 && response.status < 300) {
        const { type, amount = 1 } = incrementUsage;
        await user.incrementUsage(type, amount);
      }

      return response;
    } catch (error) {
      console.error("Subscription middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Check subscription limits for multiple actions
 * @param {Object} user - User document
 * @param {Array} actions - Array of actions to check
 * @returns {Object} - Results of limit checks
 */
export function checkMultipleLimits(user, actions) {
  const results = {};
  
  for (const action of actions) {
    if (typeof action === 'string') {
      results[action] = user.canPerformAction(action);
    } else {
      const { type, fileSize = 0 } = action;
      results[type] = user.canPerformAction(type, fileSize);
    }
  }
  
  return results;
}

/**
 * Get usage information for an action type
 * @param {Object} user - User document
 * @param {string} actionType - Type of action
 * @returns {Object} - Usage information
 */
function getUsageInfo(user, actionType) {
  const usageMap = {
    'create_post': 'posts',
    'upload_file': 'storage',
    'ai_call': 'aiCalls',
    'ai_tokens': 'aiTokens',
    'schedule_post': 'posts',
    'send_email': 'emailsSent',
    'add_team_member': 'teamMembers',
    'add_custom_domain': 'customDomains',
  };

  const usageType = usageMap[actionType] || actionType;
  const usage = user.subscription.usage[usageType] || 0;
  const limit = user.subscription.limits[usageType] || 0;

  return {
    current: usage,
    limit: limit === -1 ? 'unlimited' : limit,
    percentage: user.getUsagePercentage(usageType),
    remaining: user.getRemainingQuota(usageType),
  };
}

/**
 * Middleware specifically for API routes that require premium features
 * @param {Function} handler - The API handler function
 * @param {string} feature - Required feature name
 * @returns {Function} - Enhanced API handler
 */
export function requirePremiumFeature(handler, feature) {
  return withSubscription(handler, {
    requiredFeature: feature,
    requireActiveSubscription: true,
  });
}

/**
 * Middleware for rate-limited actions
 * @param {Function} handler - The API handler function
 * @param {string} actionType - Type of action being rate limited
 * @param {Object} options - Additional options
 * @returns {Function} - Enhanced API handler
 */
export function withRateLimit(handler, actionType, options = {}) {
  return withSubscription(handler, {
    requiredAction: actionType,
    incrementUsage: {
      type: actionType.replace('_', '').replace('create_', '').replace('send_', '').replace('add_', ''),
      amount: options.amount || 1,
    },
    ...options,
  });
}

/**
 * Check if user needs to upgrade based on usage patterns
 * @param {Object} user - User document
 * @returns {Object} - Upgrade recommendations
 */
export function getUpgradeRecommendations(user) {
  const recommendations = [];
  const subscription = user.subscription;

  // Check various usage patterns
  if (user.getUsagePercentage('posts') > 80) {
    recommendations.push({
      reason: 'posts_limit',
      message: 'You\'re approaching your monthly post limit',
      suggestedPlan: 'starter',
    });
  }

  if (user.getUsagePercentage('aiCalls') > 80) {
    recommendations.push({
      reason: 'ai_limit',
      message: 'You\'re running low on AI assistance calls',
      suggestedPlan: subscription.plan === 'free' ? 'starter' : 'pro',
    });
  }

  if (user.getUsagePercentage('storage') > 80) {
    recommendations.push({
      reason: 'storage_limit',
      message: 'Your storage is almost full',
      suggestedPlan: subscription.plan === 'free' ? 'starter' : 'pro',
    });
  }

  // Check if user would benefit from premium features
  if (subscription.plan === 'free') {
    recommendations.push({
      reason: 'premium_features',
      message: 'Unlock advanced AI features and unlimited posts',
      suggestedPlan: 'starter',
    });
  }

  return recommendations;
}

/**
 * Format subscription status for API responses
 * @param {Object} user - User document
 * @returns {Object} - Formatted subscription info
 */
export function formatSubscriptionStatus(user) {
  const subscription = user.subscription;
  
  return {
    plan: subscription.plan,
    status: subscription.status,
    features: subscription.features,
    limits: subscription.limits,
    usage: subscription.usage,
    expiresAt: subscription.expiresAt,
    isActive: subscription.status === 'active',
    isPremium: subscription.plan !== 'free' && subscription.status === 'active',
    usagePercentages: {
      posts: user.getUsagePercentage('posts'),
      storage: user.getUsagePercentage('storage'),
      aiCalls: user.getUsagePercentage('aiCalls'),
      aiTokens: user.getUsagePercentage('aiTokens'),
    },
    recommendations: getUpgradeRecommendations(user),
  };
}