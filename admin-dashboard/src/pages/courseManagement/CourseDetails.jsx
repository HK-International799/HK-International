import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, deleteSection } from "../../services/courseService";
import AdminLayout from "../../components/layout/AdminLayout";

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    const data = await getCourseById(id);
    setCourse(data);
  };

  const handleDeleteSection = async (sectionId) => {
    await deleteSection(sectionId);
    loadCourse();
  };

  if (!course) return <p>Loading...</p>;

  return (
    <AdminLayout>
    <div className="p-6">
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="text-gray-600">{course.description}</p>

      <h2 className="mt-6 font-semibold">Sections</h2>

      <div className="space-y-3 mt-3">
        {course.sections?.map((sec) => (
          <div
            key={sec._id}
            className="bg-white shadow p-3 rounded flex justify-between"
          >
            <span>{sec.title}</span>

            <button
              onClick={() => handleDeleteSection(sec._id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
    </AdminLayout>
  );
};

export default CourseDetails;