import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-passwordHash");
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      req.user = user; // full user document with _id
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "Token expired" });
      }
      return res.status(401).json({ msg: "Invalid token" });
    }
  } else {
    return res.status(401).json({ msg: "No token provided" });
  }
};

export default authMiddleware;
