import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * attachUserIfPresent
 *
 * Optional-auth middleware for public endpoints that still benefit from
 * knowing the caller when they happen to be logged in (e.g. guest checkout
 * that should be linked to the learner's account if a session exists).
 *
 * Behaviour, by design (Task 8.4):
 *   - If a valid Bearer token is present -> verifies it and sets req.user,
 *     mirroring authMiddleware.js.
 *   - If no token is present, or the token is invalid/expired -> simply
 *     calls next() with req.user left unset. It NEVER responds with 401.
 *
 * This must not be swapped in for authMiddleware on routes that require
 * a logged-in user — it is intentionally non-blocking.
 */
const attachUserIfPresent = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (user) {
      req.user = user; // Mongoose document — use req.user._id everywhere
    }
  } catch (err) {
    // Invalid/expired token on an optional-auth route: proceed as guest,
    // do not throw — this route must keep working without login.
  }

  next();
};

export default attachUserIfPresent;
