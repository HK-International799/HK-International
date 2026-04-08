import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

/* Create Quiz */
export const createQuiz = async (req, res) => {
  try {
    const { title, courseId, lessonId } = req.body;

    const quiz = await Quiz.create({
      title,
      courseId,
      lessonId,
    });

    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Add Question */
export const addQuestion = async (req, res) => {
  try {

    const {
      type,
      prompt,
      options,
      correctAnswer,
      marks
    } = req.body;

    if (!type || !prompt || !marks) {
      return res.status(400).json({
        message: "Missing fields"
      });
    }

    const quiz = await Quiz.findById(
      req.params.quizId
    );

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    const question = await Question.create({
      type,
      prompt,
      options,
      correctAnswer,
      marks,
    });

    quiz.questions.push(question._id);
    quiz.totalMarks += Number(marks);

    await quiz.save();

    res.json(quiz);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


/* Get Quiz */
export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("questions");

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Publish Quiz */
export const publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};