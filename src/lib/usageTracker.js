// 6. Usage tracking middleware for API routes
// src/lib/usageTracker.js
export async function trackUsage(user, actionType, amount = 1) {
  if (!user.canPerformAction(actionType)) {
    throw new Error(`Usage limit exceeded for ${actionType}`);
  }
  
  await user.incrementUsage(actionType, amount);
  return true;
}