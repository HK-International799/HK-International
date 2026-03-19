import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCourseById } from "../../services/courseService";

export default function CoursePlayer() {

  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {

    const loadCourse = async () => {
      const data = await getCourseById(id);
      setCourse(data);
    };

    loadCourse();

  }, [id]);

  if (!course) return <div>Loading...</div>;

  return (
    <div className="flex">

      {/* Lesson List */}
      <div className="w-1/4 border-r p-4">

        <h2 className="font-bold mb-4">
          Lessons
        </h2>

        {course.sections?.map((section) => (

          <div key={section._id} className="mb-4">

            <h3 className="font-semibold">
              {section.title}
            </h3>

            {section.lessons?.map((lesson) => (

              <div
                key={lesson._id}
                className="ml-3 text-sm text-gray-600"
              >
                {lesson.title}
              </div>

            ))}

          </div>

        ))}

      </div>

      {/* Video Player */}
      <div className="flex-1 p-6">

        <h1 className="text-2xl font-bold mb-4">
          {course.title}
        </h1>

        <p>{course.description}</p>

      </div>

    </div>
  );
}