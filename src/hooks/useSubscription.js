// 4. Updated useSubscription hook to work with your auth system
// src/hooks/useSubscription.js (updated)
// src/hooks/useSubscription.js
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useSubscription() {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = useCallback(async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/billing/subscription');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      
      const data = await response.json();
      setSubscription(data.subscription);
      setUsage(data.usage);
      setLimits(data.limits);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const hasFeatureAccess = (feature) => {
    if (!subscription || subscription.status !== 'active') {
      return feature === 'basic';
    }
    
    const planFeatures = {
      free: ['basic'],
      starter: ['basic', 'advanced', 'priority-support', 'analytics'],
      pro: ['basic', 'advanced', 'priority-support', 'analytics', 'custom-domain', 'team-collaboration'],
      business: ['basic', 'advanced', 'priority-support', 'analytics', 'custom-domain', 'team-collaboration', 'api', 'unlimited', 'white-label']
    };
    
    return planFeatures[subscription.plan]?.includes(feature) || false;
  };

  const canPerformAction = (actionType) => {
    if (!usage || !limits) return true;
    
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

  const getUsagePercentage = (actionType) => {
    if (!usage || !limits) return 0;
    
    const usageValue = usage[actionType] || 0;
    const limitValue = limits[actionType];
    
    if (limitValue === -1) return 0; // Unlimited
    return Math.min((usageValue / limitValue) * 100, 100);
  };

  const isActive = subscription?.status === 'active';
  const isPremium = subscription?.plan !== 'free' && isActive;

  return {
    subscription,
    usage,
    limits,
    loading,
    error,
    refetch: fetchSubscription,
    hasFeatureAccess,
    canPerformAction,
    getUsagePercentage,
    isActive,
    isPremium
  };
}
