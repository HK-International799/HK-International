// import express from "express";
// import {
//   createLesson,
//   getLesson,
//   deleteLesson,
// } from "../controllers/lessonController.js";

// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";

// const router = express.Router();

// // tutor/admin create lesson
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware(["admin", "tutor"]),
//   createLesson
// );

// // get lesson
// router.get("/:id", authMiddleware, getLesson);

// // delete lesson
// router.delete(
//   "/:id",
//   authMiddleware,
//   roleMiddleware(["admin", "tutor"]),
//   deleteLesson
// );

// export default router;


import express from "express";
import {
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// tutor/admin create lesson
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  createLesson
);

// get lesson (any authenticated user)
router.get("/:id", authMiddleware, getLesson);

// update lesson
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  updateLesson
);

// delete lesson
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "tutor"]),
  deleteLesson
);

export default router;
