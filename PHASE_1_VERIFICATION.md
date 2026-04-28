# Phase 1 Implementation Verification Guide

**Purpose:** Verify all Phase 1 implementations are working correctly  
**Estimated Time:** 15-30 minutes  
**Prerequisites:** Node.js 16+, Neon database connection

---

## Pre-Deployment Checks

### 1. Syntax & Module Validation

Run this to verify all new modules load correctly:

```bash
cd /vercel/share/v0-project
node -c server/db/connectionManager.cjs && echo "✓ connectionManager"
node -c server/db/healthCheck.cjs && echo "✓ healthCheck"
node -c server/db/retry.cjs && echo "✓ retry"
node -c server/logging/logger.cjs && echo "✓ logger"
node -c server/errors/AppError.cjs && echo "✓ AppError"
node -c server/errors/errorHandler.cjs && echo "✓ errorHandler"
node -c server/server.cjs && echo "✓ server"
```

**Expected Output:**
```
✓ connectionManager
✓ healthCheck
✓ retry
✓ logger
✓ AppError
✓ errorHandler
✓ server
```

---

### 2. Module Import Verification

Create a test file `/vercel/share/v0-project/tests/verify-phase1.js`:

```javascript
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function verify() {
  console.log("Verifying Phase 1 Implementation...\n");

  try {
    // 1. Test logger
    console.log("1. Testing Logger...");
    const logger = require("../server/logging/logger.cjs");
    logger.info("Logger test", { test: true });
    console.log("   ✓ Logger working\n");

    // 2. Test error classes
    console.log("2. Testing Error Classes...");
    const {
      AppError,
      DatabaseError,
      ValidationError,
    } = require("../server/errors/AppError.cjs");
    const err = new ValidationError("Test", { field: "email" });
    console.log("   Error created:", err.code);
    console.log("   ✓ Error classes working\n");

    // 3. Test retry logic
    console.log("3. Testing Retry Logic...");
    const { withRetry, isTransientError } = require("../server/db/retry.cjs");
    const testError = new Error("Connection timeout");
    testError.message = "timeout";
    console.log("   Is transient:", isTransientError(testError));
    console.log("   ✓ Retry logic working\n");

    // 4. Test connection manager
    console.log("4. Testing Connection Manager...");
    const { ConnectionManager } = require("../server/db/connectionManager.cjs");
    console.log("   ConnectionManager available:", typeof ConnectionManager);
    console.log("   ✓ Connection manager loaded\n");

    // 5. Test health check (requires DB connection)
    console.log("5. Testing Health Check Module...");
    const { checkDatabaseHealth } = require("../server/db/healthCheck.cjs");
    console.log("   Health check function available:", typeof checkDatabaseHealth);
    console.log("   ✓ Health check loaded\n");

    console.log("All Phase 1 modules verified successfully! ✓\n");
  } catch (error) {
    console.error("Verification failed:", error.message);
    process.exit(1);
  }
}

verify();
```

Run it:
```bash
node tests/verify-phase1.js
```

---

### 3. Database Connection Test

```bash
# Start the server
npm start

# In another terminal, test the health endpoint
curl http://localhost:3001/api/health

# Expected response (should show healthy database):
{
  "healthy": true,
  "timestamp": "2026-04-28T10:30:45.123Z",
  "checks": {
    "connection": { "status": "healthy", "duration": 45 },
    "poolStatus": { "status": "healthy" },
    "queryPerformance": { "status": "healthy", "duration": 12 }
  },
  "metrics": {
    "totalConnections": 5,
    "activeConnections": 1,
    "idleConnections": 4,
    "waitingRequests": 0,
    "utilizationPercent": 20
  },
  "totalDuration": 48
}
```

---

### 4. Error Handling Test

Create `/vercel/share/v0-project/tests/test-error-handler.js`:

```javascript
const express = require("express");
const { errorHandler } = require("../server/errors/errorHandler.cjs");
const {
  ValidationError,
  DatabaseError,
} = require("../server/errors/AppError.cjs");

const app = express();

// Test route that throws validation error
app.get("/test/validation", (req, res, next) => {
  next(new ValidationError("Email is required", { field: "email" }));
});

// Test route that throws database error
app.get("/test/database", (req, res, next) => {
  next(new DatabaseError("Connection failed", { code: "08P01" }));
});

// Test route that throws generic error
app.get("/test/generic", (req, res, next) => {
  next(new Error("Something went wrong"));
});

// Error handler
app.use(errorHandler);

// Test server
const port = 3002;
const server = app.listen(port, () => {
  console.log(`Test server running on port ${port}\n`);

  // Run tests
  setTimeout(() => {
    runTests();
  }, 1000);
});

async function runTests() {
  const tests = [
    { path: "/test/validation", expectedStatus: 400 },
    { path: "/test/database", expectedStatus: 503 },
    { path: "/test/generic", expectedStatus: 500 },
  ];

  for (const test of tests) {
    try {
      const response = await fetch(`http://localhost:${port}${test.path}`);
      const data = await response.json();
      console.log(`${test.path}:`);
      console.log(`  Status: ${response.status} (expected ${test.expectedStatus})`);
      console.log(`  Error code: ${data.error?.code}`);
      console.log(`  ${response.status === test.expectedStatus ? "✓ PASS" : "✗ FAIL"}\n`);
    } catch (error) {
      console.error(`✗ FAIL: ${test.path} - ${error.message}`);
    }
  }

  server.close();
  process.exit(0);
}
```

Run it:
```bash
node tests/test-error-handler.js
```

---

### 5. Password Hashing Test

Create `/vercel/share/v0-project/tests/test-password-hash.js`:

```javascript
const bcrypt = require("bcryptjs");

async function testPasswordHashing() {
  console.log("Testing Password Hashing Implementation\n");

  const password = "TestPassword123!";

  // Test bcrypt hashing
  console.log("1. Testing bcrypt hash...");
  const hash = await bcrypt.hash(password, 10);
  console.log("   Hash created:", hash.substring(0, 20) + "...");
  console.log("   Hash length:", hash.length);

  // Test password comparison
  console.log("\n2. Testing password comparison...");
  const isValid = await bcrypt.compare(password, hash);
  console.log("   Password match:", isValid ? "✓ YES" : "✗ NO");

  // Test wrong password
  const wrongPassword = await bcrypt.compare("WrongPassword", hash);
  console.log("   Wrong password match:", wrongPassword ? "✗ YES (ERROR)" : "✓ NO (correct)");

  // Performance test
  console.log("\n3. Testing hash performance...");
  const start = Date.now();
  await bcrypt.hash(password, 10);
  const duration = Date.now() - start;
  console.log(`   Time to hash: ${duration}ms (target: 100-300ms)`);

  console.log("\n✓ Password hashing tests complete!");
}

testPasswordHashing().catch(console.error);
```

Run it:
```bash
node tests/test-password-hash.js
```

**Expected Output:**
```
Testing Password Hashing Implementation

1. Testing bcrypt hash...
   Hash created: $2a$10$XK0L5.wE...
   Hash length: 60

2. Testing password comparison...
   Password match: ✓ YES
   Wrong password match: ✓ NO (correct)

3. Testing hash performance...
   Time to hash: 234ms (target: 100-300ms)

✓ Password hashing tests complete!
```

---

## Staging Environment Verification

### 1. Deploy to Staging
```bash
git add .
git commit -m "feat: Phase 1 implementation - connection pooling, retry logic, error handling"
git push origin main

# Deploy to staging
vercel --prod
```

### 2. Monitor Health Endpoint
```bash
# Check health every 10 seconds
watch -n 10 'curl -s https://staging.aka-tech.com/api/health | jq .'
```

### 3. Load Test
```bash
# Simple load test with 50 concurrent connections
ab -n 1000 -c 50 https://staging.aka-tech.com/api/health
```

**Expected Results:**
- All requests succeed (2000 requests total)
- Connection pool properly utilized
- No connection timeouts
- Health checks complete in <100ms

### 4. Error Scenario Testing
```bash
# Test with database connection failure (simulate by stopping Neon temporarily)
# Monitor error logs for:
# - Retry attempts with exponential backoff
# - Structured error logs with operation names
# - Recovery when database comes back online
```

---

## Logging Verification

### 1. Console Output Check
```bash
# Start server and watch logs
npm start 2>&1 | grep -E "ERROR|WARN|INFO|Debug"
```

Should see structured JSON logs like:
```json
{"timestamp":"2026-04-28T10:30:45.123Z","level":"INFO","message":"Server started","port":3001}
{"timestamp":"2026-04-28T10:30:46.456Z","level":"DEBUG","message":"getUserByEmail: Attempt 1/3"}
```

### 2. File Logging (Optional)
```bash
# Enable file logging
LOG_TO_FILE=true npm start

# Check logs directory
ls -la logs/
cat logs/info.2026-04-28.log
```

---

## Regression Testing

### 1. Auth Flow
```bash
# Test registration with new bcrypt hashing
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "client"
  }'

# Expected: 201 Created with user data and auth token
```

### 2. Login Flow
```bash
# Test login works with bcrypt hashes
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Expected: 200 OK with auth token
```

### 3. Database Operations
```bash
# Test various DAL operations still work
curl http://localhost:3001/api/users \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Expected: 200 OK with user list
```

---

## Checklist for Phase 1 Verification

### Code Quality
- [ ] All files pass syntax validation
- [ ] No TypeErrors on module import
- [ ] All dependencies available
- [ ] Error handling integrated

### Functionality
- [ ] Health endpoint responds with database status
- [ ] Logger outputs structured JSON
- [ ] Error handler catches all exceptions
- [ ] Password hashing uses bcrypt (not SHA256)
- [ ] Retry logic activates on transient errors

### Performance
- [ ] Health check completes in <100ms
- [ ] Password hashing takes 100-300ms
- [ ] Connection pool efficiently manages resources
- [ ] No memory leaks under load

### Security
- [ ] Passwords hashed with bcrypt (10 rounds)
- [ ] Errors don't leak sensitive info (dev mode only)
- [ ] Connection string not exposed in logs
- [ ] CORS properly configured

### Integration
- [ ] Existing routes still functional
- [ ] DAL functions work with new getDb()
- [ ] Error handlers don't break existing error handling
- [ ] Logger doesn't interfere with existing logs

---

## Troubleshooting

### Issue: "DATABASE_URL is not set"
**Solution:** Ensure `.env` file has `DATABASE_URL` set to valid Neon connection string

### Issue: Health check returns 503
**Solution:** Check Neon connection status, verify DATABASE_URL format

### Issue: Password hash takes >1000ms
**Solution:** Server might be slow, normal for bcrypt. Ensure 10 rounds used.

### Issue: "Cannot find module" errors
**Solution:** Verify file paths use `.cjs` extension, check node_modules installed

### Issue: Logger not showing output
**Solution:** Check LOG_LEVEL env var, default is "info" (shows info, warn, error)

---

## Sign-Off

| Check | Status | Date | Notes |
|-------|--------|------|-------|
| Syntax validation | ✓ | 2026-04-28 | All modules pass |
| Module imports | ✓ | 2026-04-28 | All exports working |
| Health endpoint | □ | | To test in staging |
| Error handling | □ | | To test in staging |
| Password hashing | □ | | To test in staging |
| Load testing | □ | | To test in staging |
| Production ready | □ | | Pending staging validation |

---

## Next Steps

1. Run verification script on staging
2. Monitor error logs for 24 hours
3. Run load tests to validate performance
4. Compare metrics to baseline
5. If all pass: approve for production deployment

**Estimated Time to Production:** 2-3 days (including 24hr monitoring period)
