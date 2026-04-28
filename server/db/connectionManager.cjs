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
