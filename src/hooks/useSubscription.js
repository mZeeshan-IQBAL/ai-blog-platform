// Optimized useSubscription hook with caching and debouncing
// src/hooks/useSubscription.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

// In-memory cache for subscription data
let subscriptionCache = {
  data: null,
  timestamp: 0,
  CACHE_DURATION: 30000 // 30 seconds
};

export function useSubscription() {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const fetchSubscription = useCallback(async (force = false) => {
    if (status !== 'authenticated') {
      setLoading(false);
      setSubscription(null);
      setUsage(null);
      setLimits(null);
      return;
    }

    // Check cache first (unless forced)
    const now = Date.now();
    if (!force && subscriptionCache.data && (now - subscriptionCache.timestamp) < subscriptionCache.CACHE_DURATION) {
      const cached = subscriptionCache.data;
      setSubscription(cached.subscription);
      setUsage(cached.usage);
      setLimits(cached.limits);
      setError(null);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      const controller = new AbortController();
      
      const response = await fetch('/api/billing/subscription', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      // Check if component is still mounted and this is the latest request
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch subscription`);
      }
      
      const data = await response.json();
      
      // Update cache
      subscriptionCache = {
        data,
        timestamp: now,
        CACHE_DURATION: subscriptionCache.CACHE_DURATION
      };
      
      if (mountedRef.current && requestId === requestIdRef.current) {
        setSubscription(data.subscription);
        setUsage(data.usage);
        setLimits(data.limits);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          console.error('Error fetching subscription:', err);
        }
      }
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [status]);

  useEffect(() => {
    mountedRef.current = true;
    fetchSubscription();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchSubscription]);

  // Utility function to clear cache (useful for forced refreshes)
  const clearCache = useCallback(() => {
    subscriptionCache = {
      data: null,
      timestamp: 0,
      CACHE_DURATION: subscriptionCache.CACHE_DURATION
    };
  }, []);

  const hasFeatureAccess = useCallback((feature) => {
    if (!subscription || !['active', 'cancelled_active'].includes(subscription.status)) {
      return feature === 'basic';
    }
    
    const planFeatures = {
      free: ['basic'],
      starter: ['basic', 'advanced', 'priority-support', 'analytics'],
      pro: ['basic', 'advanced', 'priority-support', 'analytics', 'custom-domain', 'team-collaboration'],
      business: ['basic', 'advanced', 'priority-support', 'analytics', 'custom-domain', 'team-collaboration', 'api', 'unlimited', 'white-label']
    };
    
    return planFeatures[subscription.plan]?.includes(feature) || false;
  }, [subscription]);

  const canPerformAction = useCallback((actionType) => {
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
  }, [usage, limits]);

  const getUsagePercentage = useCallback((actionType) => {
    if (!usage || !limits) return 0;
    
    const usageValue = usage[actionType] || 0;
    const limitValue = limits[actionType];
    
    if (limitValue === -1) return 0; // Unlimited
    return Math.min((usageValue / limitValue) * 100, 100);
  }, [usage, limits]);

  const isActive = ['active', 'cancelled_active'].includes(subscription?.status);
  const isPremium = subscription?.plan !== 'free' && isActive;
  const isCancelled = subscription?.status === 'cancelled_active';

  // Optimized refetch that respects caching
  const refetch = useCallback((force = false) => {
    return fetchSubscription(force);
  }, [fetchSubscription]);

  return {
    subscription,
    usage,
    limits,
    loading,
    error,
    refetch,
    clearCache,
    hasFeatureAccess,
    canPerformAction,
    getUsagePercentage,
    isActive,
    isPremium,
    isCancelled
  };
}
