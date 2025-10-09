// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { withRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

const handler = NextAuth(authOptions);

// 🔒 SECURITY: Apply rate limiting to authentication endpoints
const rateLimitedHandler = withRateLimit(handler, RATE_LIMITS.LOGIN, {
  keyPrefix: 'auth',
  getIdentifier: (req) => {
    // For auth routes, use IP + user agent for better tracking
    const ip = req.headers?.get?.('x-forwarded-for') || 
              req.headers?.get?.('x-real-ip') || 
              req.headers?.['x-forwarded-for'] ||
              req.headers?.['x-real-ip'] || 'unknown';
    const userAgent = req.headers?.get?.('user-agent') || 
                     req.headers?.['user-agent'] || '';
    return `${ip}:${userAgent.substring(0, 50)}`; // Limit UA length
  },
  onRateLimitExceeded: async (req, result) => {
    // Log authentication rate limit violations
    console.warn(`🚨 Authentication rate limit exceeded: ${result.identifier}`);
    
    return new Response(JSON.stringify({
      error: 'Too many authentication attempts',
      message: `Please wait ${Math.ceil(result.retryAfter / 60)} minutes before trying again.`,
      retryAfter: result.retryAfter,
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': result.retryAfter.toString(),
      },
    });
  },
});

export { rateLimitedHandler as GET, rateLimitedHandler as POST };
