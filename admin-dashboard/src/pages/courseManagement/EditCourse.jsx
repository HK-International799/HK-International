import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, updateCourse } from "../../services/courseService";
import AdminLayout from "../../components/layout/AdminLayout";

const EditCourse = () => {
  const { id } = useParams();
  const [form, setForm] = useState({ title: "", description: "" });

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    const data = await getCourseById(id);
    setForm(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCourse(id, form);
    alert("Updated");
  };

  return (
    <AdminLayout>
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white shadow p-6 rounded-xl">
        <h1 className="text-xl font-bold mb-4">Edit Course</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.title}
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <textarea
            value={form.description}
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Update
          </button>
        </form>
      </div>
    </div>
    </AdminLayout>
  );
};

export default EditCourse;