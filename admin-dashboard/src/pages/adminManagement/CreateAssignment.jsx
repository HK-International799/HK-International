
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

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data.courses || data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (e) => {
    setForm({
      ...form,
      file: e.target.files[0],
    });
  };

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

      await createNewAssignment(formData);

      alert("Assignment Created");

      navigate("/admin/assignments");

    } catch (error) {
      console.error(error);
      alert("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Create Assignment
      </h1>

      <div className="bg-white shadow rounded-xl p-6">

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="title"
            placeholder="Assignment Title"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          />

          <select
            name="course"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          >
            <option value="">Select Course</option>

            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}

          </select>

          <input
            type="date"
            name="dueDate"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          />

          <input
            name="totalMarks"
            placeholder="Total Marks"
            className="w-full border p-3 rounded"
            onChange={handleChange}
            required
          />

          {/* File Upload */}
          <div>
            <label className="block mb-2 font-medium">
              Upload Document
            </label>

            <input
              type="file"
              onChange={handleFile}
              className="w-full"
            />
          </div>

          <button
            className="bg-blue-600 text-white px-6 py-3 rounded"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Assignment"}
          </button>

        </form>
      </div>
    </div>
  );
}