import { courses } from "../../mock/studentData";
import { Link } from "react-router-dom";

export default function MyCourses() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">My Courses</h1>

      <div className="grid md:grid-cols-3 gap-6">

        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow">

            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-40 w-full object-cover"
            />

            <div className="p-4">

              <h3 className="font-semibold">{course.title}</h3>

              <p className="text-sm text-gray-500">
                {course.instructor}
              </p>

              <Link
                to={`/student/course/${course.id}`}
                className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Continue
              </Link>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}