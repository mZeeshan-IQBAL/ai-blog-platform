// 🔒 SECURITY: Advanced rate limiting middleware with Redis backend
import { NextResponse } from 'next/server';
import { cacheIncr, getRedis } from "./redis";
// Lazy import to avoid circular dependency
let logSecurityEvent = null;

// Memory fallback for when Redis is unavailable
const memoryCache = new Map();

// Rate limiting configurations for different endpoints
export const RATE_LIMITS = {
  // Authentication endpoints - STRICT
  LOGIN: { limit: 5, window: 900 }, // 5 attempts per 15 minutes
  SIGNUP: { limit: 3, window: 3600 }, // 3 attempts per hour
  PASSWORD_RESET: { limit: 3, window: 3600 }, // 3 attempts per hour
  MFA_VERIFY: { limit: 3, window: 300 }, // 3 MFA attempts per 5 minutes
  
  // API endpoints - MODERATE
  API_DEFAULT: { limit: 100, window: 3600 }, // 100 requests per hour
  API_ADMIN: { limit: 50, window: 3600 }, // 50 admin requests per hour
  AI_SUGGEST: { limit: 20, window: 3600 }, // 20 AI calls per hour
  FILE_UPLOAD: { limit: 10, window: 3600 }, // 10 uploads per hour
  
  // Critical operations - VERY STRICT
  ADMIN_ACTION: { limit: 10, window: 3600 }, // 10 admin actions per hour
  PAYMENT: { limit: 5, window: 3600 }, // 5 payment attempts per hour
  WEBHOOK: { limit: 100, window: 300 }, // 100 webhooks per 5 minutes
  
  // Brute force protection - AGGRESSIVE
  BRUTE_FORCE: { limit: 1, window: 300 }, // 1 attempt per 5 minutes after detection
};

// Legacy function for backward compatibility
export async function rateLimit({ key, limit = 20, windowSec = 60 }) {
  const result = await advancedRateLimit(key, { limit, window: windowSec });
  return result.success;
}

/**
 * Advanced rate limiter with security logging and monitoring
 * @param {string} identifier - Unique identifier (IP, user ID, etc.)
 * @param {Object} config - Rate limit configuration
 * @param {Object} options - Additional options
 * @returns {Object} Rate limit result with detailed information
 */
export async function advancedRateLimit(identifier, config, options = {}) {
  const { limit, window } = config;
  const { skipSuccessfulRequests = false, keyPrefix = 'rl', trackFailures = true } = options;
  
  const key = `${keyPrefix}:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - window;

  try {
    let current = 0;
    let ttl = window;
    const redis = await getRedis();

    if (redis) {
      // Redis-based rate limiting with sliding window
      const multi = redis.multi();
      multi.zremrangebyscore(key, 0, windowStart);
      multi.zcard(key);
      multi.zadd(key, now, `${now}-${Math.random()}`);
      multi.expire(key, window);
      
      const results = await multi.exec();
      current = results[1][1] || 0; // Get count from zcard result
      ttl = Math.max(0, window);
    } else {
      // Memory cache fallback with cleanup
      if (!memoryCache.has(key)) {
        memoryCache.set(key, { count: 0, resetTime: now + window, entries: [] });
      }
      
      const entry = memoryCache.get(key);
      
      // Clean old entries
      entry.entries = entry.entries.filter(timestamp => timestamp > windowStart);
      
      if (now >= entry.resetTime) {
        entry.count = 0;
        entry.resetTime = now + window;
        entry.entries = [];
      }
      
      entry.entries.push(now);
      entry.count = entry.entries.length;
      current = entry.count;
      ttl = entry.resetTime - now;
      memoryCache.set(key, entry);
    }

    const remaining = Math.max(0, limit - current);
    const exceeded = current > limit;
    const resetTime = now + ttl;

    // Security logging for rate limit violations
    if (exceeded && trackFailures) {
      // Lazy load security logger to avoid circular dependency
      if (!logSecurityEvent) {
        const securityLogger = await import('@/lib/securityLogger');
        logSecurityEvent = securityLogger.logSecurityEvent;
      }
      
      await logSecurityEvent({
        event: 'RATE_LIMIT_EXCEEDED',
        identifier,
        details: {
          limit,
          current,
          window,
          keyPrefix,
          exceedBy: current - limit,
        },
        severity: current > limit * 2 ? 'CRITICAL' : 'HIGH',
        source: 'rate_limiter',
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: !exceeded,
      limit,
      current,
      remaining,
      resetTime,
      retryAfter: exceeded ? ttl : 0,
      windowStart,
      identifier,
    };
  } catch (error) {
    console.error('❌ Rate limiting error:', error);
    // Fail open for availability (security vs availability trade-off)
    return {
      success: true,
      limit,
      current: 0,
      remaining: limit,
      resetTime: now + window,
      retryAfter: 0,
      error: error.message,
    };
  }
}

/**
 * Rate limiting middleware for Next.js API routes (App Router)
 * @param {Function} handler - API route handler
 * @param {Object} config - Rate limit configuration
 * @param {Object} options - Additional options
 * @returns {Function} Enhanced handler with rate limiting
 */
export function withRateLimit(handler, config, options = {}) {
  return async function rateLimitedHandler(req, ...args) {
    const { 
      getIdentifier = (req) => getClientIP(req),
      skipSuccessfulRequests = false,
      keyPrefix = 'api',
      onRateLimitExceeded,
      trackFailures = true,
    } = options;

    try {
      const identifier = getIdentifier(req);
      const result = await advancedRateLimit(identifier, config, { 
        skipSuccessfulRequests, 
        keyPrefix,
        trackFailures,
      });

      if (!result.success) {
        // Custom handler for rate limit exceeded
        if (onRateLimitExceeded) {
          return onRateLimitExceeded(req, result, ...args);
        }

        const errorResponse = {
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
          limit: result.limit,
          remaining: result.remaining,
          resetTime: result.resetTime,
        };

        return new Response(JSON.stringify(errorResponse), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter.toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        });
      }

      // Add rate limit headers to successful responses
      const response = await handler(req, ...args);
      
      if (response && typeof response.headers !== 'undefined') {
        response.headers.set('X-RateLimit-Limit', config.limit.toString());
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      }

      return response;
    } catch (error) {
      console.error('❌ Rate limit middleware error:', error);
      return handler(req, ...args); // Continue on error
    }
  };
}

/**
 * Get client IP from request headers
 */
function getClientIP(req) {
  // For App Router requests
  if (req.headers && typeof req.headers.get === 'function') {
    const forwarded = req.headers.get('x-forwarded-for');
    const real = req.headers.get('x-real-ip');
    const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare
    
    if (cfConnectingIP) return cfConnectingIP;
    if (forwarded) return forwarded.split(',')[0].trim();
    if (real) return real;
  }
  
  // For traditional API routes
  if (req.headers && typeof req.headers === 'object') {
    const forwarded = req.headers['x-forwarded-for'];
    const real = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    
    if (cfConnectingIP) return cfConnectingIP;
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
    }
    if (real) return real;
  }
  
  // Fallback to connection info
  const remote = req.connection?.remoteAddress || req.socket?.remoteAddress;
  return remote || 'unknown';
}

/**
 * Brute force protection with exponential backoff
 * @param {string} identifier - Unique identifier (IP or user)
 * @param {number} failedAttempts - Number of consecutive failed attempts
 * @returns {Object} Brute force protection result
 */
export async function implementBruteForceProtection(identifier, failedAttempts) {
  if (failedAttempts < 3) {
    return { protected: false, backoffTime: 0 };
  }

  // Exponential backoff: 1min, 2min, 4min, 8min, max 30min
  const backoffTime = Math.min(1800, Math.pow(2, failedAttempts - 3) * 60);
  
  const result = await advancedRateLimit(`bruteforce:${identifier}`, {
    limit: 1,
    window: backoffTime,
  }, {
    keyPrefix: 'bf',
    trackFailures: true,
  });

  // Log critical security event
  if (!result.success) {
    // Lazy load security logger if not already loaded
    if (!logSecurityEvent) {
      const securityLogger = await import('@/lib/securityLogger');
      logSecurityEvent = securityLogger.logSecurityEvent;
    }
    
    await logSecurityEvent({
      event: 'BRUTE_FORCE_ATTACK_BLOCKED',
      identifier,
      details: {
        failedAttempts,
        backoffTime,
        previousAttempts: result.current,
      },
      severity: 'CRITICAL',
      source: 'brute_force_protection',
      timestamp: new Date().toISOString(),
    });
  }

  return {
    protected: !result.success,
    backoffTime: result.retryAfter,
    attempts: result.current,
    resetTime: result.resetTime,
  };
}

/**
 * Clear rate limit for successful operations
 * @param {string} identifier - Unique identifier
 * @param {string} keyPrefix - Key prefix
 */
export async function clearRateLimit(identifier, keyPrefix = 'rl') {
  const key = `${keyPrefix}:${identifier}`;
  
  try {
    const redis = await getRedis();
    if (redis) {
      await redis.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('❌ Error clearing rate limit:', error);
  }
}

/**
 * Get current rate limit status without incrementing
 * @param {string} identifier - Unique identifier
 * @param {Object} config - Rate limit configuration
 * @param {Object} options - Additional options
 * @returns {Object} Current status
 */
export async function getRateLimitStatus(identifier, config, options = {}) {
  const { keyPrefix = 'rl' } = options;
  const key = `${keyPrefix}:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.window;

  try {
    let current = 0;
    const redis = await getRedis();

    if (redis) {
      current = await redis.zcount(key, windowStart, '+inf') || 0;
    } else {
      const entry = memoryCache.get(key);
      if (entry) {
        entry.entries = entry.entries.filter(timestamp => timestamp > windowStart);
        current = entry.entries.length;
      }
    }

    return {
      limit: config.limit,
      current,
      remaining: Math.max(0, config.limit - current),
      resetTime: now + config.window,
      windowStart,
      identifier,
    };
  } catch (error) {
    console.error('❌ Error getting rate limit status:', error);
    return {
      limit: config.limit,
      current: 0,
      remaining: config.limit,
      resetTime: now + config.window,
      error: error.message,
    };
  }
}
