require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { migrate } = require("drizzle-orm/neon-http/migrator");
const logger = require("../logging/logger.cjs");

const runMigrate = async () => {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.VITE_DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL, NEON_DATABASE_URL, or VITE_DATABASE_URL is required");
  }
  const sql = neon(connectionString);
  const db = drizzle(sql);

  logger.info("Starting database migrations");

  await migrate(db, { migrationsFolder: "drizzle" });

  logger.info("Database migrations completed successfully");
  process.exit(0);
};

runMigrate().catch((err) => {
  logger.error("Database migration failed", { message: err.message });
  process.exit(1);
});
