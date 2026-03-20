import { useState } from "react";
import { enrollStudent } from "../../services/adminService";
import AdminLayout from "../../components/layout/AdminLayout";

const EnrollStudent = () => {
  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await enrollStudent(form);
    alert("Student Enrolled Successfully");
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white shadow rounded-2xl p-6">
          <h1 className="text-xl font-bold mb-4">Enroll Student</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border p-2 rounded"
              placeholder="Student ID"
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Course ID"
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            />

            <button className="bg-green-600 text-white px-4 py-2 rounded">
              Enroll
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EnrollStudent;
