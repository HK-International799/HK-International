import Lesson from "../models/Lesson.js";
import Section from "../models/Section.js";

export const createLesson = async (req, res) => {
  try {
    const { title, description, videoUrl, sectionId } = req.body;

    const lesson = await Lesson.create({
      title,
      description,
      videoUrl,
      sectionId,
    });

    await Section.findByIdAndUpdate(sectionId, {
      $push: { lessons: lesson._id },
    });

    res.status(201).json(lesson);

  } catch (err) {
    res.status(500).json({ message: "Error creating lesson" });
  }
};

export const getLesson = async (req, res) => {
  try {

    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(lesson);

  } catch (err) {
    res.status(500).json({ message: "Error fetching lesson" });
  }
};

export const deleteLesson = async (req, res) => {
  try {

    const lesson = await Lesson.findByIdAndDelete(req.params.id);

    res.json({ message: "Lesson deleted", lesson });

  } catch (err) {
    res.status(500).json({ message: "Error deleting lesson" });
  }
};