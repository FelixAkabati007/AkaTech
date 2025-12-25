const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const schema = require("./schema.cjs");

// Default to a placeholder if not set, but it will fail on query if invalid
const connectionString = process.env.DATABASE_URL;

let db;

if (connectionString) {
  const sql = neon(connectionString);
  db = drizzle(sql, { schema });
} else {
  console.warn("DATABASE_URL is not set. Database features will fail.");
  // Mock db for initial load if needed, or just let it be undefined and handle in usage
}

module.exports = { db };
