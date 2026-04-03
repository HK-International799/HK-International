import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return next(new ApiError(401, "User no longer exists"));
    }

    req.user = user; // Mongoose document — use req.user._id everywhere
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired, please log in again"));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token"));
    }
    return next(new ApiError(401, "Authentication failed"));
  }
};

export default authMiddleware;
