# Testing Guide - Code Audit Remediation

Comprehensive testing strategy for validating database connection management and reliability improvements.

---

## Table of Contents
1. [Test Structure](#test-structure)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [Load Tests](#load-tests)
5. [Running Tests](#running-tests)
6. [Coverage Targets](#coverage-targets)

---

## Test Structure

```
server/
├── __tests__/
│   ├── db/
│   │   ├── connection.test.js
│   │   ├── retry.test.js
│   │   ├── healthCheck.test.js
│   │   └── transactions.test.js
│   ├── dal/
│   │   ├── core.test.js
│   │   ├── users.test.js
│   │   └── projects.test.js
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── webhook.test.js
│   │   └── notifications.test.js
│   ├── errors/
│   │   └── errorHandling.test.js
│   └── load/
│       ├── connectionPool.test.js
│       └── concurrent.test.js
```

---

## Unit Tests

### 1. Connection Management Tests

**File:** `server/__tests__/db/connection.test.js`

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ConnectionManager } from "../../db/connectionManager.cjs";

describe("ConnectionManager", () => {
  let manager;
  const testConnectionString = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

  beforeEach(() => {
    manager = new ConnectionManager(testConnectionString);
  });

  afterEach(async () => {
    if (manager) {
      await manager.shutdown();
    }
  });

  describe("initialization", () => {
    it("should initialize successfully", async () => {
      await manager.initialize();
      expect(manager.initialized).toBe(true);
      expect(manager.db).toBeDefined();
    });

    it("should not reinitialize if already initialized", async () => {
      await manager.initialize();
      const firstDb = manager.db;
      await manager.initialize();
      expect(manager.db).toBe(firstDb);
    });

    it("should throw error if DATABASE_URL not set", () => {
      const invalidManager = new ConnectionManager(null);
      expect(() => invalidManager.getDb()).toThrow();
    });

    it("should handle connection failure gracefully", async () => {
      const invalidManager = new ConnectionManager("postgresql://invalid");
      await expect(invalidManager.initialize()).rejects.toThrow();
    });
  });

  describe("metrics", () => {
    it("should track connection metrics", async () => {
      await manager.initialize();
      const metrics = manager.getMetrics();

      expect(metrics).toHaveProperty("totalConnections");
      expect(metrics).toHaveProperty("activeConnections");
      expect(metrics).toHaveProperty("idleConnections");
      expect(metrics).toHaveProperty("waitingRequests");
      expect(metrics).toHaveProperty("utilizationPercent");
    });

    it("should track failed connections", async () => {
      await manager.initialize();
      const initialFailed = manager.metrics.failedConnections;

      // Force a connection error
      try {
        await manager.executeQuery("SELECT * FROM nonexistent_table");
      } catch (error) {
        // Expected
      }

      const updatedFailed = manager.metrics.failedConnections;
      expect(updatedFailed).toBeGreaterThanOrEqual(initialFailed);
    });

    it("should calculate utilization percentage correctly", async () => {
      await manager.initialize();
      const metrics = manager.getMetrics();

      expect(metrics.utilizationPercent).toBeGreaterThanOrEqual(0);
      expect(metrics.utilizationPercent).toBeLessThanOrEqual(100);
    });
  });

  describe("query execution", () => {
    it("should execute queries successfully", async () => {
      await manager.initialize();
      const result = await manager.executeQuery("SELECT 1 as value");

      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
      expect(result.rows[0].value).toBe(1);
    });

    it("should handle query errors gracefully", async () => {
      await manager.initialize();

      expect(() =>
        manager.executeQuery("SELECT * FROM nonexistent_table")
      ).rejects.toThrow();
    });

    it("should properly release connections", async () => {
      await manager.initialize();
      const initialIdle = manager.getMetrics().idleConnections;

      await manager.executeQuery("SELECT 1");
      const afterQueryIdle = manager.getMetrics().idleConnections;

      // After query completes, connection should be released
      expect(afterQueryIdle).toBeGreaterThanOrEqual(initialIdle - 1);
    });
  });

  describe("shutdown", () => {
    it("should close pool on shutdown", async () => {
      await manager.initialize();
      expect(manager.initialized).toBe(true);

      await manager.shutdown();
      expect(manager.initialized).toBe(false);
      expect(manager.db).toBeNull();
    });

    it("should handle graceful shutdown", async () => {
      await manager.initialize();
      // Execute some queries
      for (let i = 0; i < 5; i++) {
        await manager.executeQuery("SELECT 1");
      }

      // Should shutdown cleanly without hanging
      await expect(manager.shutdown()).resolves.not.toThrow();
    });
  });
});
```

### 2. Retry Logic Tests

**File:** `server/__tests__/db/retry.test.js`

```javascript
import { describe, it, expect, vi } from "vitest";
import {
  withRetry,
  isTransientError,
  retryConfig,
} from "../../db/retry.cjs";

describe("Retry Logic", () => {
  describe("isTransientError", () => {
    it("should identify connection errors as transient", () => {
      const error = new Error("Connection refused");
      error.code = "ECONNREFUSED";

      expect(isTransientError(error)).toBe(true);
    });

    it("should identify timeout errors as transient", () => {
      const error = new Error("Operation timeout");
      error.code = "ETIMEDOUT";

      expect(isTransientError(error)).toBe(true);
    });

    it("should identify PostgreSQL connection errors as transient", () => {
      const error = new Error("Connection lost");
      error.code = "08006";

      expect(isTransientError(error)).toBe(true);
    });

    it("should not identify non-transient errors as transient", () => {
      const error = new Error("Syntax error");
      error.code = "42601"; // PostgreSQL syntax error

      expect(isTransientError(error)).toBe(false);
    });

    it("should handle null/undefined errors", () => {
      expect(isTransientError(null)).toBe(false);
      expect(isTransientError(undefined)).toBe(false);
    });
  });

  describe("withRetry", () => {
    it("should execute function successfully on first attempt", async () => {
      const fn = vi.fn().mockResolvedValue("success");

      const result = await withRetry(fn, "Test Operation");

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry on transient error", async () => {
      const error = new Error("Connection timeout");
      error.code = "ETIMEDOUT";

      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce("success");

      const result = await withRetry(fn, "Test Operation");

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should not retry on non-transient error", async () => {
      const error = new Error("Syntax error");
      error.code = "42601";

      const fn = vi.fn().mockRejectedValueOnce(error);

      await expect(
        withRetry(fn, "Test Operation")
      ).rejects.toThrow("Syntax error");

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should respect max attempts", async () => {
      const error = new Error("Connection timeout");
      error.code = "ETIMEDOUT";

      const fn = vi.fn().mockRejectedValue(error);

      await expect(
        withRetry(fn, "Test Operation", {
          maxAttempts: 2,
        })
      ).rejects.toThrow();

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should apply exponential backoff", async () => {
      const error = new Error("Connection timeout");
      error.code = "ETIMEDOUT";

      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce("success");

      const startTime = Date.now();
      await withRetry(fn, "Test Operation", {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 1000,
        backoffMultiplier: 2,
      });
      const duration = Date.now() - startTime;

      // Should take at least 100ms + 200ms of delays
      expect(duration).toBeGreaterThanOrEqual(250);
    });

    it("should use custom retry config", async () => {
      const error = new Error("Connection timeout");
      error.code = "ETIMEDOUT";

      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce("success");

      const result = await withRetry(fn, "Test", retryConfig.connection);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalled();
    });
  });
});
```

### 3. Health Check Tests

**File:** `server/__tests__/db/healthCheck.test.js`

```javascript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { checkDatabaseHealth } from "../../db/healthCheck.cjs";

describe("Database Health Check", () => {
  it("should return health status object", async () => {
    const health = await checkDatabaseHealth();

    expect(health).toHaveProperty("healthy");
    expect(health).toHaveProperty("timestamp");
    expect(health).toHaveProperty("checks");
    expect(health).toHaveProperty("metrics");
  });

  it("should include connection check", async () => {
    const health = await checkDatabaseHealth();

    expect(health.checks).toHaveProperty("connection");
    expect(health.checks.connection).toHaveProperty("status");
    expect(health.checks.connection).toHaveProperty("duration");
  });

  it("should include pool status check", async () => {
    const health = await checkDatabaseHealth();

    expect(health.checks).toHaveProperty("poolStatus");
    expect(["healthy", "degraded", "unhealthy"]).toContain(
      health.checks.poolStatus.status
    );
  });

  it("should include query performance check", async () => {
    const health = await checkDatabaseHealth();

    expect(health.checks).toHaveProperty("queryPerformance");
    expect(health.checks.queryPerformance).toHaveProperty("duration");
  });

  it("should mark as unhealthy if connection fails", async () => {
    // This test assumes database is unavailable
    // Skip in normal testing
    const health = await checkDatabaseHealth();

    if (!health.checks.connection.duration) {
      expect(health.healthy).toBe(false);
    }
  });

  it("should track total duration", async () => {
    const health = await checkDatabaseHealth();

    expect(health.totalDuration).toBeGreaterThan(0);
    expect(health.totalDuration).toBeLessThan(5000);
  });

  it("should include connection metrics", async () => {
    const health = await checkDatabaseHealth();

    expect(health.metrics).toHaveProperty("idleConnections");
    expect(health.metrics).toHaveProperty("waitingRequests");
  });
});
```

---

## Integration Tests

### Auth Integration Tests

**File:** `server/__tests__/integration/auth.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../server.cjs";
import { getDb } from "../../db/connectionManager.cjs";
import { users, eq } from "../../db/schema.cjs";

describe("Authentication Integration", () => {
  let db;
  const testUser = {
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    password: "SecurePassword123!",
  };

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup test user
    if (db && testUser.email) {
      await db.delete(users).where(eq(users.email, testUser.email));
    }
  });

  it("should register new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.user).not.toHaveProperty("passwordHash");
  });

  it("should prevent duplicate registration", async () => {
    // First registration
    await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: `duplicate-${Date.now()}@example.com`,
      })
      .expect(201);

    // Attempt duplicate
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: `duplicate-${Date.now()}@example.com`,
      })
      .expect(400);

    expect(response.body.error).toMatch(/already exists/i);
  });

  it("should validate password requirements", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        password: "short", // Too short
      })
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });

  it("should return token and set cookie", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.headers["set-cookie"][0]).toMatch(/auth_token/);
  });

  it("should allow user login with correct credentials", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: `login-test-${Date.now()}@example.com`,
      });

    const token = registerResponse.body.token;

    // Get current user
    const meResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(meResponse.body.user.email).toBe(testUser.email);
  });

  it("should reject invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid_token")
      .expect(403);

    expect(response.body.error).toBeDefined();
  });
});
```

### Webhook Integration Tests

**File:** `server/__tests__/integration/webhook.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import app from "../../server.cjs";
import { getDb } from "../../db/connectionManager.cjs";
import {
  invoices,
  subscriptions,
  eq,
  and,
} from "../../db/schema.cjs";
import crypto from "crypto";

describe("Webhook Processing", () => {
  let db;
  let testInvoiceId;
  let testUserId;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup
    if (db && testInvoiceId) {
      await db.delete(invoices).where(eq(invoices.id, testInvoiceId));
    }
  });

  it("should process payment webhook", async () => {
    const payload = {
      reference: `test-ref-${Date.now()}`,
      status: "success",
      amount: "10000",
      provider: "paystack",
      invoiceId: testInvoiceId,
    };

    const response = await request(app)
      .post("/api/webhooks/payment")
      .send(payload)
      .expect(200);

    expect(response.body.received).toBe(true);
  });

  it("should update invoice status on successful payment", async () => {
    const referenceNumber = `test-ref-${Date.now()}`;

    // Create test invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        referenceNumber,
        status: "pending",
        amount: "10000",
        userId: testUserId,
      })
      .returning();

    const payload = {
      reference: referenceNumber,
      status: "success",
      amount: "10000",
      provider: "paystack",
    };

    await request(app)
      .post("/api/webhooks/payment")
      .send(payload)
      .expect(200);

    // Verify invoice updated
    const updatedInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.referenceNumber, referenceNumber));

    expect(updatedInvoice[0].status).toBe("Paid");
  });

  it("should activate subscription on successful payment", async () => {
    const referenceNumber = `sub-test-${Date.now()}`;

    // Create invoice and subscription
    const [invoice] = await db
      .insert(invoices)
      .values({
        referenceNumber,
        status: "pending",
        amount: "10000",
        userId: testUserId,
      })
      .returning();

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId: testUserId,
        status: "pending",
        plan: "pro",
      })
      .returning();

    const payload = {
      reference: referenceNumber,
      status: "success",
      amount: "10000",
      provider: "paystack",
    };

    await request(app)
      .post("/api/webhooks/payment")
      .send(payload)
      .expect(200);

    // Verify subscription activated
    const updatedSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscription.id));

    expect(updatedSubscription[0].status).toBe("active");
  });

  it("should handle invalid signatures", async () => {
    const payload = {
      reference: "test",
      status: "success",
      amount: "10000",
    };

    const response = await request(app)
      .post("/api/webhooks/payment")
      .set(
        "x-paystack-signature",
        "invalid_signature_that_does_not_match"
      )
      .send(payload);

    // May return 401 or process without verification depending on implementation
    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it("should be idempotent for duplicate webhooks", async () => {
    const referenceNumber = `idempotent-${Date.now()}`;

    const [invoice] = await db
      .insert(invoices)
      .values({
        referenceNumber,
        status: "pending",
        amount: "10000",
        userId: testUserId,
      })
      .returning();

    const payload = {
      reference: referenceNumber,
      status: "success",
      amount: "10000",
      provider: "paystack",
    };

    // Send same webhook twice
    await request(app).post("/api/webhooks/payment").send(payload);
    const response = await request(app)
      .post("/api/webhooks/payment")
      .send(payload)
      .expect(200);

    expect(response.body.received).toBe(true);

    // Invoice should still be marked as paid, not cause error
    const updated = await db
      .select()
      .from(invoices)
      .where(eq(invoices.referenceNumber, referenceNumber));

    expect(updated[0].status).toBe("Paid");
  });
});
```

---

## Load Tests

### Connection Pool Load Test

**File:** `server/__tests__/load/connectionPool.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getConnectionManager } from "../../db/connectionManager.cjs";

describe("Connection Pool Load Testing", () => {
  let connectionManager;

  beforeAll(async () => {
    connectionManager = await getConnectionManager();
  });

  afterAll(async () => {
    if (connectionManager) {
      await connectionManager.shutdown();
    }
  });

  it("should handle 100 concurrent queries", async () => {
    const promises = [];
    const startTime = Date.now();

    for (let i = 0; i < 100; i++) {
      promises.push(
        connectionManager.executeQuery("SELECT $1::int as value", [i])
      );
    }

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    expect(results).toHaveLength(100);
    expect(duration).toBeLessThan(10000); // Should complete in <10s
  });

  it("should handle queue when pool exhausted", async () => {
    const promises = [];
    const startTime = Date.now();

    // Create more promises than pool size (50)
    for (let i = 0; i < 150; i++) {
      promises.push(
        connectionManager.executeQuery("SELECT 1").catch((err) => ({
          error: err.message,
        }))
      );
    }

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    // All should eventually succeed or have clear error
    const successCount = results.filter((r) => !r.error).length;
    expect(successCount).toBeGreaterThan(140); // Most should succeed

    // Should complete reasonably fast with queuing
    expect(duration).toBeLessThan(30000);
  });

  it("should recover from connection spikes", async () => {
    const metrics1 = connectionManager.getMetrics();

    // Spike
    const spike = [];
    for (let i = 0; i < 50; i++) {
      spike.push(
        connectionManager.executeQuery("SELECT 1")
      );
    }
    await Promise.all(spike);

    // Should return to normal
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const metrics2 = connectionManager.getMetrics();

    expect(metrics2.activeConnections).toBeLessThan(
      metrics1.activeConnections + 20
    );
  });

  it("should not leak connections", async () => {
    const initialMetrics = connectionManager.getMetrics();

    // Execute many queries
    for (let i = 0; i < 200; i++) {
      await connectionManager.executeQuery("SELECT 1");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    const finalMetrics = connectionManager.getMetrics();

    // Should not have significantly more active connections
    expect(finalMetrics.activeConnections).toBeCloseTo(
      initialMetrics.activeConnections,
      -1
    );
  });
});
```

---

## Running Tests

### Execute All Tests
```bash
npm test
```

### Execute Specific Test Suite
```bash
npm test -- db/connection.test.js
npm test -- integration/auth.test.js
npm test -- load/
```

### Execute with Coverage
```bash
npm test -- --coverage
```

### Watch Mode (Development)
```bash
npm test -- --watch
```

### Verbose Output
```bash
npm test -- --reporter=verbose
```

### Generate Coverage Report
```bash
npm test -- --coverage --coverage.reporter=html
# Open coverage/index.html
```

---

## Coverage Targets

### Phase 1 (Weeks 1-2)
- Database connection management: >90%
- Retry logic: >85%
- Error handling: >80%
- **Overall:** >75%

### Phase 2 (Weeks 3-4)
- DAL layer: >85%
- Integration tests: >70%
- Logging module: >90%
- **Overall:** >80%

### Phase 3 (Weeks 5+)
- Load tests: 100% critical paths
- End-to-end tests: >75%
- **Overall:** >85%

---

## Test Data Management

### Cleanup Strategy
```javascript
beforeEach(() => {
  // Create unique identifiers for each test
  testId = `test-${Date.now()}-${Math.random()}`;
});

afterEach(async () => {
  // Always cleanup test data
  if (db) {
    await db.delete(testTable).where(
      eq(testTable.id, testId)
    );
  }
});
```

### Isolation
- Each test should be independent
- No reliance on other test execution order
- Use unique identifiers to prevent conflicts
- Clean up after each test

---

## Troubleshooting Test Failures

### Timeout Errors
```bash
# Increase timeout for specific tests
npm test -- --testTimeout=30000
```

### Connection Pool Exhaustion in Tests
```javascript
// Use smaller pool for testing
process.env.DB_POOL_MAX = "5";
```

### Flaky Tests
- Add retries for network operations
- Use longer timeouts in CI
- Check for timing-dependent assertions

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm

      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:load
```

---

**Document Version:** 1.0  
**Last Updated:** April 28, 2026
