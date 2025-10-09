// src/app/api/admin/audit-log/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { withRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { logSecurityEvent } from "@/lib/securityLogger";

// 🔒 SECURITY: Enhanced admin route with comprehensive security
async function adminAuditLogHandler(req) {
  const session = await getServerSession(authOptions);
  
  // Get client info for security logging
  const clientIP = req.headers?.get?.('x-forwarded-for') ||
                  req.headers?.get?.('x-real-ip') || 'unknown';
  const userAgent = req.headers?.get?.('user-agent') || '';
  
  if (!session?.user) {
    await logSecurityEvent({
      event: 'UNAUTHORIZED_ACCESS',
      identifier: clientIP,
      details: {
        route: '/api/admin/audit-log',
        reason: 'No session',
        userAgent,
      },
      severity: 'HIGH',
      source: 'admin_routes',
      userAgent,
      ipAddress: clientIP,
    });
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }
  
  if (session.user.role !== "ADMIN") {
    await logSecurityEvent({
      event: 'ADMIN_ACCESS_VIOLATION',
      identifier: clientIP,
      userId: session.user.id,
      details: {
        route: '/api/admin/audit-log',
        userRole: session.user.role,
        userEmail: session.user.email,
        attemptedAccess: 'audit-log',
        userAgent,
      },
      severity: 'CRITICAL',
      source: 'admin_routes',
      userAgent,
      ipAddress: clientIP,
    });
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }
  
  // Log successful admin access
  await logSecurityEvent({
    event: 'ADMIN_ACCESS_SUCCESS',
    identifier: clientIP,
    userId: session.user.id,
    details: {
      route: '/api/admin/audit-log',
      adminEmail: session.user.email,
      action: 'view_audit_logs',
    },
    severity: 'MEDIUM',
    source: 'admin_routes',
    userAgent,
    ipAddress: clientIP,
  });
  
  await connectToDB();
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(500).lean();
  return Response.json(logs);
}

// Apply rate limiting specifically for admin operations
export const GET = withRateLimit(adminAuditLogHandler, RATE_LIMITS.ADMIN_ACTION, {
  keyPrefix: 'admin',
  getIdentifier: (req) => {
    // For admin routes, combine IP and user session for better tracking
    const ip = req.headers?.get?.('x-forwarded-for') ||
              req.headers?.get?.('x-real-ip') || 'unknown';
    return `admin:${ip}`;
  },
  onRateLimitExceeded: async (req, result) => {
    const clientIP = req.headers?.get?.('x-forwarded-for') ||
                    req.headers?.get?.('x-real-ip') || 'unknown';
                    
    await logSecurityEvent({
      event: 'ADMIN_RATE_LIMIT_EXCEEDED',
      identifier: clientIP,
      details: {
        route: '/api/admin/audit-log',
        limit: result.limit,
        attempts: result.current,
        window: 'hourly',
      },
      severity: 'HIGH',
      source: 'admin_rate_limiter',
      userAgent: req.headers?.get?.('user-agent'),
      ipAddress: clientIP,
    });
    
    return new Response(JSON.stringify({
      error: 'Too many admin requests',
      message: 'Admin rate limit exceeded. This incident has been logged.',
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
