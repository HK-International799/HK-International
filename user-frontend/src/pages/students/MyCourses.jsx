
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  PlayCircle,
  ChevronRight,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Loader2,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { getEnrolledCourses } from "../../services/studentService";
import MainLayout from "../../components/layout/MainLayout";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getEnrolledCourses();
        setCourses(data);
      } catch (err) {
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "completed" && course.isCompleted) ||
      (filterStatus === "in-progress" && !course.isCompleted && course.progress > 0) ||
      (filterStatus === "not-started" && (course.progress || 0) === 0);
    return matchesSearch && matchesFilter;
  });

  const totalProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length
        )
      : 0;

  const completedCount = courses.filter((c) => c.isCompleted).length;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-orange-500 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                My Courses
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
                {completedCount > 0 && ` · ${completedCount} completed`}
              </p>
            </div>

            {/* Stats Pills */}
            {!loading && courses.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {totalProgress}% Overall
                  </span>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {completedCount}/{courses.length} Done
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search & Filters */}
          {!loading && courses.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
                />
              </div>
              <div className="flex gap-2">
                {["all", "in-progress", "completed", "not-started"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      filterStatus === status
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status === "in-progress"
                      ? "In Progress"
                      : status === "completed"
                      ? "Completed"
                      : "Not Started"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <Skeleton className="h-44 rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, i) => {
              const progress = course.progress ?? 0;
              const totalLessons = course.totalLessons ?? 0;
              const completedLessons = course.completedLessonsCount ?? 0;
              const progressColor =
                progress >= 100
                  ? "bg-green-500"
                  : progress >= 50
                  ? "bg-blue-500"
                  : progress > 0
                  ? "bg-orange-500"
                  : "bg-gray-300";

              return (
                <Link
                  to={`/student/course/${course._id}`}
                  key={course._id}
                  className="block group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-100 transition-all h-full flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-44 bg-gradient-to-br from-indigo-500 to-orange-400 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-14 h-14 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Badge */}
                      <div className="absolute top-3 right-3">
                        {course.isCompleted ? (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500 text-white shadow-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        ) : progress > 0 ? (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500 text-white shadow-lg">
                            {progress}%
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-700/70 text-white shadow-lg">
                            New
                          </span>
                        )}
                      </div>

                      {/* Bottom info */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/90 text-xs">
                          <PlayCircle className="w-4 h-4" />
                          <span>
                            {completedLessons}/{totalLessons} lessons
                          </span>
                        </div>
                        {course.lastAccessedAt && (
                          <div className="flex items-center gap-1 text-white/70 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(course.lastAccessedAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 text-base leading-snug">
                        {course.title}
                      </h3>

                      {course.description && (
                        <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 flex-1">
                          {course.description}
                        </p>
                      )}

                      {/* Sections count */}
                      <div className="text-xs text-gray-400 mt-2">
                        {course.sections?.length || 0} section
                        {(course.sections?.length || 0) !== 1 ? "s" : ""}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500 font-medium">Progress</span>
                          <span className="font-bold text-gray-700">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                            className={`h-full rounded-full ${progressColor}`}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                        <span className="text-sm font-medium text-orange-600 group-hover:text-orange-700 transition">
                          {course.isCompleted
                            ? "Review Course"
                            : progress > 0
                            ? "Continue Learning"
                            : "Start Course"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg mb-1">
              {searchQuery || filterStatus !== "all"
                ? "No courses match your filters"
                : "No courses yet"}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "You haven't been enrolled in any courses yet. Contact your admin or browse available courses."}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 rounded-xl hover:shadow-lg transition"
              >
                Browse Courses
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
