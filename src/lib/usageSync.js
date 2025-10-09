// src/lib/usageSync.js
// Utility functions to sync user subscription usage with actual data

import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';

/**
 * Sync user's post usage with actual published posts
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Updated usage stats
 */
export async function syncPostUsage(userId) {
  try {
    await connectToDB();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Count actual published posts by this user
    const postCount = await Post.countDocuments({
      authorId: userId,
      status: { $in: ['published'] }, // Count published posts
      deletedAt: null // Exclude deleted posts
    });

    console.log(`📊 User ${userId}: Found ${postCount} published posts`);

    // Update user's subscription usage
    if (!user.subscription) {
      user.subscription = {};
    }
    if (!user.subscription.usage) {
      user.subscription.usage = {};
    }

    // Update the post count in usage
    user.subscription.usage.posts = postCount;
    
    await user.save();

    console.log(`✅ Updated post usage for user ${userId}: ${postCount} posts`);
    
    return {
      userId,
      actualPosts: postCount,
      previousCount: user.subscription.usage.posts || 0,
      updated: true
    };

  } catch (error) {
    console.error('❌ Error syncing post usage:', error);
    throw error;
  }
}

/**
 * Sync all usage metrics for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Complete usage sync results
 */
export async function syncAllUsage(userId) {
  try {
    await connectToDB();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const results = {
      userId,
      updated: {},
      errors: []
    };

    // Sync posts
    try {
      const postSync = await syncPostUsage(userId);
      results.updated.posts = postSync.actualPosts;
    } catch (error) {
      results.errors.push({ type: 'posts', error: error.message });
    }

    // You can add more usage sync functions here in the future
    // For example: syncStorageUsage, syncAICallsUsage, etc.

    return results;
    
  } catch (error) {
    console.error('❌ Error syncing all usage:', error);
    throw error;
  }
}

/**
 * Sync usage for multiple users (admin function)
 * @param {Array<string>} userIds - Array of user IDs (optional, if not provided sync all users)
 * @returns {Promise<Array>} - Array of sync results
 */
export async function syncUsageForMultipleUsers(userIds = null) {
  try {
    await connectToDB();
    
    let users;
    if (userIds && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } }).select('_id');
    } else {
      // Get all users with posts (to avoid syncing empty users)
      const usersWithPosts = await Post.distinct('authorId', { 
        status: 'published', 
        deletedAt: null 
      });
      users = await User.find({ _id: { $in: usersWithPosts } }).select('_id');
    }

    const results = [];
    
    for (const user of users) {
      try {
        const syncResult = await syncAllUsage(user._id.toString());
        results.push(syncResult);
      } catch (error) {
        results.push({
          userId: user._id.toString(),
          error: error.message,
          updated: false
        });
      }
    }

    console.log(`✅ Synced usage for ${results.length} users`);
    return results;
    
  } catch (error) {
    console.error('❌ Error syncing usage for multiple users:', error);
    throw error;
  }
}

/**
 * Get comprehensive usage statistics for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Usage statistics with comparisons
 */
export async function getUserUsageStats(userId) {
  try {
    await connectToDB();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get actual counts from database
    const actualCounts = {
      posts: await Post.countDocuments({
        authorId: userId,
        status: 'published',
        deletedAt: null
      }),
      drafts: await Post.countDocuments({
        authorId: userId,
        status: 'draft',
        deletedAt: null
      }),
      archived: await Post.countDocuments({
        authorId: userId,
        status: 'archived',
        deletedAt: null
      })
    };

    // Get recorded usage
    const recordedUsage = user.subscription?.usage || {};

    return {
      userId,
      plan: user.subscription?.plan || 'free',
      actualCounts,
      recordedUsage,
      discrepancies: {
        posts: actualCounts.posts !== (recordedUsage.posts || 0)
      },
      limits: user.subscription?.limits || {},
      lastSynced: user.subscription?.lastSynced || null
    };

  } catch (error) {
    console.error('❌ Error getting usage stats:', error);
    throw error;
  }
}