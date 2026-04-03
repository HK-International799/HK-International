import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, _next) => {
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    err = new ApiError(400, messages.join(", "));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    err = new ApiError(409, `Duplicate value for: ${field}`);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    err = new ApiError(400, `Invalid ID: ${err.value}`);
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Something went wrong";

  console.error(`[${new Date().toISOString()}] ${statusCode} — ${err.message}`);
  if (process.env.NODE_ENV !== "production") console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;
