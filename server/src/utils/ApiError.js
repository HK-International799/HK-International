/**
 * ApiError — throwable error with HTTP status code.
 * Use inside controllers/services; asyncHandler will forward it to errorMiddleware.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
