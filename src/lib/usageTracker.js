// src/lib/usageTracker.js
// Enhanced usage tracking utilities for comprehensive subscription management

// Map external action types to usage keys used by User.incrementUsage
function mapActionToUsageKey(actionType) {
  switch (actionType) {
    case 'create_post':
      return 'posts';
    case 'ai_call':
      return 'aiCalls';
    case 'ai_tokens':
      return 'aiTokens';
    case 'upload_file':
      return 'fileUploads';
    case 'send_email':
      return 'emailsSent';
    case 'view_analytics':
      return 'analyticsViews';
    default:
      return null; // Not all actions increment a counter
  }
}

// Public helper to enforce limits and increment usage
export async function trackUsage(user, actionType, amount = 1, { fileSizeMB = 0 } = {}) {
  if (!user || typeof user.canPerformAction !== 'function' || typeof user.incrementUsage !== 'function') {
    throw new Error('Invalid user object supplied to trackUsage');
  }

  const allowed = actionType === 'upload_file'
    ? user.canPerformAction('upload_file', fileSizeMB)
    : user.canPerformAction(actionType);

  if (!allowed) {
    throw new Error(`Usage limit exceeded for ${actionType}`);
  }

  const usageKey = mapActionToUsageKey(actionType);

  // If uploading a file, also increment persistent storage by file size (in MB)
  if (actionType === 'upload_file' && fileSizeMB > 0) {
    await user.incrementUsage('storage', fileSizeMB);
  }

  if (usageKey) {
    await user.incrementUsage(usageKey, amount);
  }

  return true;
}

/**
 * AI Token Estimation Utilities
 */
export function estimateTokens(text, model = 'gpt-3.5') {
  if (!text) return 0;

  // Different models have different tokenization patterns
  const tokensPerChar = {
    'gpt-3.5': 0.25,      // ~4 chars per token
    'gpt-4': 0.25,        // Similar to GPT-3.5
    'claude': 0.2,        // ~5 chars per token
    'deepseek': 0.3,      // ~3.3 chars per token (more efficient)
    'gemini': 0.25,       // Similar to GPT models
  };

  const ratio = tokensPerChar[model] || tokensPerChar['gpt-3.5'];
  return Math.ceil(text.length * ratio);
}

// More accurate token estimation using word count
export function estimateTokensFromWords(wordCount, model = 'gpt-3.5') {
  // Approximate tokens per word for different models
  const tokensPerWord = {
    'gpt-3.5': 1.3,
    'gpt-4': 1.3,
    'claude': 1.25,
    'deepseek': 1.4,
    'gemini': 1.3,
  };

  const ratio = tokensPerWord[model] || tokensPerWord['gpt-3.5'];
  return Math.ceil(wordCount * ratio);
}

// Calculate token cost for conversation
export function calculateConversationTokens(messages, model = 'gpt-3.5') {
  if (!Array.isArray(messages)) return 0;

  const totalText = messages.reduce((sum, message) => {
    return sum + (message.content || '').length;
  }, 0);

  // Add overhead for message formatting
  const overhead = messages.length * 10; // ~10 tokens per message for formatting

  return estimateTokens(totalText, model) + overhead;
}

/**
 * Storage Calculation Utilities
 */
// Calculate file size in MB
export function bytesToMB(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100; // Round to 2 decimal places
}

// Calculate storage usage for different file types
export function calculateStorageImpact(file) {
  if (!file || !file.size) return 0;

  const sizeInMB = bytesToMB(file.size);

  // Different file types have different storage implications
  const multipliers = {
    'image/jpeg': 1.0,
    'image/png': 1.2,     // PNG files are usually larger
    'image/gif': 0.8,     // GIF files are often smaller
    'image/webp': 0.7,    // WebP is more efficient
    'video/mp4': 1.5,     // Videos need processing overhead
    'application/pdf': 1.1,
    'text/plain': 0.5,    // Text compresses well
  };

  const multiplier = multipliers[file.type] || 1.0;
  return Math.ceil(sizeInMB * multiplier);
}

/**
 * Usage Analytics and Predictions
 */
// Predict when user will hit limits based on current usage patterns
export function predictLimitReached(usage, limit, resetPeriod = 'monthly') {
  if (limit === -1) return null; // Unlimited
  if (usage >= limit) return 'exceeded';

  const remaining = limit - usage;
  const percentUsed = (usage / limit) * 100;

  // Simple prediction based on usage velocity
  const daysInPeriod = resetPeriod === 'daily' ? 1 : resetPeriod === 'weekly' ? 7 : 30;
  const currentDate = new Date();
  const dayOfPeriod = resetPeriod === 'daily' ? 1 :
                     resetPeriod === 'weekly' ? currentDate.getDay() + 1 :
                     currentDate.getDate();

  if (dayOfPeriod === 0) return null; // Can't predict on first day

  const dailyAverage = usage / dayOfPeriod;
  const remainingDays = daysInPeriod - dayOfPeriod;

  if (dailyAverage * remainingDays > remaining) {
    const daysUntilLimit = Math.floor(remaining / dailyAverage);
    return {
      status: 'warning',
      daysUntilLimit,
      percentUsed,
      projectedUsage: usage + (dailyAverage * remainingDays)
    };
  }

  return {
    status: 'safe',
    percentUsed,
    projectedUsage: usage + (dailyAverage * remainingDays)
  };
}

// Calculate usage efficiency score
export function calculateUsageEfficiency(user) {
  const subscription = user.subscription;
  const limits = subscription.limits;
  const usage = subscription.usage;

  const metrics = [];

  // Check various usage metrics
  ['posts', 'storage', 'aiCalls', 'aiTokens'].forEach(metric => {
    if (limits[metric] !== -1 && limits[metric] > 0) {
      const utilization = (usage[metric] || 0) / limits[metric];
      metrics.push({
        metric,
        utilization,
        usage: usage[metric] || 0,
        limit: limits[metric]
      });
    }
  });

  if (metrics.length === 0) return { score: 100, recommendations: [] };

  const averageUtilization = metrics.reduce((sum, m) => sum + m.utilization, 0) / metrics.length;
  const score = Math.round(averageUtilization * 100);

  const recommendations = [];

  // Generate recommendations based on usage patterns
  metrics.forEach(({ metric, utilization }) => {
    if (utilization > 0.8) {
      recommendations.push(`Consider upgrading - you're using ${Math.round(utilization * 100)}% of your ${metric} limit`);
    } else if (utilization < 0.2 && subscription.plan !== 'free') {
      recommendations.push(`You're only using ${Math.round(utilization * 100)}% of your ${metric} allowance - you might consider a lower plan`);
    }
  });

  return {
    score,
    averageUtilization,
    metrics,
    recommendations
  };
}

/**
 * Plan Optimization Suggestions
 */
// Suggest optimal plan based on usage patterns
export function suggestOptimalPlan(user, availablePlans) {
  const usage = user.subscription.usage;
  const currentPlan = user.subscription.plan;

  // Calculate required limits based on current usage + 20% buffer
  const requiredLimits = {
    posts: Math.ceil((usage.posts || 0) * 1.2),
    storage: Math.ceil((usage.storage || 0) * 1.2),
    aiCalls: Math.ceil((usage.aiCalls || 0) * 1.2),
    aiTokens: Math.ceil((usage.aiTokens || 0) * 1.2),
  };

  // Find the most cost-effective plan that meets requirements
  const suitablePlans = availablePlans.filter(plan => {
    return Object.keys(requiredLimits).every(metric => {
      const planLimit = plan.limits[metric];
      return planLimit === -1 || planLimit >= requiredLimits[metric];
    });
  });

  if (suitablePlans.length === 0) {
    return {
      suggestion: 'enterprise',
      reason: 'Your usage exceeds all standard plans',
      requiredLimits
    };
  }

  // Sort by price (assuming plans have a price field)
  const cheapestPlan = suitablePlans.sort((a, b) => a.price - b.price)[0];

  if (cheapestPlan.id === currentPlan) {
    return {
      suggestion: currentPlan,
      reason: 'Your current plan is optimal for your usage',
      savings: 0
    };
  }

  return {
    suggestion: cheapestPlan.id,
    reason: `This plan better matches your usage patterns`,
    requiredLimits,
    currentPlan,
    suggestedPlan: cheapestPlan
  };
}

/**
 * Usage Reset and Maintenance
 */
// Check if usage should be reset based on subscription period
export function shouldResetUsage(subscription) {
  const now = new Date();
  const lastReset = new Date(subscription.lastResetDate);
  const resetPeriod = subscription.resetPeriod || 'monthly';

  switch (resetPeriod) {
    case 'daily':
      return now.getDate() !== lastReset.getDate() ||
             now.getMonth() !== lastReset.getMonth() ||
             now.getFullYear() !== lastReset.getFullYear();

    case 'weekly':
      return Math.floor((now - lastReset) / (7 * 24 * 60 * 60 * 1000)) >= 1;

    case 'monthly':
    default:
      return now.getMonth() !== lastReset.getMonth() ||
             now.getFullYear() !== lastReset.getFullYear();
  }
}

// Reset usage counters based on what should be reset
export function getUsageResetData(subscription) {
  return {
    // Reset counters that should be reset periodically
    posts: 0,
    aiCalls: 0,
    aiTokens: 0,
    fileUploads: 0,
    analyticsViews: 0,
    emailsSent: 0,
    commentsToday: 0,
    dailyChats: 0,

    // Keep counters that represent persistent resources
    storage: subscription.usage?.storage || 0,
    customDomains: subscription.usage?.customDomains || 0,
    teamMembers: subscription.usage?.teamMembers || 0,
  };
}

/**
 * Real-time Usage Monitoring
 */
// Get real-time usage status for UI components
export function getUsageStatus(user) {
  const subscription = user.subscription;
  const usage = subscription.usage;
  const limits = subscription.limits;

  const status = {};

  Object.keys(limits).forEach(metric => {
    const used = usage[metric] || 0;
    const limit = limits[metric];

    if (limit === -1) {
      status[metric] = {
        used,
        limit: 'unlimited',
        percentage: 0,
        status: 'unlimited',
        remaining: 'unlimited'
      };
    } else {
      const percentage = Math.min((used / limit) * 100, 100);
      const remaining = Math.max(0, limit - used);

      status[metric] = {
        used,
        limit,
        percentage,
        remaining,
        status: percentage >= 100 ? 'exceeded' :
               percentage >= 80 ? 'warning' :
               percentage >= 60 ? 'caution' : 'good'
      };
    }
  });

  return status;
}

const usageTrackerUtils = {
  estimateTokens,
  estimateTokensFromWords,
  calculateConversationTokens,
  bytesToMB,
  calculateStorageImpact,
  predictLimitReached,
  calculateUsageEfficiency,
  suggestOptimalPlan,
  shouldResetUsage,
  getUsageResetData,
  getUsageStatus,
  trackUsage,
};

export default usageTrackerUtils;
