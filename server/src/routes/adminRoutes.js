// import express from "express";
// import {
//   createUser, getAdminStats, getRecentActivity,
//   getAllUsers, updateUser, deleteUser, updateUserRole,
//   enrollStudent, getAllRegistrations, processRegistration,
//   exportRegistrationsCSV,
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
// router.patch("/registrations/:id", processRegistration);
// router.get("/registrations/export/csv", exportRegistrationsCSV);

// export default router;





import express from "express";
import {
  createUser, getAdminStats, getRecentActivity,
  getAllUsers, updateUser, deleteUser, updateUserRole,
  enrollStudent, getAllRegistrations, processRegistration,
  exportRegistrationsCSV,
  getRegistrationById, confirmRegistrationPayment, getLearnerProfile,
} from "../controllers/adminController.js";
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

// Learner 360° Profile
router.get("/learners/:id/profile", getLearnerProfile);

export default router;
