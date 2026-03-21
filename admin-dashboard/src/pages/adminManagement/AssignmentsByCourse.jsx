import { useEffect, useState } from "react";
import { getCourses } from "../../services/courseService";
import { getAllAssignments } from "../../services/assignmentService";

export default function AssignmentsByCourse() {

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadCourses();
    loadAssignments();
  }, []);

  const loadCourses = async () => {
    const data = await getCourses();
    setCourses(data.courses || data);
  };

  const loadAssignments = async () => {
    const data = await getAllAssignments();
    setAssignments(data.assignments || data);
  };

  const filteredAssignments = selectedCourse
    ? assignments.filter(
        (a) => a.course?._id === selectedCourse
      )
    : [];

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Assignments by Course
      </h1>

      {/* Course Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">

        {courses.map((course) => (
          <div
            key={course._id}
            onClick={() => setSelectedCourse(course._id)}
            className="bg-white shadow rounded-xl p-4 cursor-pointer hover:shadow-lg"
          >
            <h3 className="font-semibold">
              {course.title}
            </h3>

            <p className="text-gray-500 text-sm">
              Click to view assignments
            </p>
          </div>
        ))}

      </div>

      {/* Assignments List */}
      {selectedCourse && (
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            Assignments
          </h2>

          {filteredAssignments.map((a) => (
            <div
              key={a._id}
              className="border-b py-3"
            >
              <h3 className="font-semibold">
                {a.title}
              </h3>

              <p className="text-gray-600">
                {a.description}
              </p>

              <p className="text-sm text-gray-500">
                Due: {a.dueDate?.slice(0, 10)}
              </p>

              <p className="text-sm">
                Marks: {a.totalMarks}
              </p>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}