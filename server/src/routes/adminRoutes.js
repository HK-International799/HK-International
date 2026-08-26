

// import express from "express";
// import {
//   createUser, getAdminStats, getRecentActivity,
//   getAllUsers, updateUser, deleteUser, updateUserRole,
//   enrollStudent, getAllRegistrations, processRegistration,
//   exportRegistrationsCSV,
//   getRegistrationById, confirmRegistrationPayment, getLearnerProfile,
// } from "../controllers/adminController.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";

// const router = express.Router();

// router.use(authMiddleware, roleMiddleware(["admin", "super_admin"]));

// // Dashboard
// router.get("/stats", getAdminStats);
// router.get("/activity", getRecentActivity);

// // Users
// router.post("/users", createUser);
// router.get("/users", getAllUsers);
// router.put("/users/:id", updateUser);
// router.delete("/users/:id", deleteUser);
// router.patch("/users/:id/role", updateUserRole);

// // Enrollments
// router.post("/enroll", enrollStudent);

// // Registrations
// router.get("/registrations", getAllRegistrations);
// router.get("/registrations/export/csv", exportRegistrationsCSV);
// router.get("/registrations/:id", getRegistrationById);
// router.patch("/registrations/:id", processRegistration);
// router.patch("/registrations/:id/payment", confirmRegistrationPayment);

// // Learner 360° Profile
// router.get("/learners/:id/profile", getLearnerProfile);

// export default router;



import express from "express";
import {
  createUser, getAdminStats, getRecentActivity,
  getAllUsers, updateUser, deleteUser, updateUserRole,
  enrollStudent, getAllRegistrations, processRegistration,
  exportRegistrationsCSV,
  getRegistrationById, confirmRegistrationPayment, getLearnerProfile,
  exportLearnerHistory,
} from "../controllers/adminController.js";
import {
  approveRequestedCourse,
  rejectRequestedCourse,
} from "../controllers/registrationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["admin", "super_admin"]));

// Dashboard
router.get("/stats", getAdminStats);
router.get("/activity", getRecentActivity);

// Users
router.post("/users", createUser);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/role", updateUserRole);

// Enrollments
router.post("/enroll", enrollStudent);

// Registrations
router.get("/registrations", getAllRegistrations);
router.get("/registrations/export/csv", exportRegistrationsCSV);
router.get("/registrations/:id", getRegistrationById);
router.patch("/registrations/:id", processRegistration);
router.patch("/registrations/:id/payment", confirmRegistrationPayment);

// Registration Requirement 3 — admin decides which requested course(s) a
// candidate is actually enrolled into; original request is preserved.
router.patch("/registrations/:id/courses/approve", approveRequestedCourse);
router.patch("/registrations/:id/courses/reject", rejectRequestedCourse);

// Learner 360° Profile
router.get("/learners/:id/profile", getLearnerProfile);

// Complete Candidate History Export
router.get("/learners/:id/export", exportLearnerHistory);

export default router;
