import { useParams } from "react-router-dom";
import { lessons } from "../../mock/studentData";

export default function CoursePlayer() {
  const { id } = useParams();
  const courseLessons = lessons[id] || [];

  return (
    <div className="grid md:grid-cols-4 min-h-screen">

      {/* Video */}

      <div className="md:col-span-3 p-6">

        <iframe
          width="100%"
          height="500"
          src={courseLessons[0]?.video}
          title="lesson"
          allowFullScreen
          className="rounded-xl"
        ></iframe>

        <h2 className="text-2xl font-semibold mt-4">
          {courseLessons[0]?.title}
        </h2>

      </div>

      {/* Lesson List */}

      <div className="border-l p-6 bg-white">

        <h3 className="font-semibold mb-4">Lessons</h3>

        {courseLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="p-3 border rounded-lg mb-3 cursor-pointer hover:bg-gray-100"
          >
            {lesson.title}
          </div>
        ))}

      </div>

    </div>
  );
}