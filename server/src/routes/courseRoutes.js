// import express from "express";
// import {
//   getCourses,
//   getCourseById,
//   createCourse,
//   updateCourse,
//   deleteCourse,
//   assignTutor,
//   addSection,
//   updateSection,
//   deleteSection,
//   enrollStudent,
//   createFullCourse,
// } from "../controllers/courseController.js";

// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";

// const router = express.Router();

// /**
//  * 🔐 All routes require authentication
//  */
// router.use(authMiddleware);

// /**
//  * 📚 Public (Authenticated Users)
//  */
// router.get("/", getCourses);
// router.get("/:id", getCourseById);

// /**
//  * 🛠 Admin Only
//  */
// router.post("/", roleMiddleware(["admin", "super_admin"]), createCourse);
// router.delete("/:id", roleMiddleware(["admin", "super_admin"]), deleteCourse);
// router.post("/:id/assign-tutor", roleMiddleware(["admin", "super_admin"]), assignTutor);

// router.post(
//   "/full",
//   authMiddleware,
//   roleMiddleware(["admin", "super_admin"]),
//   createFullCourse,
// );
// /**
//  * ✏️ Admin + Tutor
//  */
// router.put("/:id", roleMiddleware(["admin", "tutor", "super_admin"]), updateCourse);

// /**
//  * 📂 Sections (Admin + Tutor)
//  */
// router.post("/:id/sections", roleMiddleware(["admin", "tutor", "super_admin"]), addSection);
// router.put(
//   "/sections/:sectionId",
//   roleMiddleware(["admin", "tutor", "super_admin"]),
//   updateSection,
// );
// router.delete(
//   "/sections/:sectionId",
//   roleMiddleware(["admin", "tutor", "super_admin"]),
//   deleteSection,
// );

// //enroll student
// router.post("/:id/enroll-student", roleMiddleware(["admin", "super_admin"]), enrollStudent);

// export default router;

import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  assignTutor,
  addSection,
  updateSection,
  deleteSection,
  enrollStudent,
  createFullCourse,
  getCourseEnrollmentsProgress,
  revokeEnrollment,
} from "../controllers/courseController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * 🔐 All routes require authentication
 */
router.use(authMiddleware);

/**
 * 📚 Public (Authenticated Users)
 */
router.get("/", getCourses);
router.get("/:id", getCourseById);

/**
 * 🛠 Admin Only
 */
router.post("/", roleMiddleware(["admin", "super_admin"]), createCourse);
router.delete("/:id", roleMiddleware(["admin", "super_admin"]), deleteCourse);
router.post("/:id/assign-tutor", roleMiddleware(["admin", "super_admin"]), assignTutor);

router.post(
  "/full",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  createFullCourse,
);
/**
 * ✏️ Admin + Tutor
 */
router.put("/:id", roleMiddleware(["admin", "tutor", "super_admin"]), updateCourse);

/**
 * 📂 Sections (Admin + Tutor)
 */
router.post("/:id/sections", roleMiddleware(["admin", "tutor", "super_admin"]), addSection);
router.put(
  "/sections/:sectionId",
  roleMiddleware(["admin", "tutor", "super_admin"]),
  updateSection,
);
router.delete(
  "/sections/:sectionId",
  roleMiddleware(["admin", "tutor", "super_admin"]),
  deleteSection,
);

//enroll student
router.post("/:id/enroll-student", roleMiddleware(["admin", "super_admin"]), enrollStudent);

// ── Admin: Enrollments & Progress ──────────────────────────────────────────
router.get(
  "/:id/enrollments-progress",
  roleMiddleware(["admin", "super_admin"]),
  getCourseEnrollmentsProgress
);
router.delete(
  "/:id/enrollment/:studentId",
  roleMiddleware(["admin", "super_admin"]),
  revokeEnrollment
);

export default router;
