import Progress from "../models/Progress.js";
import Course from "../models/Course.js";
import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import crypto from "crypto";

/**
 * Helper: count total lessons in a course
 */
const getTotalLessons = async (courseId) => {
  const course = await Course.findById(courseId).populate({
    path: "sections",
    populate: { path: "lessons", select: "_id" },
  });
  if (!course) return 0;
  return course.sections.reduce(
    (sum, section) => sum + (section.lessons?.length || 0),
    0
  );
};

/**
 * POST /api/progress/complete-lesson
 * Body: { courseId, lessonId }
 * Marks a lesson as completed for the current student
 */
export const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const studentId = req.user._id;

    if (!courseId || !lessonId) {
      return res
        .status(400)
        .json({ message: "courseId and lessonId are required" });
    }

    // Verify enrollment
    const student = await User.findById(studentId).select("enrolledCourses");
    const enrolled = student.enrolledCourses?.some(
      (id) => id.toString() === courseId.toString()
    );
    if (!enrolled) {
      return res
        .status(403)
        .json({ message: "Not enrolled in this course" });
    }

    // Verify lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Upsert progress
    let progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      progress = await Progress.create({
        studentId,
        courseId,
        completedLessons: [lessonId],
        lastAccessedLesson: lessonId,
        lastAccessedAt: new Date(),
      });
    } else {
      // Add lesson if not already completed
      const alreadyCompleted = progress.completedLessons.some(
        (id) => id.toString() === lessonId.toString()
      );
      if (!alreadyCompleted) {
        progress.completedLessons.push(lessonId);
      }
      progress.lastAccessedLesson = lessonId;
      progress.lastAccessedAt = new Date();
    }

    // Recalculate progress percentage
    const totalLessons = await getTotalLessons(courseId);
    progress.progressPercent =
      totalLessons > 0
        ? Math.round(
            (progress.completedLessons.length / totalLessons) * 100
          )
        : 0;

    // Check if course completed
    if (progress.progressPercent >= 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();

      // Auto-generate certificate
      const existingCert = await Certificate.findOne({ studentId, courseId });
      if (!existingCert) {
        const certNumber = `HK-${Date.now()}-${crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;
        await Certificate.create({
          studentId,
          courseId,
          certificateNumber: certNumber,
        });
      }
    }

    await progress.save();

    res.status(200).json({
      message: "Lesson completed",
      progress: {
        completedLessons: progress.completedLessons.length,
        totalLessons,
        progressPercent: progress.progressPercent,
        isCompleted: progress.isCompleted,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error completing lesson",
      error: err.message,
    });
  }
};

/**
 * GET /api/progress/:courseId
 * Get progress for a specific course
 */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const progress = await Progress.findOne({ studentId, courseId }).populate(
      "lastAccessedLesson",
      "title"
    );

    const totalLessons = await getTotalLessons(courseId);

    if (!progress) {
      return res.json({
        completedLessons: [],
        totalLessons,
        progressPercent: 0,
        isCompleted: false,
        lastAccessedLesson: null,
      });
    }

    res.json({
      completedLessons: progress.completedLessons,
      totalLessons,
      progressPercent: progress.progressPercent,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
      lastAccessedLesson: progress.lastAccessedLesson,
      lastAccessedAt: progress.lastAccessedAt,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching progress",
      error: err.message,
    });
  }
};

/**
 * GET /api/progress
 * Get progress for all enrolled courses
 */
export const getAllProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

    const progressRecords = await Progress.find({ studentId })
      .populate("courseId", "title thumbnail")
      .populate("lastAccessedLesson", "title")
      .sort({ lastAccessedAt: -1 });

    res.json(progressRecords);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching progress",
      error: err.message,
    });
  }
};
