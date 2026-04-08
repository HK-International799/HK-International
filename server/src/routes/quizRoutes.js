import express from "express";
import {
  createQuiz,
  addQuestion,
  getQuiz,
  publishQuiz
} from "../controllers/quizController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", roleMiddleware(["admin", "tutor"]), createQuiz);

router.post(
  "/:quizId/questions",
  roleMiddleware(["admin", "tutor"]),
  addQuestion
);

router.get("/:id", getQuiz);

router.put(
  "/:id/publish",
  roleMiddleware(["admin", "tutor"]),
  publishQuiz
);

export default router;