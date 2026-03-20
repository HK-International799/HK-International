import { useEffect, useState } from "react";
import { getCourses, deleteCourse } from "../../services/courseService";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await getCourses();
    setCourses(data);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this course?")) return;
    await deleteCourse(id);
    loadCourses();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between mb-5">
          <h1 className="text-2xl font-bold">Courses</h1>

          <button
            onClick={() => navigate("/admin/create-course")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Create Course
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course._id} className="bg-white shadow rounded-xl p-4">
              <h2 className="font-semibold text-lg">{course.title}</h2>
              <p className="text-sm text-gray-500">{course.description}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => navigate(`/admin/courses/${course._id}`)}
                  className="text-blue-600"
                >
                  View
                </button>

                <button
                  onClick={() => navigate(`/admin/edit-course/${course._id}`)}
                  className="text-green-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(course._id)}
                  className="text-red-500"
                >
                  Delete
                </button>

                <button
                  onClick={() =>
                    navigate(`/admin/courses/${course._id}/sections`)
                  }
                  className="text-purple-600"
                >
                  Sections
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Courses;
