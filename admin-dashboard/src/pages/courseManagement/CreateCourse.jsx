import { useState } from "react";
import { createCourse } from "../../services/courseService";
import AdminLayout from "../../components/layout/AdminLayout";

const CreateCourse = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCourse(form);
    alert("Course Created");
  };

  return (
    <AdminLayout>
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white shadow p-6 rounded-xl">
        <h1 className="text-xl font-bold mb-4">Create Course</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Title"
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Create
          </button>
        </form>
      </div>
    </div>
    </AdminLayout>
  );
};

export default CreateCourse;