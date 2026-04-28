require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { migrate } = require("drizzle-orm/neon-http/migrator");
const logger = require("../logging/logger.cjs");

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const sql = neon(process.env.DATABASE_URL);
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
