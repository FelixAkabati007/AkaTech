class AppError extends Error {
  constructor(
    message,
    {
      code = "INTERNAL_ERROR",
      statusCode = 500,
      cause = null,
      context = {},
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.cause = cause;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(process.env.NODE_ENV === "development" && {
          context: this.context,
          stack: this.stack,
        }),
      },
    };
  }
}

class DatabaseError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      code: "DATABASE_ERROR",
      statusCode: 503,
      context,
    });
  }
}

class DatabaseUnavailableError extends DatabaseError {
  constructor(context = {}) {
    super("Database is currently unavailable", {
      code: "DATABASE_UNAVAILABLE",
      ...context,
    });
  }
}

class DatabaseOperationError extends DatabaseError {
  constructor(operation, context = {}) {
    super(`Database operation '${operation}' failed`, {
      code: "DATABASE_OPERATION_FAILED",
      ...context,
    });
  }
}

class ValidationError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      code: "VALIDATION_ERROR",
      statusCode: 400,
      context,
    });
  }
}

class AuthenticationError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      code: "AUTHENTICATION_ERROR",
      statusCode: 401,
      context,
    });
  }
}

class AuthorizationError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      code: "AUTHORIZATION_ERROR",
      statusCode: 403,
      context,
    });
  }
}

module.exports = {
  AppError,
  DatabaseError,
  DatabaseUnavailableError,
  DatabaseOperationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
};
