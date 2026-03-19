// CoursePlayer.jsx
import { useCourseProgress } from "../../contexts/CourseProgressContext";

// LessonPlayer.jsx
const LessonPlayer = ({ lesson, onComplete }) => (
  <div className="mt-2 border rounded-lg p-4">
    <h3 className="font-semibold">{lesson.title}</h3>
    <div className="aspect-video mt-2">
      <iframe
        src={lesson.videoUrl}
        title={lesson.title}
        className="w-full h-full rounded"
        allowFullScreen
      />
    </div>
    <button
      onClick={onComplete}
      className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Mark Complete
    </button>
  </div>
);

export default LessonPlayer;