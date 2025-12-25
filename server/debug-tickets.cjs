const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");
const {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
} = require("drizzle-orm/pg-core");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"), // Not referencing here to avoid dependency in debug script
  userEmail: text("user_email"),
  userName: text("user_name"),
  subject: text("subject"),
  message: text("message"),
  responses: jsonb("responses"),
  status: text("status"),
  priority: text("priority"),
  createdAt: timestamp("created_at"),
});

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("Fetching all tickets...");
  const allTickets = await db.select().from(tickets);
  console.log("Tickets found:", allTickets.length);
  allTickets.forEach((t) => {
    console.log(
      `Email: '${t.userEmail}' (len: ${t.userEmail ? t.userEmail.length : 0})`
    );
  });
}

main().catch(console.error);
