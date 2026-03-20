// roleMiddleware must always be used AFTER authMiddleware.
// It checks that the authenticated user's role is in the allowed list.
const roleMiddleware = (roles) => (req, res, next) => {
  // Guard: authMiddleware should have set req.user
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Required role: ${roles.join(" or ")}`,
    });
  }

  next();
};

export default roleMiddleware;