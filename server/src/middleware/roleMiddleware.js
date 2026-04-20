import ApiError from "../utils/ApiError.js";

/**
 * Role-based access control middleware
 * MUST be used after authMiddleware
 * @param {Array<string>} roles - allowed roles
 */
const roleMiddleware = (roles = []) => {
  return (req, _res, next) => {
    try {
      // 🔒 Check authentication
      if (!req.user) {
        return next(new ApiError(401, "Not authenticated"));
      }

      const userRole = req.user.role;

      if (!userRole) {
        return next(new ApiError(401, "User role missing"));
      }

      // ⚠️ Validate roles input (avoid crashes)
      if (!Array.isArray(roles) || roles.length === 0) {
        console.error("roleMiddleware misconfigured: roles not provided");
        return next(new ApiError(500, "Server configuration error"));
      }

      // ❌ Access check
      if (!roles.includes(userRole)) {
        return next(
          new ApiError(
            403,
            `Access denied. Allowed roles: ${roles.join(", ")}`
          )
        );
      }

      // ✅ Authorized
      next();
    } catch (err) {
      console.error("roleMiddleware error:", err);
      next(new ApiError(500, "Internal server error"));
    }
  };
};

export default roleMiddleware;