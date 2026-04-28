# Implementation Guide - Code Audit Remediation

This guide provides step-by-step instructions for implementing the fixes identified in CODE_AUDIT_REPORT.md.

---

## Phase 1: Critical Fixes (Week 1)

### 1.1 Connection Management Refactor

#### Step 1: Create New Connection Manager

Create `/server/db/connectionManager.cjs`:

```javascript
const { Pool, Client } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const schema = require("./schema.cjs");

class ConnectionManager {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.pool = null;
    this.db = null;
    this.initialized = false;
    this.metrics = {
      totalConnections: 0,
      failedConnections: 0,
      activeConnections: 0,
    };
  }

  async initialize() {
    if (this.initialized) {
      console.log("[ConnectionManager] Already initialized");
      return this.db;
    }

    try {
      this.pool = new Pool({
        connectionString: this.connectionString,
        ssl: { rejectUnauthorized: false },
        max: 50, // Increased for concurrent requests
        min: 5, // Maintain minimum connections
        idleTimeoutMillis: 60000, // 60 seconds idle timeout
        connectionTimeoutMillis: 5000, // 5 second connection timeout
        statement_timeout: 30000, // 30 second statement timeout
        query_timeout: 30000, // 30 second query timeout
      });

      // Setup pool event listeners
      this.setupPoolListeners();

      // Test connection
      const client = await this.pool.connect();
      await client.query("SELECT 1");
      client.release();

      this.db = drizzle(this.pool, { schema });
      this.initialized = true;

      console.log("[ConnectionManager] Successfully initialized");
      return this.db;
    } catch (error) {
      console.error("[ConnectionManager] Initialization failed:", error);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  setupPoolListeners() {
    this.pool.on("connect", () => {
      this.metrics.totalConnections++;
      this.metrics.activeConnections++;
      console.log("[Pool] Connection established", {
        active: this.metrics.activeConnections,
        total: this.metrics.totalConnections,
      });
    });

    this.pool.on("error", (err) => {
      this.metrics.failedConnections++;
      console.error("[Pool] Unexpected error on idle client:", err);
    });

    this.pool.on("remove", () => {
      this.metrics.activeConnections--;
      console.log("[Pool] Client removed", {
        active: this.metrics.activeConnections,
      });
    });
  }

  getDb() {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }

  async executeQuery(query, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result;
    } finally {
      client.release();
    }
  }

  getMetrics() {
    const size = this.pool ? this.pool.idleCount : 0;
    const waiting = this.pool ? this.pool.waitingCount : 0;

    return {
      ...this.metrics,
      idleConnections: size,
      waitingRequests: waiting,
      utilizationPercent: this.metrics.totalConnections
        ? Math.round(
            ((this.metrics.activeConnections / this.metrics.totalConnections) *
              100)
          )
        : 0,
    };
  }

  async shutdown() {
    if (this.pool) {
      await this.pool.end();
      this.initialized = false;
      this.db = null;
      console.log("[ConnectionManager] Pool closed");
    }
  }
}

let manager = null;

async function getConnectionManager() {
  if (!manager) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    manager = new ConnectionManager(connectionString);
    await manager.initialize();
  }
  return manager;
}

async function getDb() {
  const connectionManager = await getConnectionManager();
  return connectionManager.getDb();
}

module.exports = {
  getConnectionManager,
  getDb,
  ConnectionManager,
};
```

#### Step 2: Create Health Check Module

Create `/server/db/healthCheck.cjs`:

```javascript
const { getDb, getConnectionManager } = require("./connectionManager.cjs");

async function checkDatabaseHealth() {
  const startTime = Date.now();
  const results = {
    healthy: false,
    timestamp: new Date().toISOString(),
    checks: {},
    metrics: {},
  };

  try {
    // Check 1: Connection availability
    try {
      const connectionManager = await getConnectionManager();
      const db = await getDb();

      await db.execute("SELECT 1");
      results.checks.connection = {
        status: "healthy",
        duration: Date.now() - startTime,
      };
    } catch (error) {
      results.checks.connection = {
        status: "unhealthy",
        error: error.message,
        duration: Date.now() - startTime,
      };
    }

    // Check 2: Pool status
    try {
      const connectionManager = await getConnectionManager();
      const metrics = connectionManager.getMetrics();

      results.metrics = metrics;

      if (metrics.idleConnections === 0 && metrics.waitingRequests > 0) {
        results.checks.poolStatus = {
          status: "degraded",
          warning: "Connection pool exhausted, requests queued",
        };
      } else if (metrics.utilizationPercent > 80) {
        results.checks.poolStatus = {
          status: "degraded",
          warning: `Pool utilization at ${metrics.utilizationPercent}%`,
        };
      } else {
        results.checks.poolStatus = {
          status: "healthy",
        };
      }
    } catch (error) {
      results.checks.poolStatus = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // Check 3: Query performance
    try {
      const startQuery = Date.now();
      const db = await getDb();
      const sql = require("drizzle-orm").sql;

      await db.execute(sql`SELECT 1`);

      const queryTime = Date.now() - startQuery;
      results.checks.queryPerformance = {
        status: queryTime < 500 ? "healthy" : "degraded",
        duration: queryTime,
      };
    } catch (error) {
      results.checks.queryPerformance = {
        status: "unhealthy",
        error: error.message,
      };
    }

    // Overall health
    const allHealthy = Object.values(results.checks).every(
      (check) => check.status === "healthy"
    );
    results.healthy = allHealthy;
    results.totalDuration = Date.now() - startTime;

    return results;
  } catch (error) {
    results.checks.overall = {
      status: "unhealthy",
      error: error.message,
    };
    return results;
  }
}

module.exports = {
  checkDatabaseHealth,
};
```

#### Step 3: Update server/db/index.cjs

Replace the current content with:

```javascript
const { getDb } = require("./connectionManager.cjs");

// Export the getDb function for backward compatibility
module.exports = {
  db: null, // Keep for now, but deprecated
  getDb, // New preferred method
};

// Lazy initialization
let dbInstance = null;

// For backward compatibility with existing code
Object.defineProperty(module.exports, "db", {
  get: async function () {
    if (!dbInstance) {
      dbInstance = await getDb();
    }
    return dbInstance;
  },
});
```

#### Step 4: Update server/server.cjs Health Check

Replace the health check endpoint with:

```javascript
// Add this import at the top of server.cjs
const { checkDatabaseHealth } = require("./db/healthCheck.cjs");

// Replace the existing health check endpoints with:
app.get("/api/health", async (req, res) => {
  const health = await checkDatabaseHealth();
  const statusCode = health.healthy ? 200 : 503;
  res.status(statusCode).json(health);
});

app.head("/api/health", async (req, res) => {
  const health = await checkDatabaseHealth();
  const statusCode = health.healthy ? 200 : 503;
  res.status(statusCode).end();
});

// New detailed health endpoint for monitoring
app.get("/api/health/detailed", async (req, res) => {
  const health = await checkDatabaseHealth();
  res.json(health);
});
```

---

### 1.2 Retry Logic Implementation

Create `/server/db/retry.cjs`:

```javascript
const logger = require("../logging/logger.cjs");

const TRANSIENT_ERROR_CODES = [
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "40P01", // Serialization failure in PostgreSQL
  "08006", // Connection failure
  "08003", // Connection does not exist
];

function isTransientError(error) {
  if (!error) return false;

  // Check error code
  if (TRANSIENT_ERROR_CODES.includes(error.code)) {
    return true;
  }

  // Check PostgreSQL error codes
  if (error.code && typeof error.code === "string") {
    // 08xxx = Connection Exception
    // 40xxx = Transaction Rollback
    if (error.code.startsWith("08") || error.code.startsWith("40")) {
      return true;
    }
  }

  // Check error message
  const message = error.message?.toLowerCase() || "";
  const transientPatterns = [
    "timeout",
    "connection refused",
    "connection reset",
    "connection lost",
    "broken pipe",
    "network is unreachable",
  ];

  return transientPatterns.some((pattern) => message.includes(pattern));
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoffDelay(attempt, initialDelayMs, maxDelayMs, multiplier) {
  // Exponential backoff with jitter
  const exponentialDelay = initialDelayMs * Math.pow(multiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  const jitter = Math.random() * cappedDelay * 0.1; // 10% jitter

  return cappedDelay + jitter;
}

async function withRetry(
  fn,
  operationName = "Operation",
  options = {}
) {
  const {
    maxAttempts = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    isTransient = isTransientError,
  } = options;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logger.debug(`${operationName}: Attempt ${attempt}/${maxAttempts}`);
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;

      const isTransientErr = isTransient(error);

      if (!isTransientErr || attempt === maxAttempts) {
        logger.error(
          `${operationName}: Failed after ${attempt} attempts`,
          {
            operationName,
            attempt,
            maxAttempts,
            isTransient: isTransientErr,
            errorCode: error.code,
            errorMessage: error.message,
          }
        );
        throw error;
      }

      const delayMs = calculateBackoffDelay(
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier
      );

      logger.warn(
        `${operationName}: Retrying after ${Math.round(delayMs)}ms`,
        {
          attempt,
          delayMs: Math.round(delayMs),
          errorCode: error.code,
        }
      );

      await delay(delayMs);
    }
  }

  throw lastError;
}

// Specific retry configurations for different operations
const retryConfig = {
  query: {
    maxAttempts: 3,
    initialDelayMs: 50,
    maxDelayMs: 2000,
  },
  connection: {
    maxAttempts: 5,
    initialDelayMs: 100,
    maxDelayMs: 5000,
  },
  transaction: {
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 3000,
  },
};

module.exports = {
  withRetry,
  isTransientError,
  retryConfig,
};
```

#### Update server/dal.cjs

Update the `getDb()` function calls in dal.cjs to use retry logic:

```javascript
// Add at the top of dal.cjs
const { withRetry, retryConfig } = require("./retry.cjs");
const { getDb } = require("./db/connectionManager.cjs");

// Example update for getUserByEmail - apply pattern to all DAL functions
const getUserByEmail = async (email) => {
  return withRetry(
    async () => {
      const db = await getDb();
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0];
    },
    "getUserByEmail",
    retryConfig.query
  );
};
```

---

### 1.3 Error Handling & Types

Create `/server/errors/AppError.cjs`:

```javascript
class AppError extends Error {
  constructor(
    message,
    {
      code = "INTERNAL_ERROR",
      statusCode = 500,
      cause = null,
      context = {},
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.cause = cause;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(process.env.NODE_ENV === "development" && {
          context: this.context,
          stack: this.stack,
        }),
      },
    };
  }
}

class DatabaseError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      code: "DATABASE_ERROR",
      statusCode: 503,
      context,
    });
  }
}

class DatabaseUnavailableError extends DatabaseError {
  constructor(context = {}) {
    super("Database is currently unavailable", {
      code: "DATABASE_UNAVAILABLE",
      ...context,
    });
  }
}

class DatabaseOperationError extends DatabaseError {
  constructor(operation, context = {}) {
    super(`Database operation '${operation}' failed`, {
      code: "DATABASE_OPERATION_FAILED",
      ...context,
    });
  }
}

class ValidationError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      context,
    });
  }
}

class AuthenticationError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      code: "AUTHENTICATION_ERROR",
      statusCode: 401,
      context,
    });
  }
}

class AuthorizationError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      code: "AUTHORIZATION_ERROR",
      statusCode: 403,
      context,
    });
  }
}

module.exports = {
  AppError,
  DatabaseError,
  DatabaseUnavailableError,
  DatabaseOperationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
};
```

Create `/server/errors/errorHandler.cjs`:

```javascript
const { AppError } = require("./AppError.cjs");

function errorHandler(err, req, res, next) {
  // Log the error
  console.error("[ErrorHandler]", {
    name: err.name,
    message: err.message,
    code: err.code,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Unhandled error
  const errorId = Math.random().toString(36).substr(2, 9);
  res.status(500).json({
    error: {
      name: "InternalServerError",
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      errorId,
      statusCode: 500,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
        stack: err.stack,
      }),
    },
  });
}

module.exports = {
  errorHandler,
};
```

#### Update server/server.cjs

Add error handler middleware:

```javascript
// Add at the end of server.cjs, before starting the server
const { errorHandler } = require("./errors/errorHandler.cjs");

app.use(errorHandler);

// Global promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("[UnhandledRejection]", {
    reason,
    promise,
    timestamp: new Date().toISOString(),
  });
});

process.on("uncaughtException", (error) => {
  console.error("[UncaughtException]", {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  // Gracefully shutdown
  process.exit(1);
});
```

---

### 1.4 Password Security Fix

Update `/server/server.cjs` registration endpoint:

```javascript
// Replace the registration endpoint with:
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password, role, accountType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long.",
      });
    }

    const existingUser = await dal.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with this email.",
      });
    }

    // Use bcrypt for password hashing (consistent with change-password)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await dal.createUser({
      name: xss(name),
      email: xss(email),
      passwordHash: hashedPassword,
      role: role || "client",
      accountType: accountType || "Auto",
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Set secure cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;

    // Notify clients
    io.emit("user_registered", userWithoutPassword);

    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

---

## Phase 2: Observability & Logging

### 2.1 Structured Logger

Create `/server/logging/logger.cjs`:

```javascript
const fs = require("fs");
const path = require("path");

class StructuredLogger {
  constructor(options = {}) {
    this.level = options.level || "info";
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile || false;
    this.logDir = options.logDir || "./logs";

    // Log level hierarchy
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    if (this.enableFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  shouldLog(messageLevel) {
    return this.levels[messageLevel] <= this.levels[this.level];
  }

  formatMessage(level, message, data = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...data,
      processId: process.pid,
    });
  }

  writeLog(level, message, data = {}) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, data);

    if (this.enableConsole) {
      const colorCodes = {
        error: "\x1b[31m", // Red
        warn: "\x1b[33m", // Yellow
        info: "\x1b[36m", // Cyan
        debug: "\x1b[35m", // Magenta
        reset: "\x1b[0m",
      };

      const color = colorCodes[level] || colorCodes.reset;
      console.log(`${color}${formatted}${colorCodes.reset}`);
    }

    if (this.enableFile) {
      const logFile = path.join(
        this.logDir,
        `${level}.${new Date().toISOString().split("T")[0]}.log`
      );
      fs.appendFileSync(logFile, formatted + "\n");
    }
  }

  error(message, data) {
    this.writeLog("error", message, data);
  }

  warn(message, data) {
    this.writeLog("warn", message, data);
  }

  info(message, data) {
    this.writeLog("info", message, data);
  }

  debug(message, data) {
    this.writeLog("debug", message, data);
  }
}

// Global logger instance
const logger = new StructuredLogger({
  level: process.env.LOG_LEVEL || "info",
  enableConsole: true,
  enableFile: process.env.LOG_TO_FILE === "true",
  logDir: process.env.LOG_DIR || "./logs",
});

module.exports = logger;
```

---

## Testing Suite Templates

### Unit Test Example: Connection Tests

Create `/server/__tests__/db/connection.test.js`:

```javascript
const { describe, it, expect, beforeAll, afterAll } = require("vitest");
const {
  getConnectionManager,
  ConnectionManager,
} = require("../../db/connectionManager.cjs");

describe("Database Connection Management", () => {
  let connectionManager;

  beforeAll(async () => {
    connectionManager = new ConnectionManager(process.env.DATABASE_URL);
  });

  afterAll(async () => {
    if (connectionManager) {
      await connectionManager.shutdown();
    }
  });

  it("should initialize connection pool successfully", async () => {
    await connectionManager.initialize();
    expect(connectionManager.initialized).toBe(true);
    expect(connectionManager.db).toBeDefined();
  });

  it("should return metrics for connection pool", () => {
    const metrics = connectionManager.getMetrics();
    expect(metrics).toHaveProperty("totalConnections");
    expect(metrics).toHaveProperty("activeConnections");
    expect(metrics).toHaveProperty("utilizationPercent");
  });

  it("should handle query execution", async () => {
    const result = await connectionManager.executeQuery("SELECT 1");
    expect(result).toBeDefined();
    expect(result.rows).toBeDefined();
  });

  it("should reject if not initialized", () => {
    const unitializedManager = new ConnectionManager("postgresql://test");
    expect(() => unitializedManager.getDb()).toThrow();
  });
});
```

### Integration Test Example: Auth with Database

Create `/server/__tests__/integration/auth.test.js`:

```javascript
const { describe, it, expect, beforeAll, afterAll } = require("vitest");
const request = require("supertest");
const app = require("../../server.cjs");
const { getDb } = require("../../db/connectionManager.cjs");
const { users } = require("../../db/schema.cjs");

describe("Authentication Integration", () => {
  let db;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should register a new user successfully", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "SecurePassword123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
  });

  it("should prevent duplicate registration", async () => {
    // Register first user
    await request(app).post("/api/auth/register").send({
      name: "User 1",
      email: "duplicate@example.com",
      password: "Password123",
    });

    // Attempt duplicate
    const response = await request(app).post("/api/auth/register").send({
      name: "User 2",
      email: "duplicate@example.com",
      password: "Password456",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/already exists/i);
  });
});
```

---

## Monitoring & Dashboards

Create a health monitoring endpoint in `/server/routes/health.cjs`:

```javascript
const express = require("express");
const { checkDatabaseHealth } = require("../db/healthCheck.cjs");
const { getConnectionManager } = require("../db/connectionManager.cjs");

const router = express.Router();

router.get("/health", async (req, res) => {
  const health = await checkDatabaseHealth();
  const statusCode = health.healthy ? 200 : 503;
  res.status(statusCode).json(health);
});

router.get("/health/metrics", async (req, res) => {
  try {
    const connectionManager = await getConnectionManager();
    const metrics = connectionManager.getMetrics();

    res.json({
      timestamp: new Date().toISOString(),
      database: {
        connectionPool: metrics,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
```

---

## Deployment Checklist

- [ ] All new files created and tested locally
- [ ] Existing code updated with retry logic
- [ ] Error handlers properly registered
- [ ] Logging implemented and configured
- [ ] Health checks returning correct status codes
- [ ] Backup of production database created
- [ ] Staging environment updated first
- [ ] Integration tests passing
- [ ] Load tests showing acceptable performance
- [ ] Monitoring dashboards prepared
- [ ] Runbooks for troubleshooting updated
- [ ] Team trained on new error codes
- [ ] Rollback plan validated
- [ ] Production deployment scheduled during low-traffic window

---

## Troubleshooting During Implementation

### Connection Pool Issues
If connection pool exhaustion occurs:
```bash
# Check current pool metrics
curl http://localhost:3001/api/health/metrics

# Check for hanging connections
ps aux | grep postgres

# Restart with fresh pool
kill -9 <pid>
npm start
```

### Query Timeout Issues
If queries timing out:
1. Check query performance: `curl http://localhost:3001/api/health/detailed`
2. Review logs for slow queries
3. Adjust timeout values if necessary
4. Optimize database indexes

### Retry Loop Issues
If retry logic creating infinite loops:
1. Check transient error detection logic
2. Verify max attempt counts
3. Review backoff delay calculations
4. Add circuit breaker if needed

---

## Success Validation

After each phase, verify:

1. **Phase 1:** All new modules initialize without errors
2. **Phase 2:** Logger outputs structured data with timestamps
3. **Phase 3:** Unit tests run with >80% coverage
4. **Phase 4:** Query performance metrics improving
5. **Phase 5:** Transaction tests passing with proper rollback

---

**Document Version:** 1.0  
**Last Updated:** April 28, 2026
