const logger = require("../logging/logger.cjs");

function isTransientError(error) {
  if (!error) return false;

  // Network-related errors are transient
  if (error.syscall) {
    const transientSyscalls = [
      "connect",
      "read",
      "write",
      "getaddrinfo",
      "getnameinfo",
    ];
    if (transientSyscalls.includes(error.syscall)) {
      return true;
    }
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
    "socket hang up",
    "econnreset",
    "econnrefused",
    "etimedout",
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

async function withRetry(fn, operationName = "Operation", options = {}) {
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
        logger.error(`${operationName}: Failed after ${attempt} attempts`, {
          operationName,
          attempt,
          maxAttempts,
          isTransient: isTransientErr,
          errorCode: error.code,
          errorMessage: error.message,
        });
        throw error;
      }

      const delayMs = calculateBackoffDelay(
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier
      );

      logger.warn(`${operationName}: Retrying after ${Math.round(delayMs)}ms`, {
        attempt,
        delayMs: Math.round(delayMs),
        errorCode: error.code,
      });

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
