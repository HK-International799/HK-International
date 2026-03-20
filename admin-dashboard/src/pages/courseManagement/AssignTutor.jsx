import { useState } from "react";
import { assignTutor } from "../../services/courseService";
import AdminLayout from "../../components/layout/AdminLayout";

const AssignTutor = () => {
  const [form, setForm] = useState({
    courseId: "",
    tutorId: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await assignTutor(form.courseId, form.tutorId);
    alert("Tutor Assigned");
  };

  return (
    <AdminLayout>
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white shadow p-6 rounded-xl">
        <h1 className="text-xl font-bold mb-4">Assign Tutor</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Course ID"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setForm({ ...form, courseId: e.target.value })
            }
          />

          <input
            placeholder="Tutor ID"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setForm({ ...form, tutorId: e.target.value })
            }
          />

          <button className="bg-purple-600 text-white px-4 py-2 rounded">
            Assign
          </button>
        </form>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AssignTutor;