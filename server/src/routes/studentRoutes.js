// import express from "express";
// import {
//   getStudentDashboard,
//   getMyCourses,
//   getMyAssignments,
// } from "../controllers/studentController.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";

// const router = express.Router();

// router.get(
//   "/dashboard",
//   authMiddleware,
//   roleMiddleware(["student"]),
//   getStudentDashboard
// );

// router.get(
//   "/courses",
//   authMiddleware,
//   roleMiddleware(["student"]),
//   getMyCourses
// );

// router.get(
//   "/assignments",
//   authMiddleware,
//   roleMiddleware(["student"]),
//   getMyAssignments
// );

// export default router;


import express from "express";
import {
  getStudentDashboard,
  getMyCourses,
  getMyAssignments,
  getProfile,
  updateProfile,
  getMyCertificates,
} from "../controllers/studentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["student"]));

// Dashboard
router.get("/dashboard", getStudentDashboard);

// Courses
router.get("/courses", getMyCourses);

// Assignments
router.get("/assignments", getMyAssignments);

// Profile
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Certificates
router.get("/certificates", getMyCertificates);

export default router;
