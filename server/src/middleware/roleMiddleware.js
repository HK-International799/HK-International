import ApiError from "../utils/ApiError.js";

/**
 * roleMiddleware must always be used AFTER authMiddleware.
 * Accepts an array of allowed roles.
 */
const roleMiddleware = (roles) => (req, _res, next) => {
  if (!req.user || !req.user.role) {
    return next(new ApiError(401, "Not authenticated"));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new ApiError(403, `Access denied. Required role: ${roles.join(" or ")}`)
    );
  }

  next();
};

export default roleMiddleware;
