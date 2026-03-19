import express from "express";
import { createUser, enrollStudent, getAdminStats, getRecentActivity } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { deleteUser, getAllUsers, getMe, updateUser, updateUserRole } from "../controllers/adminController.js";



const router = express.Router();

// Admin creates student account
router.post(
  "/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  createUser
);

// Admin enrolls student into course
router.post(
  "/enrollments",
  authMiddleware,
  roleMiddleware(["admin"]),
  enrollStudent
);

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAdminStats
);

router.get(
  "/activity",
  authMiddleware,
  roleMiddleware(["admin"]),
  getRecentActivity
);

// Users management
router.get("/users", authMiddleware, roleMiddleware(["admin"]), getAllUsers);
router.put("/users/:id", authMiddleware, roleMiddleware(["admin"]), updateUser);
router.delete("/users/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);
router.put("/users/:id/role", authMiddleware, roleMiddleware(["admin"]), updateUserRole);


router.get("/me", authMiddleware, getMe);


export default router;
