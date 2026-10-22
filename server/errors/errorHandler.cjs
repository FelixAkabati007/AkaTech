const { AppError } = require("./AppError.cjs");
const logger = require("../logging/logger.cjs");

function errorHandler(err, req, res, next) {
  // Log the error
  logger.error("Request error", {
    name: err.name,
    message: err.message,
    code: err.code,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Unhandled error
  const errorId = Math.random().toString(36).substr(2, 9);
  res.status(500).json({
    error: {
      name: "InternalServerError",
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      errorId,
      statusCode: 500,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
        stack: err.stack,
      }),
    },
  });
}

module.exports = {
  errorHandler,
};
