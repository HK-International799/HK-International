import { useEffect, useState } from "react";
import { getCourses } from "../../services/courseService";
import { Link } from "react-router-dom";

export default function MyCourses() {

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        My Courses
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {courses.map((course) => (

          <Link
            key={course._id}
            to={`/student/course/${course._id}`}
            className="border rounded-lg shadow hover:shadow-lg transition"
          >

            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-40 object-cover rounded-t"
            />

            <div className="p-4">

              <h2 className="font-semibold text-lg">
                {course.title}
              </h2>

              <p className="text-sm text-gray-600">
                {course.description}
              </p>

            </div>

          </Link>

        ))}

      </div>

    </div>
  );
}