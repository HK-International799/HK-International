import Course from "../models/Course.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({
        path: "sections",
        populate: { path: "lessons" }
      })
      .select("-__v");

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: "sections",
        populate: { path: "lessons" }
      })
      .select("-__v");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);

  } catch (err) {
    res.status(500).json({ message: "Error fetching course" });
  }
};