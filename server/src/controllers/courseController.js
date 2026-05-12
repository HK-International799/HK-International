// import Course from "../models/Course.js";
// import Section from "../models/Section.js";
// import User from "../models/User.js";
// import mongoose from "mongoose";

// /**
//  * 🔹 Utility: Validate ObjectId
//  */
// const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// /**
//  * GET /api/courses
//  */
// export const getCourses = async (req, res) => {
//   try {
//     let query = {};

//     if (req.user.role === "student") {
//       query._id = { $in: req.user.enrolledCourses || [] };
//     }

//     if (req.user.role === "tutor") {
//       query.assignedTutor = req.user._id;
//     }

//     const courses = await Course.find(query)
//       .populate({ path: "sections", populate: { path: "lessons" } })
//       .populate("assignedTutor", "name email")
//       .populate("createdBy", "name email")
//       .select("-__v");

//     res.status(200).json(courses);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error fetching courses", error: err.message });
//   }
// };

// /**
//  * GET /api/courses/:id
//  */
// export const getCourseById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!isValidId(id)) {
//       return res.status(400).json({ message: "Invalid course ID" });
//     }

//     const course = await Course.findById(id)
//       .populate({ path: "sections", populate: { path: "lessons" } })
//       .populate("assignedTutor", "name email")
//       .populate("createdBy", "name email")
//       .select("-__v");

//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     // Student access check
//     if (req.user.role === "student") {
//       const enrolled = (req.user.enrolledCourses || []).some(
//         (c) => c.toString() === id,
//       );
//       if (!enrolled) {
//         return res.status(403).json({ message: "Not enrolled in this course" });
//       }
//     }

//     res.status(200).json(course);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error fetching course", error: err.message });
//   }
// };

// /**
//  * POST /api/courses
//  */
// export const createCourse = async (req, res) => {
//   try {
//     const { title, description, thumbnail, status } = req.body;

//     if (!title) {
//       return res.status(400).json({ message: "Title is required" });
//     }

//     const course = await Course.create({
//       title,
//       description,
//       thumbnail,
//       status: status || "draft",
//       createdBy: req.user._id,
//     });

//     res.status(201).json({
//       message: "Course created successfully",
//       course,
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error creating course", error: err.message });
//   }
// };

// export const createFullCourse = async (req, res) => {
//   try {
//     const { title, description, status, sections } = req.body;

//     const course = await Course.create({
//       title,
//       description,
//       status,
//     });

//     for (const sec of sections) {
//       const section = await Section.create({
//         title: sec.title,
//         courseId: course._id,
//       });

//       course.sections.push(section._id);

//       for (const les of sec.lessons) {
//         const lesson = await Lesson.create({
//           title: les.title,
//           videoUrl: les.videoUrl,
//           sectionId: section._id,
//         });

//         section.lessons.push(lesson._id);

//         if (les.quiz) {
//           const quiz = await Quiz.create({
//             title: les.quiz.title,
//             questions: les.quiz.questions,
//           });

//           lesson.quizId = quiz._id;
//           await lesson.save();
//         }

//         if (les.materials) {
//           lesson.materials = les.materials;
//           await lesson.save();
//         }
//       }

//       await section.save();
//     }

//     await course.save();

//     res.status(201).json(course);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * PUT /api/courses/:id
//  */
// export const updateCourse = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!isValidId(id)) {
//       return res.status(400).json({ message: "Invalid course ID" });
//     }

//     const course = await Course.findById(id);
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     // Tutor authorization check
//     if (
//       req.user.role === "tutor" &&
//       course.assignedTutor?.toString() !== req.user._id.toString()
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to update this course" });
//     }

//     const allowedFields = ["title", "description", "thumbnail", "status"];

//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         course[field] = req.body[field];
//       }
//     });

//     await course.save();

//     res.status(200).json({
//       message: "Course updated successfully",
//       course,
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error updating course", error: err.message });
//   }
// };

// /**
//  * DELETE /api/courses/:id
//  */
// export const deleteCourse = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!isValidId(id)) {
//       return res.status(400).json({ message: "Invalid course ID" });
//     }

//     const course = await Course.findByIdAndDelete(id);

//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     res.status(200).json({ message: "Course deleted successfully" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error deleting course", error: err.message });
//   }
// };

// /**
//  * POST /api/courses/:id/assign-tutor
//  */
// export const assignTutor = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { tutorId } = req.body;

//     if (!isValidId(id) || !isValidId(tutorId)) {
//       return res.status(400).json({ message: "Invalid ID" });
//     }

//     const course = await Course.findById(id);
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     const tutor = await User.findById(tutorId);
//     if (!tutor || tutor.role !== "tutor") {
//       return res.status(400).json({ message: "Invalid tutor" });
//     }

//     // Prevent reassigning same tutor
//     if (course.assignedTutor?.toString() === tutorId) {
//       return res.status(400).json({ message: "Tutor already assigned" });
//     }

//     // Remove old tutor link
//     if (course.assignedTutor) {
//       await User.findByIdAndUpdate(course.assignedTutor, {
//         $pull: { assignedCourses: course._id },
//       });
//     }

//     course.assignedTutor = tutorId;
//     await course.save();

//     await User.findByIdAndUpdate(tutorId, {
//       $addToSet: { assignedCourses: course._id },
//     });

//     res.status(200).json({ message: "Tutor assigned successfully", course });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error assigning tutor", error: err.message });
//   }
// };

// /**
//  * POST /api/courses/:id/sections
//  */
// export const addSection = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, order } = req.body;

//     if (!isValidId(id)) {
//       return res.status(400).json({ message: "Invalid course ID" });
//     }

//     if (!title) {
//       return res.status(400).json({ message: "Section title is required" });
//     }

//     const course = await Course.findById(id);
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     const section = await Section.create({
//       title,
//       courseId: course._id,
//       order: order || 0,
//     });

//     // Prevent duplicates
//     if (!course.sections.includes(section._id)) {
//       course.sections.push(section._id);
//       await course.save();
//     }

//     res.status(201).json({ message: "Section added successfully", section });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error adding section", error: err.message });
//   }
// };

// /**
//  * PUT /api/courses/sections/:sectionId
//  */
// export const updateSection = async (req, res) => {
//   try {
//     const { sectionId } = req.params;

//     if (!isValidId(sectionId)) {
//       return res.status(400).json({ message: "Invalid section ID" });
//     }

//     const section = await Section.findById(sectionId);
//     if (!section) return res.status(404).json({ message: "Section not found" });

//     if (req.body.title) section.title = req.body.title;
//     if (req.body.order !== undefined) section.order = req.body.order;

//     await section.save();

//     res.status(200).json({ message: "Section updated successfully", section });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error updating section", error: err.message });
//   }
// };

// /**
//  * DELETE /api/courses/sections/:sectionId
//  */
// export const deleteSection = async (req, res) => {
//   try {
//     const { sectionId } = req.params;

//     if (!isValidId(sectionId)) {
//       return res.status(400).json({ message: "Invalid section ID" });
//     }

//     const section = await Section.findById(sectionId);
//     if (!section) return res.status(404).json({ message: "Section not found" });

//     await Course.findByIdAndUpdate(section.courseId, {
//       $pull: { sections: section._id },
//     });

//     await section.deleteOne();

//     res.status(200).json({ message: "Section deleted successfully" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error deleting section", error: err.message });
//   }
// };

// /**
//  * POST /api/courses/:id/enroll-student
//  */
// export const enrollStudent = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { id } = req.params;
//     const { studentId } = req.body;

//     if (!isValidId(id) || !isValidId(studentId)) {
//       return res.status(400).json({ message: "Invalid ID" });
//     }

//     const course = await Course.findById(id).session(session);
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     const student = await User.findById(studentId).session(session);
//     if (!student || student.role !== "student") {
//       return res.status(400).json({ message: "Invalid student" });
//     }

//     if (student.enrolledCourses.includes(course._id)) {
//       return res.status(400).json({
//         message: "Student already enrolled",
//       });
//     }

//     await User.findByIdAndUpdate(
//       studentId,
//       { $addToSet: { enrolledCourses: course._id } },
//       { session },
//     );

//     await Course.findByIdAndUpdate(
//       id,
//       { $addToSet: { enrolledStudents: student._id } },
//       { session },
//     );

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       message: "Student enrolled successfully",
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();

//     res.status(500).json({
//       message: "Enrollment failed",
//       error: err.message,
//     });
//   }
// };







import Course from "../models/Course.js";
import Section from "../models/Section.js";
import User from "../models/User.js";
import Chapter from "../models/Chapter.js";
import ChapterProgress from "../models/ChapterProgress.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import apiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";

/**
 * 🔹 Utility: Validate ObjectId
 */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/courses
 */
export const getCourses = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "student") {
      query._id = { $in: req.user.enrolledCourses || [] };
    }

    if (req.user.role === "tutor") {
      query.assignedTutor = req.user._id;
    }

    const courses = await Course.find(query)
      .populate({ path: "sections", populate: { path: "lessons" } })
      .populate("assignedTutor", "name email")
      .populate("createdBy", "name email")
      .select("-__v");

    res.status(200).json(courses);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching courses", error: err.message });
  }
};

/**
 * GET /api/courses/:id
 */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(id)
      .populate({ path: "sections", populate: { path: "lessons" } })
      .populate("assignedTutor", "name email")
      .populate("createdBy", "name email")
      .select("-__v");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Student access check
    if (req.user.role === "student") {
      const enrolled = (req.user.enrolledCourses || []).some(
        (c) => c.toString() === id,
      );
      if (!enrolled) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }
    }

    res.status(200).json(course);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching course", error: err.message });
  }
};

/**
 * POST /api/courses
 */
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const course = await Course.create({
      title,
      description,
      thumbnail,
      status: status || "draft",
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating course", error: err.message });
  }
};

export const createFullCourse = async (req, res) => {
  try {
    const { title, description, status, sections } = req.body;

    const course = await Course.create({
      title,
      description,
      status,
    });

    for (const sec of sections) {
      const section = await Section.create({
        title: sec.title,
        courseId: course._id,
      });

      course.sections.push(section._id);

      for (const les of sec.lessons) {
        const lesson = await Lesson.create({
          title: les.title,
          videoUrl: les.videoUrl,
          sectionId: section._id,
        });

        section.lessons.push(lesson._id);

        if (les.quiz) {
          const quiz = await Quiz.create({
            title: les.quiz.title,
            questions: les.quiz.questions,
          });

          lesson.quizId = quiz._id;
          await lesson.save();
        }

        if (les.materials) {
          lesson.materials = les.materials;
          await lesson.save();
        }
      }

      await section.save();
    }

    await course.save();

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/courses/:id
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Tutor authorization check
    if (
      req.user.role === "tutor" &&
      course.assignedTutor?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    const allowedFields = ["title", "description", "thumbnail", "status"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating course", error: err.message });
  }
};

/**
 * DELETE /api/courses/:id
 */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting course", error: err.message });
  }
};

/**
 * POST /api/courses/:id/assign-tutor
 */
export const assignTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const { tutorId } = req.body;

    if (!isValidId(id) || !isValidId(tutorId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== "tutor") {
      return res.status(400).json({ message: "Invalid tutor" });
    }

    // Prevent reassigning same tutor
    if (course.assignedTutor?.toString() === tutorId) {
      return res.status(400).json({ message: "Tutor already assigned" });
    }

    // Remove old tutor link
    if (course.assignedTutor) {
      await User.findByIdAndUpdate(course.assignedTutor, {
        $pull: { assignedCourses: course._id },
      });
    }

    course.assignedTutor = tutorId;
    await course.save();

    await User.findByIdAndUpdate(tutorId, {
      $addToSet: { assignedCourses: course._id },
    });

    res.status(200).json({ message: "Tutor assigned successfully", course });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error assigning tutor", error: err.message });
  }
};

/**
 * POST /api/courses/:id/sections
 */
export const addSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    if (!title) {
      return res.status(400).json({ message: "Section title is required" });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const section = await Section.create({
      title,
      courseId: course._id,
      order: order || 0,
    });

    // Prevent duplicates
    if (!course.sections.includes(section._id)) {
      course.sections.push(section._id);
      await course.save();
    }

    res.status(201).json({ message: "Section added successfully", section });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding section", error: err.message });
  }
};

/**
 * PUT /api/courses/sections/:sectionId
 */
export const updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!isValidId(sectionId)) {
      return res.status(400).json({ message: "Invalid section ID" });
    }

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    if (req.body.title) section.title = req.body.title;
    if (req.body.order !== undefined) section.order = req.body.order;

    await section.save();

    res.status(200).json({ message: "Section updated successfully", section });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating section", error: err.message });
  }
};

/**
 * DELETE /api/courses/sections/:sectionId
 */
export const deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!isValidId(sectionId)) {
      return res.status(400).json({ message: "Invalid section ID" });
    }

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    await Course.findByIdAndUpdate(section.courseId, {
      $pull: { sections: section._id },
    });

    await section.deleteOne();

    res.status(200).json({ message: "Section deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting section", error: err.message });
  }
};

/**
 * POST /api/courses/:id/enroll-student
 */
export const enrollStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!isValidId(id) || !isValidId(studentId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const course = await Course.findById(id).session(session);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const student = await User.findById(studentId).session(session);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    if (student.enrolledCourses.includes(course._id)) {
      return res.status(400).json({
        message: "Student already enrolled",
      });
    }

    await User.findByIdAndUpdate(
      studentId,
      { $addToSet: { enrolledCourses: course._id } },
      { session },
    );

    await Course.findByIdAndUpdate(
      id,
      { $addToSet: { enrolledStudents: student._id } },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Student enrolled successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: "Enrollment failed",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Admin — Enrollments & Progress
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/courses/:id/enrollments-progress
 * Admin: Returns all enrolled students with their chapter progress.
 *
 * Response shape:
 * {
 *   course: { _id, title, status },
 *   totalChapters: Number,
 *   totalEnrolled: Number,
 *   averageProgress: Number,          // 0-100
 *   students: [
 *     {
 *       _id, name, email, avatar,
 *       enrolledAt,                   // from User.createdAt (approximation — no separate enrollment date stored)
 *       completedCount, remainingCount, progressPercent,
 *       quizCompletedCount, status,   // "not_started" | "in_progress" | "completed"
 *       chapters: [
 *         {
 *           _id, title, order, hasQuiz,
 *           completed: Boolean,
 *           score: Number|null,
 *           totalMarks: Number|null,
 *           percentage: Number|null,
 *           grade: String|null,
 *           completedAt: Date|null,   // chapterProgress.updatedAt used as proxy
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export const getCourseEnrollmentsProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid course ID");
  }

  // 1. Fetch course with enrolled students (name + email only)
  const course = await Course.findById(id)
    .populate("enrolledStudents", "name email avatar createdAt")
    .select("title status enrolledStudents");

  if (!course) throw new ApiError(404, "Course not found");

  // 2. Fetch all chapters for this course (sorted)
  const chapters = await Chapter.find({ courseId: id })
    .select("title order quizId")
    .sort({ order: 1 });

  const totalChapters = chapters.length;
  const chaptersWithQuiz = chapters.filter((c) => c.quizId).length;

  // 3. Fetch ALL ChapterProgress docs for this course in one query (avoid N+1)
  const allProgress = await ChapterProgress.find({ courseId: id });

  // Build a lookup: studentId → progressDoc
  const progressMap = {};
  allProgress.forEach((p) => {
    progressMap[p.studentId.toString()] = p;
  });

  // 4. Build per-student progress
  const students = (course.enrolledStudents || []).map((student) => {
    const sid = student._id.toString();
    const prog = progressMap[sid] || null;

    const completedSet = new Set(
      (prog?.completedChapters || []).map((c) => c.toString())
    );

    // Build per-chapter detail
    const chapterDetails = chapters.map((ch) => {
      const chId = ch._id.toString();
      const completed = completedSet.has(chId);
      const result = prog?.chapterResults?.get(chId) || null;

      return {
        _id: ch._id,
        title: ch.title,
        order: ch.order,
        hasQuiz: !!ch.quizId,
        completed,
        score: result?.score ?? null,
        totalMarks: result?.totalMarks ?? null,
        percentage: result?.percentage ?? null,
        grade: result?.grade ?? null,
        completedAt: completed && prog?.updatedAt ? prog.updatedAt : null,
      };
    });

    const completedCount = completedSet.size;
    const remainingCount = Math.max(0, chaptersWithQuiz - completedCount);

    // Progress % based on chapters-with-quiz (those are the gatekeepable ones)
    const progressPercent =
      chaptersWithQuiz > 0
        ? Math.round((completedCount / chaptersWithQuiz) * 100)
        : totalChapters > 0
          ? 0
          : 100;

    const quizCompletedCount = chapterDetails.filter(
      (c) => c.completed && c.score !== null
    ).length;

    let status = "not_started";
    if (completedCount > 0 && progressPercent >= 100) status = "completed";
    else if (completedCount > 0) status = "in_progress";

    return {
      _id: student._id,
      name: student.name,
      email: student.email,
      avatar: student.avatar || "",
      enrolledAt: student.createdAt,
      completedCount,
      remainingCount,
      progressPercent,
      quizCompletedCount,
      status,
      chapters: chapterDetails,
    };
  });

  // 5. Course-level analytics
  const totalEnrolled = students.length;
  const averageProgress =
    totalEnrolled > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.progressPercent, 0) /
            totalEnrolled
        )
      : 0;

  return apiResponse(res, 200, "Enrollments fetched successfully", {
    course: { _id: course._id, title: course.title, status: course.status },
    totalChapters,
    chaptersWithQuiz,
    totalEnrolled,
    averageProgress,
    students,
  });
});

/**
 * DELETE /api/courses/:id/enrollment/:studentId
 * Admin: Revoke a student's enrollment from a course.
 *
 * - Removes course from User.enrolledCourses
 * - Removes student from Course.enrolledStudents
 * - Does NOT delete QuizAttempts or ChapterProgress (preserves data integrity)
 */
export const revokeEnrollment = asyncHandler(async (req, res) => {
  const { id, studentId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    throw new ApiError(400, "Invalid ID");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [course, student] = await Promise.all([
      Course.findById(id).session(session),
      User.findById(studentId).session(session),
    ]);

    if (!course) throw new ApiError(404, "Course not found");
    if (!student) throw new ApiError(404, "Student not found");

    const isEnrolled = course.enrolledStudents.some(
      (s) => s.toString() === studentId
    );
    if (!isEnrolled) {
      throw new ApiError(400, "Student is not enrolled in this course");
    }

    await Course.findByIdAndUpdate(
      id,
      { $pull: { enrolledStudents: student._id } },
      { session }
    );

    await User.findByIdAndUpdate(
      studentId,
      { $pull: { enrolledCourses: course._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return apiResponse(res, 200, "Enrollment revoked successfully");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});
