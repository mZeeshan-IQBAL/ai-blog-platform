// 🔒 SECURITY: Secure error handling to prevent information disclosure
import { logSecurityEvent } from '@/lib/securityLogger';

// Development vs Production error handling
const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Safe error types that can be exposed to users
const SAFE_ERROR_TYPES = new Set([
  'ValidationError',
  'AuthError',
  'RateLimitError',
  'PermissionError',
  'NotFoundError',
  'BadRequestError',
]);

// Error codes and their safe messages
const ERROR_MESSAGES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account temporarily locked',
  SESSION_EXPIRED: 'Session has expired',
  MFA_REQUIRED: 'Multi-factor authentication required',
  
  // Input Validation
  VALIDATION_FAILED: 'Invalid input data',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  INVALID_FORMAT: 'Invalid data format',
  FILE_TOO_LARGE: 'File size exceeds limit',
  UNSUPPORTED_FILE_TYPE: 'File type not supported',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests',
  BRUTE_FORCE_DETECTED: 'Too many failed attempts',
  
  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  RESOURCE_NOT_FOUND: 'Resource not found',
  OPERATION_NOT_ALLOWED: 'Operation not allowed',
  QUOTA_EXCEEDED: 'Usage quota exceeded',
  SUBSCRIPTION_REQUIRED: 'Active subscription required',
  
  // Generic
  BAD_REQUEST: 'Bad request',
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  MAINTENANCE_MODE: 'System under maintenance',
};

/**
 * Secure error class with safe serialization
 */
export class SecureError extends Error {
  constructor(code, message, statusCode = 500, details = {}) {
    super(message);
    this.name = 'SecureError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.safe = true; // Marks this as safe to expose
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(isDev && { details: this.details }),
    };
  }
}

/**
 * Create safe error responses
 * @param {Error} error - Original error
 * @param {Object} context - Request context for logging
 * @returns {Object} Safe error response
 */
export function createSafeError(error, context = {}) {
  const {
    req,
    userId,
    endpoint,
    userAgent,
    ipAddress,
  } = context;

  // Generate unique error ID for tracking
  const errorId = generateErrorId();
  
  // Log security-relevant errors
  if (shouldLogSecurityEvent(error)) {
    logSecurityEvent({
      event: 'SECURITY_ERROR',
      identifier: ipAddress || 'unknown',
      userId,
      details: {
        errorType: error.name,
        errorMessage: error.message,
        endpoint,
        errorId,
        stack: isDev ? error.stack : undefined,
      },
      severity: getSeverityFromError(error),
      source: 'error_handler',
      userAgent,
      ipAddress,
    }).catch(err => {
      console.error('Failed to log security event:', err);
    });
  }

  // Determine if error is safe to expose
  if (error instanceof SecureError) {
    return {
      ...error.toJSON(),
      errorId,
    };
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return {
      error: 'VALIDATION_FAILED',
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      statusCode: 400,
      errorId,
      ...(isDev && { details: error.details }),
    };
  }

  if (error.name === 'CastError' || error.name === 'MongoError') {
    return {
      error: 'BAD_REQUEST',
      message: ERROR_MESSAGES.BAD_REQUEST,
      statusCode: 400,
      errorId,
    };
  }

  if (error.message && error.message.includes('rate limit')) {
    return {
      error: 'RATE_LIMIT_EXCEEDED',
      message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      statusCode: 429,
      errorId,
      retryAfter: error.retryAfter || 60,
    };
  }

  if (error.message && error.message.includes('unauthorized')) {
    return {
      error: 'UNAUTHORIZED',
      message: ERROR_MESSAGES.UNAUTHORIZED,
      statusCode: 401,
      errorId,
    };
  }

  if (error.message && error.message.includes('forbidden')) {
    return {
      error: 'FORBIDDEN',
      message: ERROR_MESSAGES.FORBIDDEN,
      statusCode: 403,
      errorId,
    };
  }

  // Default safe error for production
  const defaultError = {
    error: 'INTERNAL_ERROR',
    message: ERROR_MESSAGES.INTERNAL_ERROR,
    statusCode: error.statusCode || 500,
    errorId,
    timestamp: new Date().toISOString(),
  };

  // In development, include more details
  if (isDev || isTest) {
    defaultError.originalError = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  // Log internal errors for debugging
  console.error(`Internal Error [${errorId}]:`, {
    error: error.message,
    stack: error.stack,
    context,
  });

  return defaultError;
}

/**
 * Secure error handling middleware wrapper
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with error handling
 */
export function withSecureErrorHandling(handler) {
  return async function secureHandler(req, ...args) {
    try {
      return await handler(req, ...args);
    } catch (error) {
      const context = {
        req,
        endpoint: req.url || req.nextUrl?.pathname,
        userAgent: req.headers?.get?.('user-agent') || req.headers?.['user-agent'],
        ipAddress: req.headers?.get?.('x-forwarded-for') || 
                  req.headers?.get?.('x-real-ip') ||
                  req.headers?.['x-forwarded-for'] ||
                  req.headers?.['x-real-ip'] ||
                  'unknown',
      };

      const safeError = createSafeError(error, context);
      
      return new Response(JSON.stringify(safeError), {
        status: safeError.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'X-Error-ID': safeError.errorId,
        },
      });
    }
  };
}

/**
 * Helper functions
 */
function generateErrorId() {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function shouldLogSecurityEvent(error) {
  // Log errors that might indicate security issues
  const securityIndicators = [
    'unauthorized', 'forbidden', 'access denied',
    'invalid token', 'permission', 'authentication',
    'sql injection', 'xss', 'csrf', 'brute force',
    'rate limit', 'suspicious', 'malicious',
  ];

  const errorText = (error.message || '').toLowerCase();
  return securityIndicators.some(indicator => errorText.includes(indicator));
}

function getSeverityFromError(error) {
  const errorText = (error.message || '').toLowerCase();
  
  if (errorText.includes('critical') || 
      errorText.includes('sql injection') || 
      errorText.includes('xss')) {
    return 'CRITICAL';
  }
  
  if (errorText.includes('unauthorized') || 
      errorText.includes('forbidden') || 
      errorText.includes('brute force')) {
    return 'HIGH';
  }
  
  if (errorText.includes('validation') || 
      errorText.includes('rate limit')) {
    return 'MEDIUM';
  }
  
  return 'LOW';
}

/**
 * Specific error creators for common scenarios
 */
export const createAuthError = (message = ERROR_MESSAGES.UNAUTHORIZED) => 
  new SecureError('UNAUTHORIZED', message, 401);

export const createForbiddenError = (message = ERROR_MESSAGES.FORBIDDEN) => 
  new SecureError('FORBIDDEN', message, 403);

export const createValidationError = (message = ERROR_MESSAGES.VALIDATION_FAILED, details = {}) => 
  new SecureError('VALIDATION_FAILED', message, 400, details);

export const createRateLimitError = (retryAfter = 60) => 
  new SecureError('RATE_LIMIT_EXCEEDED', ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, 429, { retryAfter });

export const createNotFoundError = (resource = 'Resource') => 
  new SecureError('RESOURCE_NOT_FOUND', `${resource} not found`, 404);

export const createInternalError = (message = ERROR_MESSAGES.INTERNAL_ERROR) => 
  new SecureError('INTERNAL_ERROR', message, 500);

/**
 * Sanitize error messages to prevent information disclosure
 * @param {string} message - Original error message
 * @returns {string} Sanitized message
 */
export function sanitizeErrorMessage(message) {
  if (!message || typeof message !== 'string') {
    return ERROR_MESSAGES.INTERNAL_ERROR;
  }

  // Remove potential sensitive information patterns
  const sensitivePatterns = [
    /password/gi,
    /token/gi,
    /secret/gi,
    /key/gi,
    /connection string/gi,
    /database/gi,
    /mongodb:\/\//gi,
    /redis:\/\//gi,
    /process\.env/gi,
    /file path/gi,
    /directory/gi,
    /stack trace/gi,
  ];

  let sanitized = message;
  
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  // Limit message length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200) + '...';
  }

  return sanitized;
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandlers() {
  if (typeof process !== 'undefined') {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      
      logSecurityEvent({
        event: 'UNHANDLED_REJECTION',
        identifier: 'system',
        details: {
          reason: reason?.message || String(reason),
          stack: reason?.stack,
        },
        severity: 'HIGH',
        source: 'global_error_handler',
      }).catch(() => {
        // Ignore logging errors for global handler
      });
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      
      logSecurityEvent({
        event: 'UNCAUGHT_EXCEPTION',
        identifier: 'system',
        details: {
          error: error.message,
          stack: error.stack,
        },
        severity: 'CRITICAL',
        source: 'global_error_handler',
      }).catch(() => {
        // Ignore logging errors for global handler
      });
      
      // Don't exit in development
      if (!isDev) {
        process.exit(1);
      }
    });
  }
}

// Auto-setup global handlers
if (typeof window === 'undefined') {
  setupGlobalErrorHandlers();
}