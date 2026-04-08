import Lesson from "../models/Lesson.js";
import Section from "../models/Section.js";
import Quiz from "../models/Quiz.js";

/* Create Lesson */
export const createLesson = async (req, res) => {
  try {
    const { title, description, videoUrl, sectionId, order, duration } =
      req.body;

    if (!title || !sectionId) {
      return res.status(400).json({ message: "Title and sectionId required" });
    }

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const lesson = await Lesson.create({
      title,
      description,
      videoUrl,
      sectionId,
      order: order ?? section.lessons.length,
      duration,
    });

    section.lessons.push(lesson._id);
    await section.save();

    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Get Lesson */
export const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate("quizId")
      .populate("sectionId");

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Update Lesson */
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Add Material */
export const addMaterial = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res
        .status(404)
        .json({ message: "Lesson not found" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "File required" });
    }

    const material = {
      title: req.body.title || "Material",
      fileUrl: `/uploads/${req.file.filename}`,
    };

    lesson.materials.push(material);

    await lesson.save();

    res.json({
      message: "Material uploaded",
      lesson,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* Assign Quiz to Lesson */
export const assignQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    lesson.quizId = quizId;
    await lesson.save();

    res.json({ message: "Quiz assigned", lesson });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Delete Lesson */
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    await Section.findByIdAndUpdate(lesson.sectionId, {
      $pull: { lessons: lesson._id },
    });

    await lesson.deleteOne();

    res.json({ message: "Lesson deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
