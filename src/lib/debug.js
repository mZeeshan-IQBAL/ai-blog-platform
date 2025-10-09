// src/lib/debug.js
// Comprehensive debugging utilities for the AI blog platform

const DEBUG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
};

const isDevelopment = process.env.NODE_ENV === 'development';
const debugLevel = parseInt(process.env.DEBUG_LEVEL) || (isDevelopment ? DEBUG_LEVELS.DEBUG : DEBUG_LEVELS.WARN);

/**
 * Enhanced logging with environment awareness
 */
class Logger {
  constructor(namespace = 'App') {
    this.namespace = namespace;
  }

  _log(level, message, ...args) {
    if (level > debugLevel) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.namespace}]`;

    switch (level) {
      case DEBUG_LEVELS.ERROR:
        console.error(`❌ ${prefix} ERROR:`, message, ...args);
        break;
      case DEBUG_LEVELS.WARN:
        console.warn(`⚠️  ${prefix} WARN:`, message, ...args);
        break;
      case DEBUG_LEVELS.INFO:
        console.info(`ℹ️  ${prefix} INFO:`, message, ...args);
        break;
      case DEBUG_LEVELS.DEBUG:
        console.log(`🐛 ${prefix} DEBUG:`, message, ...args);
        break;
      case DEBUG_LEVELS.TRACE:
        console.trace(`🔍 ${prefix} TRACE:`, message, ...args);
        break;
    }
  }

  error(message, ...args) {
    this._log(DEBUG_LEVELS.ERROR, message, ...args);
  }

  warn(message, ...args) {
    this._log(DEBUG_LEVELS.WARN, message, ...args);
  }

  info(message, ...args) {
    this._log(DEBUG_LEVELS.INFO, message, ...args);
  }

  debug(message, ...args) {
    this._log(DEBUG_LEVELS.DEBUG, message, ...args);
  }

  trace(message, ...args) {
    this._log(DEBUG_LEVELS.TRACE, message, ...args);
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  constructor() {
    this.timers = new Map();
    this.metrics = new Map();
    this.logger = new Logger('Performance');
  }

  startTimer(label) {
    this.timers.set(label, performance.now());
    this.logger.debug(`⏱️  Started timer: ${label}`);
  }

  endTimer(label) {
    const startTime = this.timers.get(label);
    if (!startTime) {
      this.logger.warn(`Timer "${label}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);
    this.logger.debug(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
    
    // Store metric for analysis
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label).push(duration);
    
    return duration;
  }

  getMetrics(label) {
    const times = this.metrics.get(label) || [];
    if (times.length === 0) return null;

    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      total: times.reduce((a, b) => a + b, 0)
    };
  }

  async measureAsync(label, asyncFn) {
    this.startTimer(label);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      this.endTimer(label);
    }
  }

  clearMetrics() {
    this.metrics.clear();
    this.timers.clear();
  }
}

/**
 * API Request debugger
 */
export function debugApiRequest(req, res, next) {
  const logger = new Logger('API');
  const startTime = performance.now();
  
  logger.debug(`${req.method} ${req.url}`, {
    headers: req.headers,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = performance.now() - startTime;
    logger.debug(`${req.method} ${req.url} - ${res.statusCode} (${duration.toFixed(2)}ms)`, {
      responseSize: JSON.stringify(data).length
    });
    return originalJson.call(this, data);
  };

  next();
}

/**
 * Component render debugger
 */
export function useRenderLogger(componentName, props = {}) {
  const logger = new Logger('Render');
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    logger.debug(`${componentName} rendered (count: ${renderCount.current})`, props);
  });

  return renderCount.current;
}

/**
 * Database query debugger
 */
export function debugMongoQuery(query, collection) {
  const logger = new Logger('MongoDB');
  
  return {
    ...query,
    explain: async function() {
      logger.debug(`Explaining query on ${collection}:`, this.getQuery());
      return await query.explain();
    }
  };
}

/**
 * Memory usage monitor
 */
export function logMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    const logger = new Logger('Memory');
    
    logger.debug('Memory usage:', {
      rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(usage.external / 1024 / 1024)} MB`,
    });
  }
}

/**
 * Error boundary logger
 */
export function logError(error, errorInfo = {}) {
  const logger = new Logger('Error');
  
  logger.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...errorInfo,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'N/A',
  });
}

/**
 * Create logger instance
 */
export function createLogger(namespace) {
  return new Logger(namespace);
}

/**
 * Global performance monitor instance
 */
export const perf = new PerformanceMonitor();

/**
 * Utility to serialize complex objects for logging
 */
export function serialize(obj, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return '[Max Depth Reached]';
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return obj.toISOString();
  if (obj instanceof Error) return { name: obj.name, message: obj.message, stack: obj.stack };
  if (obj.toString && typeof obj.toString === 'function' && obj.toString !== Object.prototype.toString) {
    return obj.toString();
  }

  try {
    const serialized = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serialize(value, maxDepth, currentDepth + 1);
    }
    return serialized;
  } catch (e) {
    return '[Serialization Error]';
  }
}

// Export default logger
export const logger = new Logger('App');
export default logger;