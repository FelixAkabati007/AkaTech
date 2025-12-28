const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { db } = require("../server/db/index.cjs");
const { users } = require("../server/db/schema.cjs");
const { eq } = require("drizzle-orm");
const bcrypt = require("bcryptjs");

const setAdminPassword = async () => {
  const email = process.env.ADMIN_EMAIL || "felixakabati007@gmail.com";
  const password = process.argv[2];

  if (!password) {
    console.error("Usage: node scripts/set_admin_password.cjs <password> [email]");
    console.error("Or set ADMIN_EMAIL in .env");
    process.exit(1);
  }

  try {
    console.log(`Searching for user: ${email}...`);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0]);

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      console.log("User found. Updating password and role...");
      await db
        .update(users)
        .set({
          passwordHash: hashedPassword,
          role: "admin",
          accountType: "hybrid", // Mark as supporting both
        })
        .where(eq(users.id, user.id));
      console.log("User updated successfully.");
    } else {
      console.log("User not found. Creating new admin user...");
      await db.insert(users).values({
        email,
        name: "Felix Akabati",
        role: "admin",
        passwordHash: hashedPassword,
        accountType: "admin",
        googleId: null, // Can be linked later
      });
      console.log("User created successfully.");
    }

    console.log(
      `\nSUCCESS: You can now log in with:\nEmail: ${email}\nPassword: ${password}`
    );
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin password:", error);
    process.exit(1);
  }
};

setAdminPassword();
