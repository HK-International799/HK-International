// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { getCourseById } from "../../services/courseService";

// export default function CoursePlayer() {

//   const { id } = useParams();
//   const [course, setCourse] = useState(null);

//   useEffect(() => {

//     const loadCourse = async () => {
//       const data = await getCourseById(id);
//       setCourse(data);
//     };

//     loadCourse();

//   }, [id]);

//   if (!course) return <div>Loading...</div>;

//   return (
//     <div className="flex">

//       {/* Lesson List */}
//       <div className="w-1/4 border-r p-4">

//         <h2 className="font-bold mb-4">
//           Lessons
//         </h2>

//         {course.sections?.map((section) => (

//           <div key={section._id} className="mb-4">

//             <h3 className="font-semibold">
//               {section.title}
//             </h3>

//             {section.lessons?.map((lesson) => (

//               <div
//                 key={lesson._id}
//                 className="ml-3 text-sm text-gray-600"
//               >
//                 {lesson.title}
//               </div>

//             ))}

//           </div>

//         ))}

//       </div>

//       {/* Video Player */}
//       <div className="flex-1 p-6">

//         <h1 className="text-2xl font-bold mb-4">
//           {course.title}
//         </h1>

//         <p>{course.description}</p>

//       </div>

//     </div>
//   );
// }


import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  FileText,
  Download,
  Clock,
  Lock,
  BookOpen,
  Loader2,
  Circle,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import { getCourseById } from "../../services/courseService";
import {
  getCourseProgress,
  completeLesson,
} from "../../services/studentService";
import { useAuth } from "../../contexts/AuthContext";
import ReactPlayer from "react-player";

export default function CoursePlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);

  // Load course + progress
  useEffect(() => {
    const load = async () => {
      try {
        const [courseData, progressData] = await Promise.all([
          getCourseById(id),
          getCourseProgress(id),
        ]);
        setCourse(courseData);
        setProgress(progressData);

        // Expand all sections by default
        const expanded = {};
        courseData.sections?.forEach((s) => {
          expanded[s._id] = true;
        });
        setExpandedSections(expanded);

        // Set initial active lesson
        if (progressData.lastAccessedLesson) {
          // Find the lesson object
          for (const section of courseData.sections || []) {
            const found = section.lessons?.find(
              (l) =>
                l._id === progressData.lastAccessedLesson._id ||
                l._id === progressData.lastAccessedLesson
            );
            if (found) {
              setActiveLesson(found);
              break;
            }
          }
        }

        // If no last accessed, use first lesson
        if (!progressData.lastAccessedLesson) {
          const firstSection = courseData.sections?.[0];
          const firstLesson = firstSection?.lessons?.[0];
          if (firstLesson) setActiveLesson(firstLesson);
        }
      } catch (err) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const completedLessonIds = new Set(
    (progress?.completedLessons || []).map((id) =>
      typeof id === "string" ? id : id?.toString?.()
    )
  );

  const isLessonCompleted = (lessonId) => completedLessonIds.has(lessonId);

  const totalLessons = course?.sections?.reduce(
    (sum, s) => sum + (s.lessons?.length || 0),
    0
  ) || 0;

  const handleMarkComplete = async () => {
    if (!activeLesson || markingComplete) return;
    setMarkingComplete(true);
    try {
      const result = await completeLesson(id, activeLesson._id);
      setProgress((prev) => ({
        ...prev,
        completedLessons: [
          ...(prev?.completedLessons || []),
          activeLesson._id,
        ],
        progressPercent: result.progress.progressPercent,
        isCompleted: result.progress.isCompleted,
      }));

      // Auto-advance to next lesson
      const allLessons = course.sections?.flatMap((s) => s.lessons || []) || [];
      const currentIdx = allLessons.findIndex(
        (l) => l._id === activeLesson._id
      );
      if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
        const nextLesson = allLessons[currentIdx + 1];
        if (nextLesson && !isLessonCompleted(nextLesson._id)) {
          setTimeout(() => setActiveLesson(nextLesson), 500);
        }
      }
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading course...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <Link
            to="/student/courses"
            className="mt-4 inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = progress?.progressPercent || 0;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Link
            to="/student/courses"
            className="text-gray-400 hover:text-white transition flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-5 w-px bg-gray-700" />
          <h1 className="text-white font-semibold text-sm sm:text-base truncate max-w-sm">
            {course?.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full rounded-full ${
                  progressPercent >= 100 ? "bg-green-500" : "bg-orange-500"
                }`}
              />
            </div>
            <span className="text-sm text-gray-400 font-medium">
              {progressPercent}%
            </span>
          </div>

          {/* Sidebar toggle for mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Video Area */}
          <div className="bg-black aspect-video w-full max-h-[70vh] relative">
            {activeLesson?.videoUrl ? (
              <ReactPlayer
                url={activeLesson.videoUrl}
                controls
                width="100%"
                height="100%"
                playing={false}
                config={{
                  file: { attributes: { controlsList: "nodownload" } },
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                <PlayCircle className="w-16 h-16 text-gray-600" />
                <p className="text-gray-400 text-sm">
                  {activeLesson
                    ? "No video available for this lesson"
                    : "Select a lesson to start"}
                </p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          {activeLesson && (
            <div className="p-6 bg-gray-900">
              <div className="max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-2">
                      {activeLesson.title}
                    </h2>
                    {activeLesson.description && (
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {activeLesson.description}
                      </p>
                    )}
                  </div>

                  {/* Mark Complete Button */}
                  {!isLessonCompleted(activeLesson._id) ? (
                    <button
                      onClick={handleMarkComplete}
                      disabled={markingComplete}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-60 flex-shrink-0"
                    >
                      {markingComplete ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {markingComplete ? "Saving..." : "Mark Complete"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/20 text-green-400 font-medium text-sm flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </div>
                  )}
                </div>

                {/* Materials */}
                {activeLesson.materials?.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Lesson Materials
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeLesson.materials.map((mat, i) => (
                        <a
                          key={i}
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {mat.title || `Material ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Sidebar - Lesson List */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-80 lg:w-96 bg-gray-900 border-l border-gray-800 overflow-y-auto flex-shrink-0 fixed lg:relative right-0 top-0 h-full z-30 lg:z-0 pt-[57px] lg:pt-0"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    Course Content
                  </span>
                  <span className="text-xs text-gray-500 font-normal">
                    {completedLessonIds.size}/{totalLessons}
                  </span>
                </h3>
              </div>

              {/* Sections */}
              <div className="pb-6">
                {course?.sections?.map((section, sIdx) => {
                  const sectionLessons = section.lessons || [];
                  const completedInSection = sectionLessons.filter((l) =>
                    isLessonCompleted(l._id)
                  ).length;
                  const isExpanded = expandedSections[section._id];

                  return (
                    <div key={section._id} className="border-b border-gray-800/50">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section._id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">
                            Section {sIdx + 1}
                          </p>
                          <p className="text-sm text-gray-200 font-medium truncate">
                            {section.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {completedInSection}/{sectionLessons.length} completed
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
                            isExpanded ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                      </button>

                      {/* Lessons */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {sectionLessons.map((lesson, lIdx) => {
                              const isActive =
                                activeLesson?._id === lesson._id;
                              const isCompleted = isLessonCompleted(lesson._id);

                              return (
                                <button
                                  key={lesson._id}
                                  onClick={() => setActiveLesson(lesson)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                                    isActive
                                      ? "bg-orange-500/10 border-l-2 border-orange-500"
                                      : "hover:bg-gray-800/50 border-l-2 border-transparent"
                                  }`}
                                >
                                  {/* Status Icon */}
                                  <div className="flex-shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : isActive ? (
                                      <PlayCircle className="w-5 h-5 text-orange-500" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-gray-600" />
                                    )}
                                  </div>

                                  {/* Lesson Info */}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm truncate ${
                                        isActive
                                          ? "text-orange-400 font-medium"
                                          : isCompleted
                                          ? "text-gray-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      {lIdx + 1}. {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {lesson.duration > 0 && (
                                        <span className="text-xs text-gray-600 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatDuration(lesson.duration)}
                                        </span>
                                      )}
                                      {lesson.videoUrl && (
                                        <span className="text-xs text-gray-600 flex items-center gap-1">
                                          <PlayCircle className="w-3 h-3" />
                                          Video
                                        </span>
                                      )}
                                      {lesson.materials?.length > 0 && (
                                        <span className="text-xs text-gray-600 flex items-center gap-1">
                                          <FileText className="w-3 h-3" />
                                          {lesson.materials.length}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Course Complete Celebration */}
      <AnimatePresence>
        {progress?.isCompleted && progressPercent >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-green-500/30 flex items-center gap-3 z-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">
              Course Complete! Certificate earned.
            </span>
            <Link
              to="/student/certificates"
              className="ml-2 text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
            >
              View Certificate
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
