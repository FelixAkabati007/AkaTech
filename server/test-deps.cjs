try {
  require("@neondatabase/serverless");
  console.log("neondatabase/serverless loaded successfully");
} catch (e) {
  console.error("Failed to load neondatabase/serverless:", e);
}

try {
  require("drizzle-orm/neon-http");
  console.log("drizzle-orm/neon-http loaded successfully");
} catch (e) {
  console.error("Failed to load drizzle-orm/neon-http:", e);
}
