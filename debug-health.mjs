// debug-health.mjs
// Health check and debugging script for the AI blog platform

import { connectToDB } from './src/lib/db.js';
import { createLogger, perf, logMemoryUsage, serialize } from './src/lib/debug.js';

const logger = createLogger('HealthCheck');

async function checkMongoDB() {
  logger.info('🔍 Checking MongoDB connection...');
  perf.startTimer('mongodb-check');
  
  try {
    await connectToDB();
    const mongoose = await import('mongoose');
    
    const stats = await mongoose.connection.db.admin().serverStatus();
    perf.endTimer('mongodb-check');
    
    logger.info('✅ MongoDB connection successful', {
      version: stats.version,
      uptime: `${Math.round(stats.uptime / 60)} minutes`,
      connections: stats.connections
    });
    
    return true;
  } catch (error) {
    perf.endTimer('mongodb-check');
    logger.error('❌ MongoDB connection failed:', serialize(error));
    return false;
  }
}

async function checkRedis() {
  logger.info('🔍 Checking Redis connection...');
  perf.startTimer('redis-check');
  
  try {
    const { cacheGet, cacheSet } = await import('./src/lib/redis.js');
    const testKey = 'health-check-test';
    const testValue = JSON.stringify({ timestamp: Date.now() });
    
    await cacheSet(testKey, testValue, 10);
    const retrieved = await cacheGet(testKey);
    
    perf.endTimer('redis-check');
    
    if (retrieved === testValue) {
      logger.info('✅ Redis connection successful');
      return true;
    } else {
      logger.error('❌ Redis data integrity check failed');
      return false;
    }
  } catch (error) {
    perf.endTimer('redis-check');
    logger.error('❌ Redis connection failed:', serialize(error));
    return false;
  }
}

async function checkAPI() {
  logger.info('🔍 Checking API endpoints...');
  perf.startTimer('api-check');
  
  try {
    // Check if Next.js server is running (basic check)
    const endpoints = [
      { path: '/api/health', method: 'GET' },
      { path: '/api/auth/session', method: 'GET' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint.path}`, {
          method: endpoint.method,
          timeout: 5000
        });
        
        if (response.ok) {
          logger.info(`✅ ${endpoint.path} is accessible`);
        } else {
          logger.warn(`⚠️  ${endpoint.path} returned ${response.status}`);
        }
      } catch (err) {
        logger.warn(`⚠️  ${endpoint.path} is not accessible (server may be down)`);
      }
    }
    
    perf.endTimer('api-check');
    return true;
  } catch (error) {
    perf.endTimer('api-check');
    logger.error('❌ API check failed:', serialize(error));
    return false;
  }
}

async function checkEnvironment() {
  logger.info('🔍 Checking environment configuration...');
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'REDIS_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error('❌ Missing environment variables:', missingVars);
    return false;
  }
  
  logger.info('✅ All required environment variables are present');
  
  // Check sensitive configurations
  const sensitiveChecks = {
    'MongoDB URI format': process.env.MONGODB_URI?.startsWith('mongodb'),
    'Redis URL format': process.env.REDIS_URL?.includes('redis'),
    'NextAuth URL format': process.env.NEXTAUTH_URL?.startsWith('http'),
  };
  
  for (const [check, result] of Object.entries(sensitiveChecks)) {
    if (result) {
      logger.info(`✅ ${check} is valid`);
    } else {
      logger.error(`❌ ${check} appears invalid`);
    }
  }
  
  return missingVars.length === 0;
}

async function checkModels() {
  logger.info('🔍 Checking database models...');
  perf.startTimer('models-check');
  
  try {
    const Post = (await import('./src/models/Post.js')).default;
    const User = (await import('./src/models/User.js')).default;
    
    // Test basic model queries
    const postCount = await Post.countDocuments({});
    const userCount = await User.countDocuments({});
    
    perf.endTimer('models-check');
    
    logger.info('✅ Models are accessible', {
      posts: postCount,
      users: userCount
    });
    
    return true;
  } catch (error) {
    perf.endTimer('models-check');
    logger.error('❌ Models check failed:', serialize(error));
    return false;
  }
}

async function performanceDiagnostics() {
  logger.info('📊 Performance Diagnostics');
  
  // Log current memory usage
  logMemoryUsage();
  
  // Display performance metrics
  const metrics = perf.getMetrics('mongodb-check');
  if (metrics) {
    logger.info('📈 MongoDB Performance:', metrics);
  }
  
  // Check for common performance issues
  if (process.env.NODE_ENV === 'development') {
    logger.info('🐛 Development mode detected - performance may be slower');
  }
  
  // Log system info
  logger.info('💻 System Info', {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid
  });
}

async function runHealthCheck() {
  logger.info('🏥 Starting comprehensive health check...');
  const startTime = Date.now();
  
  const checks = [
    { name: 'Environment', fn: checkEnvironment },
    { name: 'MongoDB', fn: checkMongoDB },
    { name: 'Redis', fn: checkRedis },
    { name: 'Models', fn: checkModels },
    { name: 'API', fn: checkAPI }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    try {
      const result = await check.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logger.error(`❌ ${check.name} check threw error:`, serialize(error));
      failed++;
    }
  }
  
  const duration = Date.now() - startTime;
  
  logger.info('📋 Health Check Summary', {
    passed,
    failed,
    total: checks.length,
    duration: `${duration}ms`,
    status: failed === 0 ? 'HEALTHY' : 'ISSUES_DETECTED'
  });
  
  // Performance diagnostics
  await performanceDiagnostics();
  
  // Exit with appropriate code
  process.exit(failed === 0 ? 0 : 1);
}

// Handle script arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'mongodb':
    checkMongoDB().then(() => process.exit(0)).catch(() => process.exit(1));
    break;
  case 'redis':
    checkRedis().then(() => process.exit(0)).catch(() => process.exit(1));
    break;
  case 'env':
    checkEnvironment().then(() => process.exit(0)).catch(() => process.exit(1));
    break;
  case 'api':
    checkAPI().then(() => process.exit(0)).catch(() => process.exit(1));
    break;
  case 'models':
    checkModels().then(() => process.exit(0)).catch(() => process.exit(1));
    break;
  default:
    runHealthCheck();
}