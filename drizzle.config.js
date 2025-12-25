import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema.cjs",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/dbname",
  },
});
