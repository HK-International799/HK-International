import Assignment from "../models/Assignment.js";
import Question from "../models/Question.js";

export const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, questions, totalMarks } = req.body;
    const assignment = new Assignment({
      title, description, courseId, dueDate, totalMarks, createdBy: req.user.id
    });
    await assignment.save();

    if (questions?.length) {
      const questionDocs = await Question.insertMany(questions);
      assignment.questions = questionDocs.map(q => q._id);
      await assignment.save();
    }

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Error creating assignment", error: err.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.query;
    const assignments = await Assignment.find({ courseId }).populate("questions");
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assignments", error: err.message });
  }
};
