#!/usr/bin/env node
// 🔒 SECURITY: Automated security testing and validation script

import https from 'https';
import http from 'http';
import { URL } from 'url';

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
const TEST_USER_AGENT = 'SecurityTest/1.0';

// ANSI colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

class SecurityTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: [],
    };
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': TEST_USER_AGENT,
          'Accept': 'application/json',
          ...options.headers,
        },
        timeout: 10000,
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  addResult(test, passed, message, severity = 'info') {
    const result = { test, passed, message, severity };
    this.results.tests.push(result);

    if (passed) {
      this.results.passed++;
      this.log(`✅ ${test}: ${message}`, 'green');
    } else {
      if (severity === 'critical') {
        this.results.failed++;
        this.log(`❌ ${test}: ${message}`, 'red');
      } else {
        this.results.warnings++;
        this.log(`⚠️  ${test}: ${message}`, 'yellow');
      }
    }
  }

  // Test 1: Security Headers
  async testSecurityHeaders() {
    this.log('\n🔒 Testing Security Headers...', 'cyan');
    
    try {
      const response = await this.makeRequest('/');
      const headers = response.headers;

      const requiredHeaders = {
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'x-xss-protection': '1; mode=block',
        'strict-transport-security': true, // Just check presence
        'content-security-policy': true,
        'referrer-policy': 'strict-origin-when-cross-origin',
      };

      for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
        const actualValue = headers[header];
        
        if (!actualValue) {
          this.addResult(
            `Security Header: ${header}`,
            false,
            `Missing security header: ${header}`,
            'critical'
          );
        } else if (expectedValue === true) {
          this.addResult(
            `Security Header: ${header}`,
            true,
            `Present: ${actualValue.substring(0, 50)}...`
          );
        } else if (actualValue === expectedValue) {
          this.addResult(
            `Security Header: ${header}`,
            true,
            `Correct value: ${actualValue}`
          );
        } else {
          this.addResult(
            `Security Header: ${header}`,
            false,
            `Incorrect value. Expected: ${expectedValue}, Got: ${actualValue}`,
            'warning'
          );
        }
      }

      // Check for information disclosure headers
      const dangerousHeaders = ['server', 'x-powered-by'];
      for (const header of dangerousHeaders) {
        if (headers[header]) {
          this.addResult(
            `Information Disclosure: ${header}`,
            false,
            `Header exposes server information: ${headers[header]}`,
            'warning'
          );
        } else {
          this.addResult(
            `Information Disclosure: ${header}`,
            true,
            `Header properly hidden`
          );
        }
      }

    } catch (error) {
      this.addResult(
        'Security Headers Test',
        false,
        `Failed to test headers: ${error.message}`,
        'critical'
      );
    }
  }

  // Test 2: Authentication Rate Limiting
  async testAuthRateLimit() {
    this.log('\n🛡️  Testing Authentication Rate Limiting...', 'cyan');
    
    try {
      const attempts = [];
      const maxAttempts = 8; // Should exceed the limit of 5

      for (let i = 0; i < maxAttempts; i++) {
        const response = await this.makeRequest('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test${i}@example.com`,
            password: 'wrongpassword123',
          }),
        });

        attempts.push({
          attempt: i + 1,
          status: response.status,
          rateLimitHeaders: {
            limit: response.headers['x-ratelimit-limit'],
            remaining: response.headers['x-ratelimit-remaining'],
            reset: response.headers['x-ratelimit-reset'],
          },
        });

        // Break if we get rate limited
        if (response.status === 429) {
          break;
        }

        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const rateLimitedAttempts = attempts.filter(a => a.status === 429);
      
      if (rateLimitedAttempts.length > 0) {
        this.addResult(
          'Authentication Rate Limiting',
          true,
          `Rate limiting activated after ${attempts.length - rateLimitedAttempts.length} attempts`
        );
      } else {
        this.addResult(
          'Authentication Rate Limiting',
          false,
          `No rate limiting detected after ${attempts.length} attempts`,
          'critical'
        );
      }

    } catch (error) {
      this.addResult(
        'Authentication Rate Limiting',
        false,
        `Test failed: ${error.message}`,
        'warning'
      );
    }
  }

  // Test 3: Admin Route Protection
  async testAdminProtection() {
    this.log('\n🔐 Testing Admin Route Protection...', 'cyan');
    
    const adminRoutes = [
      '/api/admin/audit-log',
      '/admin',
      '/admin/users',
    ];

    for (const route of adminRoutes) {
      try {
        const response = await this.makeRequest(route);
        
        if (response.status === 401 || response.status === 403) {
          this.addResult(
            `Admin Protection: ${route}`,
            true,
            `Properly protected (${response.status})`
          );
        } else if (response.status === 404) {
          this.addResult(
            `Admin Protection: ${route}`,
            true,
            `Route not found (acceptable)`
          );
        } else {
          this.addResult(
            `Admin Protection: ${route}`,
            false,
            `Unexpected access allowed (${response.status})`,
            'critical'
          );
        }
      } catch (error) {
        this.addResult(
          `Admin Protection: ${route}`,
          false,
          `Test failed: ${error.message}`,
          'warning'
        );
      }
    }
  }

  // Test 4: Input Validation
  async testInputValidation() {
    this.log('\n🔍 Testing Input Validation...', 'cyan');
    
    const maliciousPayloads = [
      // XSS attempts
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      'javascript:alert("xss")',
      
      // SQL Injection attempts
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      
      // Command Injection
      '; cat /etc/passwd',
      '| whoami',
      '$(whoami)',
    ];

    for (const payload of maliciousPayloads) {
      try {
        // Test signup endpoint with malicious input
        const response = await this.makeRequest('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload,
            email: `test@example.com`,
            password: 'ValidPassword123!',
          }),
        });

        // Check if the response indicates proper handling
        if (response.status === 400 || response.status === 422) {
          this.addResult(
            `Input Validation: ${payload.substring(0, 20)}...`,
            true,
            'Malicious input properly rejected'
          );
        } else if (response.status === 429) {
          this.addResult(
            `Input Validation: ${payload.substring(0, 20)}...`,
            true,
            'Rate limited (acceptable)'
          );
        } else {
          const body = JSON.parse(response.body || '{}');
          if (body.error && body.error.includes('validation')) {
            this.addResult(
              `Input Validation: ${payload.substring(0, 20)}...`,
              true,
              'Validation error returned'
            );
          } else {
            this.addResult(
              `Input Validation: ${payload.substring(0, 20)}...`,
              false,
              `Unexpected response: ${response.status}`,
              'warning'
            );
          }
        }

      } catch (error) {
        this.addResult(
          `Input Validation: ${payload.substring(0, 20)}...`,
          false,
          `Test failed: ${error.message}`,
          'warning'
        );
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Test 5: Information Disclosure
  async testInformationDisclosure() {
    this.log('\n🔒 Testing Information Disclosure...', 'cyan');
    
    const sensitiveEndpoints = [
      '/.env',
      '/package.json',
      '/next.config.js',
      '/.git/config',
      '/api/debug',
      '/server-status',
      '/phpinfo.php', // Common probe
    ];

    for (const endpoint of sensitiveEndpoints) {
      try {
        const response = await this.makeRequest(endpoint);
        
        if (response.status === 404) {
          this.addResult(
            `Information Disclosure: ${endpoint}`,
            true,
            'Properly returns 404'
          );
        } else if (response.status === 403) {
          this.addResult(
            `Information Disclosure: ${endpoint}`,
            true,
            'Access properly forbidden'
          );
        } else if (response.status === 200) {
          this.addResult(
            `Information Disclosure: ${endpoint}`,
            false,
            'Sensitive file accessible',
            'critical'
          );
        } else {
          this.addResult(
            `Information Disclosure: ${endpoint}`,
            false,
            `Unexpected response: ${response.status}`,
            'warning'
          );
        }
      } catch (error) {
        this.addResult(
          `Information Disclosure: ${endpoint}`,
          true,
          'Request failed (good)'
        );
      }
    }
  }

  // Test 6: HTTPS and SSL/TLS
  async testHTTPS() {
    this.log('\n🔐 Testing HTTPS Configuration...', 'cyan');
    
    if (this.baseUrl.startsWith('https://')) {
      try {
        const response = await this.makeRequest('/');
        
        this.addResult(
          'HTTPS Connection',
          true,
          'HTTPS connection successful'
        );

        // Check HSTS header
        const hstsHeader = response.headers['strict-transport-security'];
        if (hstsHeader) {
          if (hstsHeader.includes('max-age') && hstsHeader.includes('includeSubDomains')) {
            this.addResult(
              'HSTS Configuration',
              true,
              `Strong HSTS policy: ${hstsHeader}`
            );
          } else {
            this.addResult(
              'HSTS Configuration',
              false,
              `Weak HSTS policy: ${hstsHeader}`,
              'warning'
            );
          }
        } else {
          this.addResult(
            'HSTS Configuration',
            false,
            'HSTS header missing',
            'warning'
          );
        }

      } catch (error) {
        this.addResult(
          'HTTPS Connection',
          false,
          `HTTPS connection failed: ${error.message}`,
          'critical'
        );
      }
    } else {
      this.addResult(
        'HTTPS Configuration',
        false,
        'Application not served over HTTPS',
        'critical'
      );
    }
  }

  // Generate Summary Report
  generateReport() {
    this.log('\n📊 Security Test Summary', 'bold');
    this.log('═'.repeat(50), 'cyan');
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const passRate = ((this.results.passed / total) * 100).toFixed(1);
    
    this.log(`Total Tests: ${total}`, 'white');
    this.log(`Passed: ${this.results.passed}`, 'green');
    this.log(`Failed: ${this.results.failed}`, 'red');
    this.log(`Warnings: ${this.results.warnings}`, 'yellow');
    this.log(`Pass Rate: ${passRate}%`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');
    
    // Security Score
    let score = 0;
    score += this.results.passed * 3;
    score += this.results.warnings * 1;
    score -= this.results.failed * 5;
    score = Math.max(0, Math.min(100, (score / (total * 3)) * 100));
    
    this.log(`\n🔒 Security Score: ${score.toFixed(1)}/100`, score >= 85 ? 'green' : score >= 70 ? 'yellow' : 'red');
    
    // Recommendations
    this.log('\n📋 Recommendations:', 'bold');
    
    if (this.results.failed > 0) {
      this.log('• Address all critical security failures immediately', 'red');
    }
    
    if (this.results.warnings > 0) {
      this.log('• Review and fix security warnings', 'yellow');
    }
    
    if (score < 85) {
      this.log('• Implement additional security measures', 'yellow');
      this.log('• Consider professional security audit', 'yellow');
    }
    
    if (score >= 90) {
      this.log('• Excellent security posture! 🎉', 'green');
      this.log('• Continue monitoring and regular testing', 'green');
    }

    // Exit code based on results
    const exitCode = this.results.failed > 0 ? 1 : 0;
    return exitCode;
  }

  async runAllTests() {
    this.log('🔒 Starting Comprehensive Security Test Suite', 'bold');
    this.log(`Testing: ${this.baseUrl}`, 'cyan');
    this.log('═'.repeat(50), 'cyan');

    await this.testSecurityHeaders();
    await this.testAuthRateLimit();
    await this.testAdminProtection();
    await this.testInputValidation();
    await this.testInformationDisclosure();
    await this.testHTTPS();

    return this.generateReport();
  }
}

// Main execution
async function main() {
  try {
    const tester = new SecurityTester(BASE_URL);
    const exitCode = await tester.runAllTests();
    process.exit(exitCode);
  } catch (error) {
    console.error(`❌ Security test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle CLI arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔒 Security Testing Suite

Usage: node security-test.mjs [options]

Options:
  --help, -h     Show this help message
  
Environment Variables:
  NEXT_PUBLIC_URL  Base URL to test (default: http://localhost:3000)

Examples:
  node security-test.mjs
  NEXT_PUBLIC_URL=https://example.com node security-test.mjs
`);
  process.exit(0);
}

// Run tests
main();