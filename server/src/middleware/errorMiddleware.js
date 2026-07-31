import multer from "multer";
import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, _next) => {
  // Multer upload errors (file too large, wrong field name, etc.)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      err = new ApiError(413, "File is too large.");
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      err = new ApiError(
        400,
        `Unexpected file field: "${err.field}". Expected field name "file".`
      );
    } else {
      err = new ApiError(400, err.message || "File upload error.");
    }
  }

  // fileFilter rejections in upload.js reject with a plain Error, not
  // an ApiError — surface them as 400s rather than 500s.
  if (
    !err.statusCode &&
    /only (pdf|jpg|png|webp)/i.test(err.message || "")
  ) {
    err = new ApiError(400, err.message);
  }

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
