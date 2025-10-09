// 🔒 SECURITY: Comprehensive security event logging and monitoring system
import { connectToDB } from '@/lib/db';

// Optional Pusher - will be lazy loaded when needed
let pusherServer = null;

// Import SecurityEvent model
import SecurityEvent from '@/models/SecurityEvent';

// Security event types and their default severity levels
export const SECURITY_EVENTS = {
  // Authentication events
  LOGIN_FAILED: { severity: 'MEDIUM', alertThreshold: 3 },
  LOGIN_SUCCESS_SUSPICIOUS: { severity: 'HIGH', alertThreshold: 1 },
  SIGNUP_SUSPICIOUS: { severity: 'MEDIUM', alertThreshold: 2 },
  PASSWORD_RESET_ABUSE: { severity: 'HIGH', alertThreshold: 2 },
  MFA_BYPASS_ATTEMPT: { severity: 'CRITICAL', alertThreshold: 1 },
  
  // Access control violations
  UNAUTHORIZED_ACCESS: { severity: 'HIGH', alertThreshold: 1 },
  PRIVILEGE_ESCALATION: { severity: 'CRITICAL', alertThreshold: 1 },
  ADMIN_ACCESS_VIOLATION: { severity: 'CRITICAL', alertThreshold: 1 },
  
  // Rate limiting and abuse
  RATE_LIMIT_EXCEEDED: { severity: 'HIGH', alertThreshold: 5 },
  BRUTE_FORCE_ATTACK_BLOCKED: { severity: 'CRITICAL', alertThreshold: 1 },
  DDoS_PATTERN_DETECTED: { severity: 'CRITICAL', alertThreshold: 1 },
  
  // Input validation failures
  SQL_INJECTION_ATTEMPT: { severity: 'CRITICAL', alertThreshold: 1 },
  XSS_ATTEMPT: { severity: 'HIGH', alertThreshold: 1 },
  FILE_UPLOAD_VIOLATION: { severity: 'HIGH', alertThreshold: 1 },
  MALICIOUS_PAYLOAD: { severity: 'CRITICAL', alertThreshold: 1 },
  
  // Data integrity
  DATA_MANIPULATION: { severity: 'CRITICAL', alertThreshold: 1 },
  UNAUTHORIZED_DATA_ACCESS: { severity: 'HIGH', alertThreshold: 1 },
  SENSITIVE_DATA_EXPOSURE: { severity: 'CRITICAL', alertThreshold: 1 },
  
  // System events
  CONFIGURATION_CHANGE: { severity: 'MEDIUM', alertThreshold: 1 },
  SECURITY_BYPASS: { severity: 'CRITICAL', alertThreshold: 1 },
  ANOMALY_DETECTED: { severity: 'HIGH', alertThreshold: 1 },
  
  // API abuse
  API_ABUSE: { severity: 'HIGH', alertThreshold: 3 },
  WEBHOOK_MANIPULATION: { severity: 'HIGH', alertThreshold: 1 },
  TOKEN_ABUSE: { severity: 'HIGH', alertThreshold: 1 },
};

// Threat patterns for automated detection
const THREAT_PATTERNS = {
  // Suspicious user agents
  SUSPICIOUS_USER_AGENTS: [
    /sqlmap/i, /nikto/i, /nessus/i, /openvas/i, /nmap/i,
    /scanner/i, /crawler/i, /bot/i, /spider/i,
    /python-requests/i, /curl/i, /wget/i
  ],
  
  // Suspicious paths
  SUSPICIOUS_PATHS: [
    /\/admin\/.*/, /\/wp-admin\/.*/, /\/phpmyadmin\/.*/, 
    /\.env/, /\.git\//, /\/config\/.*/, /\/backup\//
  ],
  
  // Common attack signatures in requests
  ATTACK_SIGNATURES: [
    // SQL Injection
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    
    // XSS
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i,
    /((\%3C)|<)[^\n]+((\%3E)|>)/i,
    
    // Command Injection
    /;|\||`|&|\$|\(|\)|{|}|\[|\]/,
  ],
};

/**
 * Log a security event with automated threat detection
 * @param {Object} eventData - Security event data
 * @returns {Object} Logged event with analysis
 */
export async function logSecurityEvent(eventData) {
  try {
    await connectToDB();
    
    const {
      event,
      identifier,
      userId = null,
      details = {},
      severity: overrideSeverity = null,
      source = 'unknown',
      userAgent = null,
      ipAddress = null,
      metadata = {},
    } = eventData;

    // Determine severity based on event type or override
    const eventConfig = SECURITY_EVENTS[event] || { severity: 'MEDIUM', alertThreshold: 1 };
    const severity = overrideSeverity || eventConfig.severity;

    // Enhanced threat analysis
    const analysis = await performThreatAnalysis({
      event,
      identifier,
      userAgent,
      details,
      metadata,
    });

    // Create security event record
    const securityEvent = new SecurityEvent({
      event,
      identifier,
      userId,
      details: {
        ...details,
        analysis,
      },
      severity: analysis.elevatedSeverity || severity,
      source,
      userAgent,
      ipAddress: ipAddress || identifier,
      timestamp: new Date(),
      resolved: false,
      alertSent: false,
      metadata: {
        ...metadata,
        threatScore: analysis.threatScore,
        patterns: analysis.detectedPatterns,
      },
    });

    const savedEvent = await securityEvent.save();

    // Real-time alerting for critical events
    if (severity === 'CRITICAL' || analysis.threatScore >= 8) {
      await sendSecurityAlert(savedEvent);
    }

    // Check for alert thresholds
    await checkAlertThresholds(event, identifier, eventConfig.alertThreshold);

    // Real-time security monitoring via WebSocket
    if (process.env.PUSHER_APP_ID) {
      try {
        // Lazy load pusher when needed
        if (!pusherServer) {
          const { pusherServer: ps } = await import('@/lib/pusherServer');
          pusherServer = ps;
        }
        
        await pusherServer.trigger('security-alerts', 'new-event', {
          id: savedEvent._id,
          event,
          severity: savedEvent.severity,
          identifier,
          timestamp: savedEvent.timestamp,
          threatScore: analysis.threatScore,
        });
      } catch (error) {
        console.warn('⚠️ Failed to send real-time security alert:', error.message);
      }
    }

    console.log(`🔒 Security event logged: ${event} | ${severity} | ${identifier}`);
    
    return {
      success: true,
      eventId: savedEvent._id,
      severity: savedEvent.severity,
      threatScore: analysis.threatScore,
      analysis,
    };

  } catch (error) {
    console.error('❌ Security logging error:', error);
    
    // Fallback logging to console for critical events
    if (eventData.severity === 'CRITICAL') {
      console.error('🚨 CRITICAL SECURITY EVENT (logging failed):', {
        event: eventData.event,
        identifier: eventData.identifier,
        details: eventData.details,
        timestamp: new Date().toISOString(),
      });
    }
    
    return {
      success: false,
      error: error.message,
      eventData,
    };
  }
}

/**
 * Perform automated threat analysis on security events
 * @param {Object} eventData - Event data for analysis
 * @returns {Object} Threat analysis results
 */
async function performThreatAnalysis(eventData) {
  const { event, identifier, userAgent, details, metadata } = eventData;
  
  let threatScore = 0;
  let detectedPatterns = [];
  let elevatedSeverity = null;
  let indicators = [];

  // Analyze user agent for suspicious patterns
  if (userAgent) {
    for (const pattern of THREAT_PATTERNS.SUSPICIOUS_USER_AGENTS) {
      if (pattern.test(userAgent)) {
        threatScore += 3;
        detectedPatterns.push(`suspicious_user_agent:${pattern.source}`);
        indicators.push('Suspicious User-Agent detected');
        break;
      }
    }
  }

  // Analyze request patterns
  if (details.path || details.url) {
    const path = details.path || details.url;
    for (const pattern of THREAT_PATTERNS.SUSPICIOUS_PATHS) {
      if (pattern.test(path)) {
        threatScore += 2;
        detectedPatterns.push(`suspicious_path:${pattern.source}`);
        indicators.push('Suspicious path accessed');
        break;
      }
    }
  }

  // Check for attack signatures in request data
  const requestData = JSON.stringify(details);
  for (const pattern of THREAT_PATTERNS.ATTACK_SIGNATURES) {
    if (pattern.test(requestData)) {
      threatScore += 5;
      detectedPatterns.push(`attack_signature:${pattern.source}`);
      indicators.push('Attack signature detected');
      elevatedSeverity = 'CRITICAL';
    }
  }

  // Geolocation-based threat analysis
  if (identifier && identifier.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    // This is an IP address, could do GeoIP lookup for threat intel
    // For now, just check for known bad IP patterns
    if (identifier.startsWith('10.') || identifier.startsWith('192.168.') || identifier.startsWith('172.')) {
      // Internal IP - less suspicious
      threatScore = Math.max(0, threatScore - 1);
    }
  }

  // Time-based analysis (unusual hours, rapid succession)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) {
    threatScore += 1;
    indicators.push('Activity during unusual hours');
  }

  // Frequency analysis - check recent similar events
  try {
    const recentEvents = await SecurityEvent.countDocuments({
      identifier,
      event,
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });
    
    if (recentEvents > 5) {
      threatScore += 3;
      indicators.push(`High frequency: ${recentEvents} similar events in last hour`);
      if (recentEvents > 10) {
        elevatedSeverity = 'CRITICAL';
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to analyze event frequency:', error.message);
  }

  // Normalize threat score (0-10 scale)
  threatScore = Math.min(10, threatScore);

  return {
    threatScore,
    detectedPatterns,
    elevatedSeverity,
    indicators,
    analysisTimestamp: new Date().toISOString(),
  };
}

/**
 * Send security alerts for critical events
 * @param {Object} securityEvent - Security event object
 */
async function sendSecurityAlert(securityEvent) {
  try {
    // Mark as alert sent to avoid duplicates
    securityEvent.alertSent = true;
    await securityEvent.save();

    // In a production environment, you would integrate with:
    // - Email alerts (SendGrid, AWS SES)
    // - Slack notifications
    // - PagerDuty or similar incident management
    // - SMS alerts for critical events
    
    console.log(`🚨 SECURITY ALERT: ${securityEvent.event} | ${securityEvent.severity} | ${securityEvent.identifier}`);
    
    // For now, log detailed alert to console
    console.log('Alert Details:', {
      event: securityEvent.event,
      severity: securityEvent.severity,
      identifier: securityEvent.identifier,
      timestamp: securityEvent.timestamp,
      details: securityEvent.details,
      threatScore: securityEvent.metadata?.threatScore,
    });

  } catch (error) {
    console.error('❌ Failed to send security alert:', error);
  }
}

/**
 * Check if event frequency exceeds alert thresholds
 * @param {string} eventType - Type of security event
 * @param {string} identifier - Event identifier
 * @param {number} threshold - Alert threshold
 */
async function checkAlertThresholds(eventType, identifier, threshold) {
  try {
    // 🔒 SECURITY: Prevent infinite loops by excluding certain events
    const excludeFromThresholds = [
      'ALERT_THRESHOLD_EXCEEDED',
      'SECURITY_ERROR',
      'UNHANDLED_REJECTION',
      'UNCAUGHT_EXCEPTION'
    ];
    
    if (excludeFromThresholds.includes(eventType)) {
      return; // Skip threshold checking for these events
    }
    
    const timeWindow = 60 * 60 * 1000; // 1 hour
    const count = await SecurityEvent.countDocuments({
      event: eventType,
      identifier,
      timestamp: { $gte: new Date(Date.now() - timeWindow) },
    });

    // Only create alert if threshold is significantly exceeded to avoid noise
    if (count >= threshold && count % 5 === 0) { // Alert every 5th occurrence
      await logSecurityEvent({
        event: 'ALERT_THRESHOLD_EXCEEDED',
        identifier,
        details: {
          originalEvent: eventType,
          count,
          threshold,
          timeWindow: '1 hour',
        },
        severity: 'HIGH',
        source: 'security_monitor',
      });
    }
  } catch (error) {
    console.error('❌ Error checking alert thresholds:', error);
  }
}

/**
 * Get security events for monitoring dashboard
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options
 * @returns {Array} Security events
 */
export async function getSecurityEvents(filters = {}, options = {}) {
  try {
    await connectToDB();
    
    const {
      limit = 100,
      offset = 0,
      sortBy = 'timestamp',
      sortOrder = -1,
    } = options;

    const query = SecurityEvent.find(filters)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(offset)
      .lean();

    const events = await query;
    const total = await SecurityEvent.countDocuments(filters);

    return {
      events,
      total,
      hasMore: total > offset + limit,
    };
  } catch (error) {
    console.error('❌ Error fetching security events:', error);
    return { events: [], total: 0, hasMore: false };
  }
}

/**
 * Get security dashboard statistics
 * @param {number} hours - Time window in hours (default: 24)
 * @returns {Object} Security statistics
 */
export async function getSecurityStats(hours = 24) {
  try {
    await connectToDB();
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const [
      totalEvents,
      criticalEvents,
      highEvents,
      topEvents,
      topIdentifiers,
      unresolvedEvents,
    ] = await Promise.all([
      SecurityEvent.countDocuments({ timestamp: { $gte: since } }),
      SecurityEvent.countDocuments({ timestamp: { $gte: since }, severity: 'CRITICAL' }),
      SecurityEvent.countDocuments({ timestamp: { $gte: since }, severity: 'HIGH' }),
      
      SecurityEvent.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$event', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      
      SecurityEvent.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$identifier', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      SecurityEvent.countDocuments({ resolved: false }),
    ]);

    return {
      timeWindow: `${hours} hours`,
      totalEvents,
      criticalEvents,
      highEvents,
      unresolvedEvents,
      topEvents: topEvents.map(e => ({ event: e._id, count: e.count })),
      topIdentifiers: topIdentifiers.map(i => ({ identifier: i._id, count: i.count })),
      riskLevel: criticalEvents > 0 ? 'CRITICAL' : highEvents > 5 ? 'HIGH' : 'MEDIUM',
    };
  } catch (error) {
    console.error('❌ Error fetching security stats:', error);
    return {
      timeWindow: `${hours} hours`,
      totalEvents: 0,
      criticalEvents: 0,
      highEvents: 0,
      unresolvedEvents: 0,
      topEvents: [],
      topIdentifiers: [],
      riskLevel: 'UNKNOWN',
    };
  }
}

/**
 * Mark security events as resolved
 * @param {Array} eventIds - Array of event IDs to resolve
 * @param {string} resolvedBy - User who resolved the events
 * @returns {Object} Resolution result
 */
export async function resolveSecurityEvents(eventIds, resolvedBy) {
  try {
    await connectToDB();
    
    const result = await SecurityEvent.updateMany(
      { _id: { $in: eventIds } },
      { 
        resolved: true, 
        resolvedBy, 
        resolvedAt: new Date(),
      }
    );

    return {
      success: true,
      modified: result.modifiedCount,
    };
  } catch (error) {
    console.error('❌ Error resolving security events:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Clean up old security events (data retention)
 * @param {number} daysToKeep - Number of days to keep events (default: 90)
 * @returns {Object} Cleanup result
 */
export async function cleanupSecurityEvents(daysToKeep = 90) {
  try {
    await connectToDB();
    
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await SecurityEvent.deleteMany({
      timestamp: { $lt: cutoffDate },
      resolved: true,
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old security events`);
    
    return {
      success: true,
      deleted: result.deletedCount,
      cutoffDate,
    };
  } catch (error) {
    console.error('❌ Error cleaning up security events:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}