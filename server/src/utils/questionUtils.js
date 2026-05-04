


// import Quiz from "../models/Quiz.js";
// import Question from "../models/Question.js";

// /**
//  * Get all questions linked to a course
//  */
// export const getQuestionsByCourse = async (courseId) => {
//   try {
//     console.log("📌 Fetching quizzes for course:", courseId);

//     const quizzes = await Quiz.find({ courseId }).lean();

//     console.log("📊 Quizzes found:", quizzes.length);

//     if (!quizzes.length) {
//       console.warn("⚠️ No quizzes found for this course");
//       return [];
//     }

//     // Collect question IDs
//     const questionIdSet = new Set();

//     quizzes.forEach((quiz, index) => {
//       console.log(`📘 Quiz ${index + 1} question count:`, quiz.questions?.length || 0);

//       (quiz.questions || []).forEach((qId) => {
//         questionIdSet.add(qId.toString());
//       });
//     });

//     console.log("🧠 Unique Question IDs:", questionIdSet.size);

//     if (!questionIdSet.size) {
//       console.warn("⚠️ No question IDs found inside quizzes");
//       return [];
//     }

//     // Fetch actual questions
//     const questions = await Question.find({
//       _id: { $in: [...questionIdSet] },
//     }).lean();

//     console.log("✅ Questions fetched from DB:", questions.length);

//     return questions;
//   } catch (err) {
//     console.error("❌ getQuestionsByCourse ERROR:", err);
//     return [];
//   }
// };

// /**
//  * Random selection (safe)
//  */
// export const randomSelect = (arr, n) => {
//   if (!Array.isArray(arr)) {
//     console.error("❌ randomSelect: input is not array");
//     return [];
//   }

//   const copy = [...arr];

//   for (let i = 0; i < Math.min(n, copy.length); i++) {
//     const j = i + Math.floor(Math.random() * (copy.length - i));
//     [copy[i], copy[j]] = [copy[j], copy[i]];
//   }

//   return copy.slice(0, n);
// };

// /**
//  * Build question set
//  */
// export const buildQuestionSet = async (
//   courseId,
//   required,
//   manualQuestions = []
// ) => {
//   try {
//     console.log("🚀 Building question set...");
//     console.log("➡ Required:", required);
//     console.log("➡ Manual questions:", manualQuestions.length);

//     const courseQuestions = await getQuestionsByCourse(courseId);

//     console.log("📚 Course questions fetched:", courseQuestions.length);

//     // Normalize
//     const normalised = courseQuestions.map((q) => ({
//       _id: q._id,
//       questionText: q.questionText || q.question || q.text,
//       options: q.options || [],
//       correctAnswer: q.correctAnswer || q.answer,
//       explanation: q.explanation || "",
//       marks: q.marks || 1,
//       negativeMarks: q.negativeMarks || 0,
//       isManual: false,
//     }));

//     // Manual
//     const markedManual = manualQuestions.map((q) => ({
//       ...q,
//       isManual: true,
//     }));

//     const pool = [...normalised, ...markedManual];

//     console.log("🧩 Total pool size:", pool.length);

//     if (pool.length < required) {
//       console.warn("⚠️ Not enough questions");
//       return {
//         questionSet: [],
//         error: `Not enough questions. Required: ${required}, Available: ${pool.length}`,
//       };
//     }

//     const questionSet = randomSelect(pool, required);

//     console.log("✅ Final question set created:", questionSet.length);

//     return { questionSet, error: null };
//   } catch (err) {
//     console.error("❌ buildQuestionSet ERROR:", err);
//     return {
//       questionSet: [],
//       error: "Failed to build question set",
//     };
//   }
// };






// utils/questionUtils.js

import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

/**
 * Get all questions linked to a course via its quizzes.
 * DB stores questions with `prompt` (not questionText) and options as string[].
 */
export const getQuestionsByCourse = async (courseId) => {
  try {
    console.log("📌 Fetching quizzes for course:", courseId);

    const quizzes = await Quiz.find({ courseId }).lean();

    console.log("📊 Quizzes found:", quizzes.length);

    if (!quizzes.length) {
      console.warn("⚠️ No quizzes found for this course");
      return [];
    }

    // Collect unique question IDs across all quizzes
    const questionIdSet = new Set();
    quizzes.forEach((quiz) => {
      (quiz.questions || []).forEach((qId) => {
        questionIdSet.add(qId.toString());
      });
    });

    console.log("🧠 Unique Question IDs:", questionIdSet.size);

    if (!questionIdSet.size) {
      console.warn("⚠️ No question IDs found inside quizzes");
      return [];
    }

    const questions = await Question.find({
      _id: { $in: [...questionIdSet] },
    }).lean();

    console.log("✅ Questions fetched from DB:", questions.length);

    return questions;
  } catch (err) {
    console.error("❌ getQuestionsByCourse ERROR:", err);
    return [];
  }
};

/**
 * Normalise a raw DB question into the snapshot shape used by Exam / Attempt.
 *
 * DB shape:
 *   prompt       – question text
 *   options      – string[]   e.g. ["Option A", "Option B", ...]
 *   correctAnswer – string matching one of the option texts
 *   marks        – number
 *
 * Snapshot shape:
 *   questionText – string
 *   options      – [{ label: "A", text: "…" }, …]
 *   correctAnswer – label letter ("A" / "B" / …)
 *   marks, negativeMarks, explanation, isManual
 */
export const normaliseQuestion = (q) => {
  // Options may arrive as string[] or already [{label,text}]
  let normOptions;
  const LABELS = ["A", "B", "C", "D", "E"];

  if (Array.isArray(q.options) && q.options.length) {
    if (typeof q.options[0] === "string") {
      // Convert string[] → [{label, text}]
      normOptions = q.options.map((text, i) => ({
        label: LABELS[i] || String(i + 1),
        text,
      }));
    } else {
      // Already {label, text} objects
      normOptions = q.options.map((o, i) => ({
        label: o.label || LABELS[i] || String(i + 1),
        text: o.text || "",
      }));
    }
  } else {
    normOptions = [];
  }

  // correctAnswer may be the full option text or a label letter.
  // Convert full-text answers to label letters for consistency.
  let correctAnswerLabel = q.correctAnswer || "";
  if (
    correctAnswerLabel.length > 1 && // not already a single letter label
    normOptions.length
  ) {
    const match = normOptions.find(
      (o) => o.text.trim().toLowerCase() === correctAnswerLabel.trim().toLowerCase()
    );
    if (match) correctAnswerLabel = match.label;
  }

  return {
    _id: q._id,
    questionText: q.prompt || q.questionText || q.question || q.text || "",
    options: normOptions,
    correctAnswer: correctAnswerLabel,
    explanation: q.explanation || "",
    marks: q.marks || 1,
    negativeMarks: q.negativeMarks || 0,
    isManual: false,
  };
};

/**
 * Fisher-Yates shuffle, return first n items.
 */
export const randomSelect = (arr, n) => {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const copy = [...arr];
  const limit = Math.min(n, copy.length);
  for (let i = 0; i < limit; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, limit);
};

/**
 * Build the final question pool for an exam.
 * Merges course questions (from quizzes) + admin-supplied manual questions,
 * then randomly selects `required` questions.
 */
export const buildQuestionSet = async (courseId, required, manualQuestions = []) => {
  try {
    console.log("🚀 Building question set | required:", required, "| manual:", manualQuestions.length);

    const rawCourseQuestions = await getQuestionsByCourse(courseId);

    const normalised = rawCourseQuestions.map(normaliseQuestion);

    // Validate & tag manual questions
    const markedManual = manualQuestions.map((q, i) => {
      const LABELS = ["A", "B", "C", "D"];
      // Ensure options have label+text shape
      const opts = (q.options || []).map((o, idx) => ({
        label: o.label || LABELS[idx] || String(idx + 1),
        text: o.text || o,
      }));
      return {
        _id: q._id || new (require("mongoose").Types.ObjectId)(),
        questionText: q.questionText || "",
        options: opts,
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "",
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
        isManual: true,
      };
    });

    const pool = [...normalised, ...markedManual];

    console.log("🧩 Pool size:", pool.length, "| Required:", required);

    if (pool.length < required) {
      return {
        questionSet: [],
        error: `Not enough questions. Required: ${required}, Available: ${pool.length}`,
      };
    }

    const questionSet = randomSelect(pool, required);
    console.log("✅ Question set ready:", questionSet.length);

    return { questionSet, error: null };
  } catch (err) {
    console.error("❌ buildQuestionSet ERROR:", err);
    return { questionSet: [], error: "Failed to build question set" };
  }
};