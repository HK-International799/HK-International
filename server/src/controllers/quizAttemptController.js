import QuizAttempt from "../models/QuizAttempt.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

/* Attempt Quiz */
export const attemptQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId).populate("questions");

    let score = 0;

    answers.forEach((ans) => {
      const question = quiz.questions.find(
        (q) => q._id.toString() === ans.questionId
      );

      if (question.correctAnswer === ans.selectedOption) {
        score += question.marks;
      }
    });

    const attempt = await QuizAttempt.create({
      quizId,
      studentId: req.user._id,
      answers,
      score,
      completedAt: new Date(),
    });

    res.json({
      message: "Quiz submitted",
      score,
      attempt,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};