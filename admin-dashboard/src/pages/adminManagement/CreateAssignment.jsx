import { useState, useEffect } from "react";
import { createNewAssignment } from "../../services/assignmentService";
import { getCourses } from "../../services/courseService";
import { useNavigate } from "react-router-dom";

export default function CreateAssignment() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
    totalMarks: "",
    file: null,
  });

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await getCourses();
    setCourses(data.courses || data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  /**
   * ➕ Add Question
   */
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "text",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: "",
      },
    ]);
  };

  /**
   * ✏️ Update Question
   */
  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  /**
   * ✏️ Update Option
   */
  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  /**
   * ❌ Remove Question
   */
  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  /**
   * 🚀 Submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("courseId", form.course);
      formData.append("dueDate", form.dueDate);
      formData.append("totalMarks", form.totalMarks);
      formData.append("file", form.file);

      // 🔥 IMPORTANT: send questions as JSON string
      formData.append("questions", JSON.stringify(questions));

      await createNewAssignment(formData);

      alert("Assignment Created 🚀");
      navigate("/admin/assignments");

    } catch (err) {
      console.error(err);
      alert("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Assignment</h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* BASIC FIELDS */}
          <input name="title" placeholder="Title" className="w-full border p-3 rounded" onChange={handleChange} />

          <textarea name="description" placeholder="Description" className="w-full border p-3 rounded" onChange={handleChange} />

          <select name="course" className="w-full border p-3 rounded" onChange={handleChange}>
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>

          <input type="date" name="dueDate" className="w-full border p-3 rounded" onChange={handleChange} />

          <input name="totalMarks" placeholder="Total Marks" className="w-full border p-3 rounded" onChange={handleChange} />

          {/* FILE */}
          <input type="file" onChange={handleFile} />

          {/* QUESTIONS SECTION */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Questions</h2>

            {questions.map((q, index) => (
              <div key={index} className="border p-4 rounded mb-4 space-y-3">

                {/* Type */}
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(index, "type", e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="text">Text</option>
                  <option value="mcq">MCQ</option>
                </select>

                {/* Question */}
                <input
                  placeholder="Question"
                  className="w-full border p-2 rounded"
                  value={q.question}
                  onChange={(e) => updateQuestion(index, "question", e.target.value)}
                />

                {/* MCQ OPTIONS */}
                {q.type === "mcq" && (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <input
                        key={i}
                        placeholder={`Option ${i + 1}`}
                        className="w-full border p-2 rounded"
                        value={opt}
                        onChange={(e) => updateOption(index, i, e.target.value)}
                      />
                    ))}

                    <input
                      placeholder="Correct Answer"
                      className="w-full border p-2 rounded"
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                    />
                  </div>
                )}

                {/* Marks */}
                <input
                  placeholder="Marks"
                  className="border p-2 rounded"
                  value={q.marks}
                  onChange={(e) => updateQuestion(index, "marks", e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}

            {/* ADD BUTTON */}
            <button
              type="button"
              onClick={addQuestion}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add Question
            </button>
          </div>

          <button className="bg-blue-600 text-white px-6 py-3 rounded w-full">
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
}