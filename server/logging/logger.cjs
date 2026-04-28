const fs = require("fs");
const path = require("path");

class StructuredLogger {
  constructor(options = {}) {
    this.level = options.level || "info";
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile || false;
    this.logDir = options.logDir || "./logs";

    // Log level hierarchy
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    if (this.enableFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  shouldLog(messageLevel) {
    return this.levels[messageLevel] <= this.levels[this.level];
  }

  formatMessage(level, message, data = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...data,
      processId: process.pid,
    });
  }

  writeLog(level, message, data = {}) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, data);

    if (this.enableConsole) {
      const colorCodes = {
        error: "\x1b[31m", // Red
        warn: "\x1b[33m", // Yellow
        info: "\x1b[36m", // Cyan
        debug: "\x1b[35m", // Magenta
        reset: "\x1b[0m",
      };

      const color = colorCodes[level] || colorCodes.reset;
      console.log(`${color}${formatted}${colorCodes.reset}`);
    }

    if (this.enableFile) {
      const logFile = path.join(
        this.logDir,
        `${level}.${new Date().toISOString().split("T")[0]}.log`
      );
      fs.appendFileSync(logFile, formatted + "\n");
    }
  }

  error(message, data) {
    this.writeLog("error", message, data);
  }

  warn(message, data) {
    this.writeLog("warn", message, data);
  }

  info(message, data) {
    this.writeLog("info", message, data);
  }

  debug(message, data) {
    this.writeLog("debug", message, data);
  }
}

// Global logger instance
const logger = new StructuredLogger({
  level: process.env.LOG_LEVEL || "info",
  enableConsole: true,
  enableFile: process.env.LOG_TO_FILE === "true",
  logDir: process.env.LOG_DIR || "./logs",
});

module.exports = logger;
