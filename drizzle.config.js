import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./server/db/schema.cjs",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      process.env.NEON_DATABASE_URL ||
      process.env.VITE_DATABASE_URL ||
      "postgresql://user:password@localhost:5432/dbname",
  },
});
