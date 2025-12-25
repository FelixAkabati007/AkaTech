const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { db } = require("./db/index.cjs");
const { users, tickets } = require("./db/schema.cjs");
const { eq } = require("drizzle-orm");
const crypto = require("crypto");

async function testConnection() {
  console.log("Testing Neon DB Connection...");

  try {
    // 1. Create a test user
    const testEmail = `test-${crypto.randomUUID()}@example.com`;
    console.log(`Creating test user: ${testEmail}`);

    const newUser = await db
      .insert(users)
      .values({
        email: testEmail,
        name: "Test User",
        role: "client",
        passwordHash: "dummyhash",
      })
      .returning();

    console.log("User created:", newUser[0]);
    const userId = newUser[0].id;

    // 2. Read the user
    console.log("Reading user back...");
    const fetchedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    console.log("User fetched:", fetchedUser[0]);

    if (fetchedUser[0].email !== testEmail) {
      throw new Error("Email mismatch!");
    }

    // 3. Update the user
    console.log("Updating user name...");
    await db
      .update(users)
      .set({ name: "Updated Test User" })
      .where(eq(users.id, userId));
    const updatedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    console.log("User updated:", updatedUser[0]);

    if (updatedUser[0].name !== "Updated Test User") {
      throw new Error("Update failed!");
    }

    // 4. Delete the user
    console.log("Deleting test user...");
    await db.delete(users).where(eq(users.id, userId));

    const deletedUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    if (deletedUser.length === 0) {
      console.log("User successfully deleted.");
    } else {
      throw new Error("Delete failed!");
    }

    console.log("✅ Database Integration Test Passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database Integration Test Failed:", error);
    process.exit(1);
  }
}

testConnection();
