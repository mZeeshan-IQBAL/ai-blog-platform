// 🔒 SECURITY: SecurityEvent model for comprehensive security logging
import mongoose from "mongoose";

const SecurityEventSchema = new mongoose.Schema({
  event: { 
    type: String, 
    required: true, 
    index: true,
    enum: [
      'LOGIN_FAILED', 'LOGIN_SUCCESS', 'LOGIN_SUCCESS_SUSPICIOUS',
      'SIGNUP_SUSPICIOUS', 'SIGNUP_SUCCESS', 
      'PASSWORD_RESET_ABUSE', 'MFA_BYPASS_ATTEMPT',
      'UNAUTHORIZED_ACCESS', 'PRIVILEGE_ESCALATION', 'ADMIN_ACCESS_VIOLATION', 'ADMIN_ACCESS_SUCCESS',
      'RATE_LIMIT_EXCEEDED', 'BRUTE_FORCE_ATTACK_BLOCKED', 'DDoS_PATTERN_DETECTED',
      'SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT', 'FILE_UPLOAD_VIOLATION', 'MALICIOUS_PAYLOAD',
      'DATA_MANIPULATION', 'UNAUTHORIZED_DATA_ACCESS', 'SENSITIVE_DATA_EXPOSURE',
      'CONFIGURATION_CHANGE', 'SECURITY_BYPASS', 'ANOMALY_DETECTED',
      'API_ABUSE', 'WEBHOOK_MANIPULATION', 'TOKEN_ABUSE',
      'ALERT_THRESHOLD_EXCEEDED', 'ADMIN_RATE_LIMIT_EXCEEDED', 'WEBHOOK_RATE_LIMIT_EXCEEDED',
      'SECURITY_ERROR', 'UNHANDLED_REJECTION', 'UNCAUGHT_EXCEPTION'
    ]
  },
  identifier: { 
    type: String, 
    required: true, 
    index: true 
  }, // IP, user ID, etc.
  userId: { 
    type: String, 
    index: true 
  }, // Associated user ID if available
  details: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  severity: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
    default: 'MEDIUM',
    index: true 
  },
  source: { 
    type: String, 
    required: true, 
    index: true 
  }, // rate_limiter, auth, etc.
  userAgent: { type: String },
  ipAddress: { 
    type: String, 
    index: true 
  },
  geo: {
    country: String,
    region: String,
    city: String,
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  resolved: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  resolvedBy: { type: String },
  resolvedAt: { type: Date },
  alertSent: { 
    type: Boolean, 
    default: false 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
}, {
  timestamps: true,
  collection: 'security_events'
});

// Indexes for efficient queries
SecurityEventSchema.index({ timestamp: -1, severity: -1 });
SecurityEventSchema.index({ identifier: 1, timestamp: -1 });
SecurityEventSchema.index({ event: 1, timestamp: -1 });
SecurityEventSchema.index({ resolved: 1, alertSent: 1 });
SecurityEventSchema.index({ userId: 1, timestamp: -1 });

// TTL index to automatically delete old security events after 90 days
SecurityEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', SecurityEventSchema);

export default SecurityEvent;