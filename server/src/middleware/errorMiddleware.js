const errorMiddleware = (err, req, res, next) => {
  // Use the error's own statusCode if set, otherwise default to 500
  const statusCode = err.statusCode || res.statusCode === 200 ? err.statusCode || 500 : res.statusCode;

  // Log the full error server-side
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // In production, hide internal error details from clients
  const message = process.env.NODE_ENV === "production" && statusCode === 500
    ? "Internal server error"
    : err.message || "Something went wrong";

  res.status(statusCode).json({
    message,
    // Only send stack trace in development
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;