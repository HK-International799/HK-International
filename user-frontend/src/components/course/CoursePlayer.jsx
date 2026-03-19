// CoursePlayer.jsx
import LessonPlayer from "./LessonPlayer";
import { useCourseProgress } from "../../contexts/CourseProgressContext";

const CoursePlayer = ({ course }) => {
  const { markLessonComplete } = useCourseProgress();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{course.title}</h1>
      {course.sections.map((section) => (
        <div key={section._id} className="mt-4">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          {section.lessons.map((lesson) => (
            <LessonPlayer
              key={lesson._id}
              lesson={lesson}
              onComplete={() => markLessonComplete(course._id, lesson._id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default CoursePlayer;


