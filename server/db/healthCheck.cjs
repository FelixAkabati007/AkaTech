const { getDb, getConnectionManager } = require("./connectionManager.cjs");
const { sql } = require("drizzle-orm");

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

      await db.execute(sql`SELECT 1`);
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
