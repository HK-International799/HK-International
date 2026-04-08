import Course from "../models/Course.js";
import Section from "../models/Section.js";
import User from "../models/User.js";
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
