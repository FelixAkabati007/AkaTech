#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Cleanup console statements in server/server.cjs
 * Replaces console.error/warn/log with structured logger
 */

const SERVER_CJS = path.join(__dirname, '../server/server.cjs');

function cleanupConsoleStatements() {
  let content = fs.readFileSync(SERVER_CJS, 'utf-8');
  let replacements = 0;

  // Pattern 1: console.log("Message", req.body) - Don't log request body (security)
  content = content.replace(
    /console\.log\("([^"]+)",\s*req\.body\)/g,
    'logger.debug("$1", { operation: "$1" })'
  );
  replacements += (content.match(/logger.debug.*operation/g) || []).length;

  // Pattern 2: console.log with simple string
  content = content.replace(
    /console\.log\("([^"]+)"\)/g,
    'logger.info("$1")'
  );

  // Pattern 3: console.warn("Message") -> logger.warn
  content = content.replace(
    /console\.warn\("([^"]+)"\)/g,
    'logger.warn("$1")'
  );

  // Pattern 4: console.error("Message", error) -> logger.error with context
  content = content.replace(
    /console\.error\("([^"]+)",\s*(\w+)\)/g,
    'logger.error("$1", { error: $2?.message || String($2) })'
  );

  // Pattern 5: console.error("Message") -> logger.error
  content = content.replace(
    /console\.error\("([^"]+)"\)/g,
    'logger.error("$1")'
  );

  // Pattern 6: .catch(console.error) -> proper error handling
  content = content.replace(
    /\.catch\(console\.error\)/g,
    '.catch((err) => logger.error("Async error", { message: err?.message || String(err) }))'
  );

  // Pattern 7: console.error(err.stack) -> logger.error with stack
  content = content.replace(
    /console\.error\((\w+)\.stack\)/g,
    'logger.error("Unexpected error", { stack: $1?.stack })'
  );

  // Write back
  fs.writeFileSync(SERVER_CJS, content, 'utf-8');
  console.log(`✓ Cleaned up console statements in server/server.cjs`);
  console.log(`  Estimated replacements: ${replacements}`);
}

try {
  cleanupConsoleStatements();
  console.log('✓ Server console cleanup complete');
} catch (error) {
  console.error('Error during cleanup:', error.message);
  process.exit(1);
}
