"use client";

import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

export default function SubscriptionStatus({ 
  showUsage = true, 
  showFeatures = true, 
  showUpgradeButton = true,
  compact = false 
}) {
  const { subscription, usage, limits, isPremium, loading, error } = useSubscription();

  if (loading) {
    return (
      <div className={`animate-pulse ${compact ? 'p-4' : 'p-6'} bg-gray-100 rounded-lg`}>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className={`${compact ? 'p-4' : 'p-6'} bg-red-50 border border-red-200 rounded-lg`}>
        <p className="text-red-700 text-sm">Unable to load subscription details</p>
      </div>
    );
  }

  const planNames = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    business: 'Business',
    enterprise: 'Enterprise'
  };

  const planColors = {
    free: 'bg-gray-50 border-gray-200 text-gray-700',
    starter: 'bg-blue-50 border-blue-200 text-blue-700',
    pro: 'bg-green-50 border-green-200 text-green-700',
    business: 'bg-purple-50 border-purple-200 text-purple-700',
    enterprise: 'bg-orange-50 border-orange-200 text-orange-700'
  };

  const planColor = planColors[subscription.plan] || planColors.free;

  return (
    <div className={`${compact ? 'p-4' : 'p-6'} border rounded-lg ${planColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPremium 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}>
            {planNames[subscription.plan]} Plan
          </div>
          {isPremium && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Active
            </div>
          )}
        </div>
        
        {showUpgradeButton && !isPremium && (
          <a
            href="/pricing"
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Upgrade
          </a>
        )}
      </div>

      {/* Expiration */}
      {subscription.expiresAt && (
        <div className="mb-4 text-sm text-gray-600">
          {isPremium ? 'Expires' : 'Expired'}: {new Date(subscription.expiresAt).toLocaleDateString()}
        </div>
      )}

      {/* Usage Statistics */}
      {showUsage && limits && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Posts */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Posts</div>
            <div className={`font-bold text-lg ${
              limits.posts === -1 ? 'text-green-600' : 
              (usage?.posts || 0) >= limits.posts ? 'text-red-600' : 
              (usage?.posts || 0) / limits.posts > 0.8 ? 'text-yellow-600' : 'text-gray-800'
            }`}>
              {usage?.posts || 0}/{limits.posts === -1 ? '∞' : limits.posts}
            </div>
            {limits.posts !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className={`h-1 rounded-full ${
                    (usage?.posts || 0) >= limits.posts ? 'bg-red-500' : 
                    (usage?.posts || 0) / limits.posts > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(((usage?.posts || 0) / limits.posts) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Storage */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Storage</div>
            <div className="font-bold text-lg text-gray-800">
              {Math.round(usage?.storage || 0)}MB/{limits.storage === -1 ? '∞' : `${limits.storage}MB`}
            </div>
            {limits.storage !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="h-1 rounded-full bg-blue-500"
                  style={{ width: `${Math.min(((usage?.storage || 0) / limits.storage) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* File Size */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Max File</div>
            <div className="font-bold text-lg text-gray-800">
              {limits.maxFileSize === -1 ? '∞' : `${limits.maxFileSize}MB`}
            </div>
          </div>

          {/* AI Calls */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">AI Calls</div>
            <div className={`font-bold text-lg ${
              limits.aiCalls === -1 ? 'text-green-600' : 
              (usage?.aiCalls || 0) >= limits.aiCalls ? 'text-red-600' : 'text-gray-800'
            }`}>
              {usage?.aiCalls || 0}/{limits.aiCalls === -1 ? '∞' : limits.aiCalls}
            </div>
            {limits.aiCalls !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className={`h-1 rounded-full ${
                    (usage?.aiCalls || 0) >= limits.aiCalls ? 'bg-red-500' : 
                    (usage?.aiCalls || 0) / limits.aiCalls > 0.8 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(((usage?.aiCalls || 0) / limits.aiCalls) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      {showFeatures && (
        <div className="border-t border-current/20 pt-4">
          <div className="text-sm text-gray-600 mb-2">Available Features:</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`flex items-center gap-1 ${isPremium ? 'text-green-600' : 'text-gray-400'}`}>
              {isPremium ? '✅' : '❌'} Unlimited Posts
            </div>
            <div className={`flex items-center gap-1 ${isPremium ? 'text-green-600' : 'text-gray-400'}`}>
              {isPremium ? '✅' : '❌'} Scheduled Posts
            </div>
            <div className={`flex items-center gap-1 ${isPremium ? 'text-green-600' : 'text-gray-400'}`}>
              {isPremium ? '✅' : '❌'} Advanced Analytics
            </div>
            <div className={`flex items-center gap-1 ${isPremium ? 'text-green-600' : 'text-gray-400'}`}>
              {isPremium ? '✅' : '❌'} Priority Support
            </div>
            <div className={`flex items-center gap-1 ${isPremium ? 'text-green-600' : 'text-gray-400'}`}>
              {isPremium ? '✅' : '❌'} Custom Branding
            </div>
            <div className={`flex items-center gap-1 ${isPremium ? 'text-green-600' : 'text-gray-400'}`}>
              {isPremium ? '✅' : '❌'} API Access
            </div>
          </div>
        </div>
      )}

      {/* Manage Subscription */}
      <div className="mt-4 pt-4 border-t border-current/20">
        <div className="flex gap-3">
          <a
            href="/billing/manage"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Manage Subscription
          </a>
          {!isPremium && (
            <a
              href="/pricing"
              className="text-sm text-green-600 hover:text-green-700 underline"
            >
              View All Plans
            </a>
          )}
        </div>
      </div>
    </div>
  );
}