// import Chapter from "../models/Chapter.js";
// import Course from "../models/Course.js";
// import Quiz from "../models/Quiz.js";
// import Question from "../models/Question.js";
// import ChapterProgress from "../models/ChapterProgress.js";
// import mongoose from "mongoose";

// import cloudinary from "../config/cloudinary.js";
// import streamifier from "streamifier";

// const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// /* ================================================================
//    GET /api/chapters/course/:courseId
//    Returns all chapters for a course, sorted by order.
//    Students: also returns their progress so the UI can decide
//              which chapters are locked/unlocked.
// ================================================================ */
// export const getChaptersByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     if (!isValidId(courseId)) {
//       return res.status(400).json({ message: "Invalid course ID" });
//     }

//     const chapters = await Chapter.find({ courseId })
//       .populate("quizId")
//       .sort({ order: 1 });

//     // For students, attach progress info
//     let completedChapters = [];
//     if (req.user.role === "student") {
//       const progress = await ChapterProgress.findOne({
//         studentId: req.user._id,
//         courseId,
//       });
//       completedChapters =
//         progress?.completedChapters?.map((c) => c.toString()) || [];
//     }

//     res.json({ chapters, completedChapters });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error fetching chapters", error: err.message });
//   }
// };

// /* ================================================================
//    POST /api/chapters
//    Admin/Tutor: Create a new chapter inside a course.
//    Body: { courseId, title, description, order }
// ================================================================ */
// export const createChapter = async (req, res) => {
//   try {
//     const { courseId, title, description, order } = req.body;

//     if (!courseId || !title) {
//       return res
//         .status(400)
//         .json({ message: "courseId and title are required" });
//     }

//     if (!isValidId(courseId)) {
//       return res.status(400).json({ message: "Invalid course ID" });
//     }

//     const course = await Course.findById(courseId);
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     // Auto-assign order if not provided (append to end)
//     let chapterOrder = order;
//     if (chapterOrder === undefined || chapterOrder === null) {
//       const count = await Chapter.countDocuments({ courseId });
//       chapterOrder = count + 1;
//     }

//     const chapter = await Chapter.create({
//       courseId,
//       title,
//       description: description || "",
//       order: chapterOrder,
//     });

//     res.status(201).json({ message: "Chapter created successfully", chapter });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error creating chapter", error: err.message });
//   }
// };

// /* ================================================================
//    PUT /api/chapters/:id
//    Admin/Tutor: Update chapter title, description, or order.
// ================================================================ */
// export const updateChapter = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!isValidId(id)) {
//       return res.status(400).json({ message: "Invalid chapter ID" });
//     }

//     const chapter = await Chapter.findById(id);
//     if (!chapter) return res.status(404).json({ message: "Chapter not found" });

//     const { title, description, order } = req.body;
//     if (title !== undefined) chapter.title = title;
//     if (description !== undefined) chapter.description = description;
//     if (order !== undefined) chapter.order = order;

//     await chapter.save();

//     res.json({ message: "Chapter updated successfully", chapter });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error updating chapter", error: err.message });
//   }
// };

// /* ================================================================
//    DELETE /api/chapters/:id
//    Admin: Remove a chapter and its linked quiz/questions.
// ================================================================ */
// export const deleteChapter = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!isValidId(id)) {
//       return res.status(400).json({ message: "Invalid chapter ID" });
//     }

//     const chapter = await Chapter.findById(id);
//     if (!chapter) return res.status(404).json({ message: "Chapter not found" });

//     // Remove linked quiz and its questions
//     if (chapter.quizId) {
//       const quiz = await Quiz.findById(chapter.quizId);
//       if (quiz) {
//         await Question.deleteMany({ _id: { $in: quiz.questions } });
//         await quiz.deleteOne();
//       }
//     }

//     await chapter.deleteOne();

//     res.json({ message: "Chapter deleted successfully" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error deleting chapter", error: err.message });
//   }
// };

// /* ================================================================
//    POST /api/chapters/:id/upload-document
//    Admin/Tutor: Upload a document file to a chapter.
//    Uses multer (disk storage) — file available as req.file
// ================================================================ */

// export const uploadChapterDocument = async (req, res) => {
//   try {
//     console.log("FILE:", req.file);

//     if (!req.file) {
//       return res.status(400).json({
//         message: "No file uploaded",
//       });
//     }

//     const { id } = req.params;

//     if (!isValidId(id)) {
//       return res.status(400).json({
//         message: "Invalid chapter ID",
//       });
//     }

//     const chapter = await Chapter.findById(id);

//     if (!chapter) {
//       return res.status(404).json({
//         message: "Chapter not found",
//       });
//     }

//     const uploadFromBuffer = (buffer) =>
//       new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           {
//             folder: "lms-documents",
//             resource_type: "raw",
//           },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result);
//           },
//         );

//         streamifier.createReadStream(buffer).pipe(stream);
//       });

//     const result = await uploadFromBuffer(req.file.buffer);

//     chapter.documentUrl = result.secure_url;
//     chapter.documentName = req.file.originalname;

//     await chapter.save();

//     res.json({
//       message: "Document uploaded successfully",
//       documentUrl: result.secure_url,
//       chapter,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       message: "Error uploading document",
//       error: err.message,
//     });
//   }
// };

// /* ================================================================
//    POST /api/chapters/:id/create-quiz
//    Admin/Tutor: Create a quiz and attach it to a chapter.
//    Body: { title, questions: [{ prompt, options[], correctAnswer, marks }] }
//    Questions are optional at creation time — admin can add them later.
// ================================================================ */
// export const createChapterQuiz = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, questions = [] } = req.body;

//     if (!isValidId(id)) {
//       return res.status(400).json({ message: "Invalid chapter ID" });
//     }

//     const chapter = await Chapter.findById(id).populate("quizId");
//     if (!chapter) return res.status(404).json({ message: "Chapter not found" });

//     // If a quiz already exists, return it so the admin can add questions
//     if (chapter.quizId) {
//       return res.json({
//         message: "Quiz already exists for this chapter",
//         quiz: chapter.quizId,
//       });
//     }

//     // Create the quiz
//     const quiz = await Quiz.create({
//       title: title || `${chapter.title} – Quiz`,
//       courseId: chapter.courseId,
//       lessonId: null, // not lesson-based
//     });

//     // If initial questions were passed, create them
//     let totalMarks = 0;
//     for (const q of questions) {
//       const question = await Question.create({
//         type: "mcq",
//         prompt: q.prompt,
//         options: q.options || [],
//         correctAnswer: q.correctAnswer || "",
//         marks: q.marks || 1,
//       });
//       quiz.questions.push(question._id);
//       totalMarks += Number(q.marks || 1);
//     }

//     quiz.totalMarks = totalMarks;
//     await quiz.save();

//     // Link quiz to chapter
//     chapter.quizId = quiz._id;
//     await chapter.save();

//     // Return populated quiz
//     const populatedQuiz = await Quiz.findById(quiz._id).populate("questions");

//     res.status(201).json({
//       message: "Quiz created and linked to chapter",
//       quiz: populatedQuiz,
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error creating quiz", error: err.message });
//   }
// };

// /* ================================================================
//    POST /api/chapters/:id/quiz/add-question
//    Admin/Tutor: Add a single MCQ question to the chapter's quiz.
//    Body: { prompt, options[], correctAnswer, marks }
// ================================================================ */
// export const addQuizQuestion = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { prompt, options, correctAnswer, marks } = req.body;

//     if (!prompt || !correctAnswer) {
//       return res
//         .status(400)
//         .json({ message: "prompt and correctAnswer are required" });
//     }

//     const chapter = await Chapter.findById(id);
//     if (!chapter) return res.status(404).json({ message: "Chapter not found" });

//     if (!chapter.quizId) {
//       return res.status(400).json({
//         message: "No quiz attached to this chapter. Create one first.",
//       });
//     }

//     const quiz = await Quiz.findById(chapter.quizId);
//     if (!quiz) return res.status(404).json({ message: "Quiz not found" });

//     const question = await Question.create({
//       type: "mcq",
//       prompt,
//       options: options || [],
//       correctAnswer,
//       marks: marks || 1,
//     });

//     quiz.questions.push(question._id);
//     quiz.totalMarks += Number(marks || 1);
//     await quiz.save();

//     res.status(201).json({
//       message: "Question added to quiz",
//       question,
//       quiz,
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error adding question", error: err.message });
//   }
// };

// /* ================================================================
//    GET /api/chapters/:id/quiz
//    Get the quiz (with questions) for a chapter.
// ================================================================ */
// export const getChapterQuiz = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const chapter = await Chapter.findById(id);
//     if (!chapter) return res.status(404).json({ message: "Chapter not found" });

//     if (!chapter.quizId) {
//       return res.json({ quiz: null });
//     }

//     const quiz = await Quiz.findById(chapter.quizId).populate("questions");
//     res.json({ quiz });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error fetching quiz", error: err.message });
//   }
// };

// /* ================================================================
//    POST /api/chapters/:id/submit-quiz
//    Student: Submit quiz answers for a chapter.
//    Body: { answers: [{ questionId, selectedOption }] }
//    After a correct attempt (or any attempt), the chapter is marked
//    complete and the next chapter is unlocked.
// ================================================================ */
// export const submitChapterQuiz = async (req, res) => {
//   try {
//     const { id } = req.params; // chapter id
//     const { answers } = req.body;
//     const studentId = req.user._id;

//     if (!isValidId(id)) {
//       return res.status(400).json({ message: "Invalid chapter ID" });
//     }

//     const chapter = await Chapter.findById(id);
//     if (!chapter) return res.status(404).json({ message: "Chapter not found" });

//     if (!chapter.quizId) {
//       return res
//         .status(400)
//         .json({ message: "This chapter has no quiz to submit" });
//     }

//     const quiz = await Quiz.findById(chapter.quizId).populate("questions");
//     if (!quiz) return res.status(404).json({ message: "Quiz not found" });

//     /* =========================
//        🎯 CALCULATE SCORE
//     ========================= */
//     let score = 0;

//     const gradedAnswers = (answers || []).map((ans) => {
//       const question = quiz.questions.find(
//         (q) => q._id.toString() === ans.questionId
//       );

//       const correct =
//         question && question.correctAnswer === ans.selectedOption;

//       if (correct) {
//         score += question.marks || 1;
//       }

//       return { ...ans, correct };
//     });

//     const totalMarks =
//       quiz.totalMarks ||
//       quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

//     const percentage = (score / totalMarks) * 100;

//     /* =========================
//        ✅ PASS CONDITION (50%)
//     ========================= */
//     const passed = percentage >= 50;

//     /* =========================
//        🔓 UNLOCK ONLY IF PASSED
//     ========================= */
//     if (passed) {
//       await ChapterProgress.findOneAndUpdate(
//         { studentId, courseId: chapter.courseId },
//         {
//           $addToSet: { completedChapters: chapter._id },
//           $setOnInsert: { studentId, courseId: chapter.courseId },
//         },
//         { upsert: true, new: true }
//       );
//     }

//     res.json({
//       message: "Quiz submitted successfully",
//       score,
//       totalMarks,
//       percentage,
//       passed,
//       gradedAnswers,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error submitting quiz",
//       error: err.message,
//     });
//   }
// };

// /* ================================================================
//    GET /api/chapters/progress/:courseId
//    Student: Get their progress for a course (which chapters completed)
// ================================================================ */
// export const getStudentProgress = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const studentId = req.user._id;

//     const progress = await ChapterProgress.findOne({ studentId, courseId });

//     res.json({
//       completedChapters: progress?.completedChapters || [],
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error fetching progress", error: err.message });
//   }
// };



import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import ChapterProgress from "../models/ChapterProgress.js";
import mongoose from "mongoose";

import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ================================================================
   GET /api/chapters/course/:courseId
   Returns all chapters for a course, sorted by order.
   Students: also returns their progress so the UI can decide
             which chapters are locked/unlocked.
================================================================ */
export const getChaptersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidId(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const chapters = await Chapter.find({ courseId })
      .populate("quizId")
      .sort({ order: 1 });

    // For students, attach progress info
    let completedChapters = [];
    let chapterResults = {};

    if (req.user.role === "student") {
      const progress = await ChapterProgress.findOne({
        studentId: req.user._id,
        courseId,
      });

      completedChapters =
        progress?.completedChapters?.map((c) => c.toString()) || [];

      // Attach last quiz result for each chapter that has one saved
      // ChapterProgress.chapterResults is a Map<chapterId, { score, totalMarks, percentage, passed, grade }>
      if (progress?.chapterResults) {
        for (const [chapterId, result] of progress.chapterResults.entries()) {
          chapterResults[chapterId] = result;
        }
      }
    }

    res.json({ chapters, completedChapters, chapterResults });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching chapters", error: err.message });
  }
};

/* ================================================================
   POST /api/chapters
   Admin/Tutor: Create a new chapter inside a course.
   Body: { courseId, title, description, order }
================================================================ */
export const createChapter = async (req, res) => {
  try {
    const { courseId, title, description, order } = req.body;

    if (!courseId || !title) {
      return res
        .status(400)
        .json({ message: "courseId and title are required" });
    }

    if (!isValidId(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Auto-assign order if not provided (append to end)
    let chapterOrder = order;
    if (chapterOrder === undefined || chapterOrder === null) {
      const count = await Chapter.countDocuments({ courseId });
      chapterOrder = count + 1;
    }

    const chapter = await Chapter.create({
      courseId,
      title,
      description: description || "",
      order: chapterOrder,
    });

    res.status(201).json({ message: "Chapter created successfully", chapter });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating chapter", error: err.message });
  }
};

/* ================================================================
   PUT /api/chapters/:id
   Admin/Tutor: Update chapter title, description, or order.
================================================================ */
export const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const { title, description, order } = req.body;
    if (title !== undefined) chapter.title = title;
    if (description !== undefined) chapter.description = description;
    if (order !== undefined) chapter.order = order;

    await chapter.save();

    res.json({ message: "Chapter updated successfully", chapter });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating chapter", error: err.message });
  }
};

/* ================================================================
   DELETE /api/chapters/:id
   Admin: Remove a chapter and its linked quiz/questions.
================================================================ */
export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    // Remove linked quiz and its questions
    if (chapter.quizId) {
      const quiz = await Quiz.findById(chapter.quizId);
      if (quiz) {
        await Question.deleteMany({ _id: { $in: quiz.questions } });
        await quiz.deleteOne();
      }
    }

    await chapter.deleteOne();

    res.json({ message: "Chapter deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting chapter", error: err.message });
  }
};

/* ================================================================
   POST /api/chapters/:id/upload-document
   Admin/Tutor: Upload a document file to a chapter.
   Uses multer (disk storage) — file available as req.file
================================================================ */
export const uploadChapterDocument = async (req, res) => {
  try {
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const uploadFromBuffer = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "lms-documents", resource_type: "raw" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const result = await uploadFromBuffer(req.file.buffer);

    chapter.documentUrl = result.secure_url;
    chapter.documentName = req.file.originalname;
    await chapter.save();

    res.json({
      message: "Document uploaded successfully",
      documentUrl: result.secure_url,
      chapter,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error uploading document", error: err.message });
  }
};

/* ================================================================
   POST /api/chapters/:id/create-quiz
   Admin/Tutor: Create a quiz and attach it to a chapter.
   Body: { title, questions: [{ prompt, options[], correctAnswer, marks }] }
================================================================ */
export const createChapterQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, questions = [] } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }

    const chapter = await Chapter.findById(id).populate("quizId");
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (chapter.quizId) {
      return res.json({
        message: "Quiz already exists for this chapter",
        quiz: chapter.quizId,
      });
    }

    const quiz = await Quiz.create({
      title: title || `${chapter.title} – Quiz`,
      courseId: chapter.courseId,
      lessonId: null,
    });

    let totalMarks = 0;
    for (const q of questions) {
      const question = await Question.create({
        type: "mcq",
        prompt: q.prompt,
        options: q.options || [],
        correctAnswer: q.correctAnswer || "",
        marks: q.marks || 1,
      });
      quiz.questions.push(question._id);
      totalMarks += Number(q.marks || 1);
    }

    quiz.totalMarks = totalMarks;
    await quiz.save();

    chapter.quizId = quiz._id;
    await chapter.save();

    const populatedQuiz = await Quiz.findById(quiz._id).populate("questions");

    res.status(201).json({
      message: "Quiz created and linked to chapter",
      quiz: populatedQuiz,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating quiz", error: err.message });
  }
};

/* ================================================================
   POST /api/chapters/:id/quiz/add-question
   Admin/Tutor: Add a single MCQ question to the chapter's quiz.
   Body: { prompt, options[], correctAnswer, marks }
================================================================ */
export const addQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, options, correctAnswer, marks } = req.body;

    if (!prompt || !correctAnswer) {
      return res
        .status(400)
        .json({ message: "prompt and correctAnswer are required" });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (!chapter.quizId) {
      return res.status(400).json({
        message: "No quiz attached to this chapter. Create one first.",
      });
    }

    const quiz = await Quiz.findById(chapter.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const question = await Question.create({
      type: "mcq",
      prompt,
      options: options || [],
      correctAnswer,
      marks: marks || 1,
    });

    quiz.questions.push(question._id);
    quiz.totalMarks += Number(marks || 1);
    await quiz.save();

    res.status(201).json({ message: "Question added to quiz", question, quiz });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding question", error: err.message });
  }
};

/* ================================================================
   GET /api/chapters/:id/quiz
   Get the quiz (with questions) for a chapter.
================================================================ */
export const getChapterQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (!chapter.quizId) {
      return res.json({ quiz: null });
    }

    const quiz = await Quiz.findById(chapter.quizId).populate("questions");
    res.json({ quiz });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching quiz", error: err.message });
  }
};

/* ================================================================
   POST /api/chapters/:id/submit-quiz
   Student: Submit quiz answers for a chapter.
   Body: { answers: [{ questionId, selectedOption }] }

   ✅ Scoring tiers (IOSH Level 3):
      - 70%+  → Distinction  (fully meets IOSH Level 3 criteria)
      - 60%-69% → Pass       (passed, but below IOSH Level 3 standard)
      - <60%  → Below Pass

   ✅ Next chapter is ALWAYS unlocked after any quiz attempt.
   ✅ Saves last result to ChapterProgress.chapterResults map.
================================================================ */
export const submitChapterQuiz = async (req, res) => {
  try {
    const { id } = req.params; // chapter id
    const { answers } = req.body;
    const studentId = req.user._id;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid chapter ID" });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    if (!chapter.quizId) {
      return res
        .status(400)
        .json({ message: "This chapter has no quiz to submit" });
    }

    const quiz = await Quiz.findById(chapter.quizId).populate("questions");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    /* ── Calculate score ─────────────────────────────────────── */
    let score = 0;

    for (const ans of answers || []) {
      const question = quiz.questions.find(
        (q) => q._id.toString() === ans.questionId
      );
      if (question && question.correctAnswer === ans.selectedOption) {
        score += question.marks || 1;
      }
    }

    const totalMarks =
      quiz.totalMarks ||
      quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const percentage = totalMarks > 0
      ? Math.round((score / totalMarks) * 100)
      : 0;

    /* ── Determine grade tier ────────────────────────────────── */
    // grade: "distinction" | "pass" | "below_pass"
    let grade;
    if (percentage >= 70) {
      grade = "distinction";
    } else if (percentage >= 60) {
      grade = "pass";
    } else {
      grade = "below_pass";
    }

    // "passed" for backward-compat: true if any attempt was made (always unlock)
    // We use grade to drive UI messaging instead.
    const passed = true; // always unlock next chapter after any attempt

    /* ── Persist result + always mark chapter complete ───────── */
    const resultSnapshot = { score, totalMarks, percentage, passed, grade };

    await ChapterProgress.findOneAndUpdate(
      { studentId, courseId: chapter.courseId },
      {
        $addToSet: { completedChapters: chapter._id }, // always unlock
        $set: {
          [`chapterResults.${chapter._id}`]: resultSnapshot,
        },
        $setOnInsert: { studentId, courseId: chapter.courseId },
      },
      { upsert: true, new: true }
    );

    /* ── Return result to frontend ───────────────────────────── */
    const messages = {
      distinction: "Excellent! You've met the IOSH Level 3 standard.",
      pass: "Quiz complete! Next chapter unlocked. Score 70%+ to meet IOSH Level 3 criteria.",
      below_pass: "Quiz complete! Next chapter unlocked. Aim for 60%+ to pass and 70%+ for IOSH Level 3.",
    };

    res.json({
      message: messages[grade],
      score,
      totalMarks,
      percentage,
      passed,
      grade,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error submitting quiz",
      error: err.message,
    });
  }
};

/* ================================================================
   GET /api/chapters/progress/:courseId
   Student: Get their progress for a course (which chapters completed)
================================================================ */
export const getStudentProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const progress = await ChapterProgress.findOne({ studentId, courseId });

    res.json({
      completedChapters: progress?.completedChapters || [],
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching progress", error: err.message });
  }
};