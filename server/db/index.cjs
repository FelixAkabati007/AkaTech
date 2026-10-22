const { getDb } = require("./connectionManager.cjs");

// For backward compatibility, provide db as a lazy getter
let dbInstance = null;

async function getDbInstance() {
  if (!dbInstance) {
    dbInstance = await getDb();
  }
  return dbInstance;
}

// Export getDb for new code
module.exports = {
  getDb,
  getDbInstance,
  // Deprecated: kept for backward compatibility
  get db() {
    throw new Error(
      "db property is deprecated. Use getDb() or getDbInstance() instead."
    );
  },
};
