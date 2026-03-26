
import Lesson from "../models/Lesson.js";
import Section from "../models/Section.js";

// ─── Create lesson ────────────────────────────────────────────────────────────
export const createLesson = async (req, res) => {
  try {
    const { title, description, videoUrl, sectionId, order, duration } = req.body;

    if (!title || !sectionId) {
      return res.status(400).json({ message: "Title and sectionId are required" });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const lesson = await Lesson.create({
      title,
      description,
      videoUrl,
      sectionId,
      order: order ?? section.lessons.length, // auto-order if not provided
      duration,
    });

    // Add lesson reference to parent section
    await Section.findByIdAndUpdate(sectionId, {
      $push: { lessons: lesson._id },
    });

    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Error creating lesson", error: err.message });
  }
};

// ─── Get single lesson ────────────────────────────────────────────────────────
export const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("sectionId", "title courseId");

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lesson", error: err.message });
  }
};

// ─── Update lesson ────────────────────────────────────────────────────────────
export const updateLesson = async (req, res) => {
  try {
    const { title, description, videoUrl, order, duration, materials } = req.body;

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title, description, videoUrl, order, duration, materials },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Error updating lesson", error: err.message });
  }
};

// ─── Delete lesson ────────────────────────────────────────────────────────────
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Remove reference from parent section BEFORE deleting the lesson
    await Section.findByIdAndUpdate(lesson.sectionId, {
      $pull: { lessons: lesson._id },
    });

    await lesson.deleteOne();

    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting lesson", error: err.message });
  }
};