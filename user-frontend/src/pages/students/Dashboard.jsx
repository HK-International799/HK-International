
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Award,
  FileText,
  TrendingUp,
  Calendar,
  PlayCircle,
  ChevronRight,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  GraduationCap,
  BarChart2,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getDashboard } from "../../services/studentService";
import MainLayout from "../../components/layout/MainLayout";

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <Skeleton className="h-10 w-10 mb-4" />
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-4 w-28" />
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
  >
    <div className={`inline-flex p-3 rounded-xl ${gradient}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-3xl font-bold text-gray-900 mt-4">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </motion.div>
);

// ─── Course Card ──────────────────────────────────────────────────────────────
const CourseCard = ({ course, index }) => {
  const progress = course.progress ?? 0;
  const progressColor =
    progress >= 75 ? "bg-green-500" : progress >= 40 ? "bg-blue-500" : "bg-orange-500";

  return (
    <Link to={`/student/course/${course._id}`} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        whileHover={{ y: -4 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-100 transition-all"
      >
        <div className="relative h-36 bg-linear-to-r from-indigo-500 to-orange-400 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-white/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              course.status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {course.status === "completed" ? "Completed" : "In Progress"}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 text-sm">
            {course.title}
          </h3>
          {course.instructor && (
            <p className="text-xs text-gray-400 mt-0.5">{course.instructor}</p>
          )}

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-semibold text-gray-700">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={`h-full rounded-full ${progressColor}`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>
                {course.completedLessons ?? 0}/{course.totalLessons ?? "—"} lessons
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-12 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
    <p className="text-sm text-gray-400 max-w-xs mb-4">{description}</p>
    {action && (
      <Link
        to={action.to}
        className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition"
      >
        <PlusCircle className="w-4 h-4" />
        {action.label}
      </Link>
    )}
  </motion.div>
);

// ─── Assignment Row ───────────────────────────────────────────────────────────
const AssignmentRow = ({ assignment, index }) => {
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const now = new Date();
  const daysLeft = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className={`p-2 rounded-lg flex-shrink-0 ${
        isOverdue ? "bg-red-100" : isUrgent ? "bg-orange-100" : "bg-blue-100"
      }`}>
        <Calendar className={`w-4 h-4 ${
          isOverdue ? "text-red-600" : isUrgent ? "text-orange-600" : "text-blue-600"
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{assignment.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{assignment.courseName ?? "—"}</p>
      </div>
      <div className="text-right flex-shrink-0">
        {isOverdue ? (
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Overdue</span>
        ) : isUrgent ? (
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{daysLeft}d left</span>
        ) : daysLeft !== null ? (
          <span className="text-xs text-gray-500">{daysLeft} days left</span>
        ) : null}
        {dueDate && (
          <p className="text-xs text-gray-400 mt-0.5">
            {dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Submission Row ───────────────────────────────────────────────────────────
const SubmissionRow = ({ submission, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06 }}
    className="flex items-center gap-3 py-3"
  >
    <div className={`p-2 rounded-lg flex-shrink-0 ${
      submission.status === "graded" ? "bg-green-100" : "bg-blue-100"
    }`}>
      {submission.status === "graded" ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <Clock className="w-4 h-4 text-blue-600" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{submission.title ?? "Assignment"}</p>
      <p className="text-xs text-gray-400">{submission.courseName ?? "—"}</p>
    </div>
    <div className="text-right flex-shrink-0">
      {submission.status === "graded" && submission.grade != null ? (
        <span className="font-bold text-green-600 text-sm">{submission.grade}%</span>
      ) : (
        <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full">Pending</span>
      )}
    </div>
  </motion.div>
);

// ─── Progress Ring ────────────────────────────────────────────────────────────
const ProgressRing = ({ value, max, label, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
          {pct}%
        </span>
      </div>
      <p className="text-xs text-gray-500 text-center leading-tight">{label}</p>
    </div>
  );
};

// ─── Quick Action ─────────────────────────────────────────────────────────────
const QuickAction = ({ to, icon: Icon, iconBg, label, sub }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group"
  >
    <div className={`p-2 rounded-lg ${iconBg}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900 text-sm">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
  </Link>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getDashboard();
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const studentName = data?.student?.name ?? user?.name ?? "Student";
  const summary = data?.summary ?? {};
  const enrolledCourses = data?.enrolledCourses ?? [];
  const upcomingAssignments = data?.upcomingAssignments ?? [];
  const recentSubmissions = data?.recentSubmissions ?? [];

  const submissionRate =
    summary.totalAssignmentsCount > 0
      ? Math.round((summary.submittedAssignmentsCount / summary.totalAssignmentsCount) * 100)
      : 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pb-12">
        {/* ── Hero Banner ── */}
        <div className="bg-linear-to-r from-indigo-600 via-indigo-600 to-orange-500 pt-10 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30 flex-shrink-0">
                  {studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-indigo-200 text-sm font-medium">Welcome back</p>
                  <h1 className="text-2xl font-bold text-white">
                    {studentName.split(" ")[0]} 👋
                  </h1>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    Keep pushing — you're making great progress!
                  </p>
                </div>
              </div>

              {/* Progress rings */}
              {!loading && summary.totalAssignmentsCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4"
                >
                  <ProgressRing
                    value={summary.submittedAssignmentsCount}
                    max={summary.totalAssignmentsCount}
                    label="Submitted"
                    color="#f97316"
                  />
                  <ProgressRing
                    value={summary.gradedAssignmentsCount}
                    max={summary.totalAssignmentsCount}
                    label="Graded"
                    color="#a3e635"
                  />
                  <ProgressRing
                    value={summary.pendingAssignmentsCount}
                    max={summary.totalAssignmentsCount}
                    label="Pending"
                    color="#facc15"
                  />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-10">
          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  icon={BookOpen}
                  label="Enrolled Courses"
                  value={summary.enrolledCoursesCount ?? 0}
                  gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                  delay={0}
                />
                <StatCard
                  icon={FileText}
                  label="Total Assignments"
                  value={summary.totalAssignmentsCount ?? 0}
                  gradient="bg-gradient-to-br from-violet-500 to-violet-600"
                  delay={0.06}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Submitted"
                  value={summary.submittedAssignmentsCount ?? 0}
                  gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                  delay={0.12}
                />
                <StatCard
                  icon={AlertCircle}
                  label="Pending"
                  value={summary.pendingAssignmentsCount ?? 0}
                  gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                  delay={0.18}
                />
              </>
            )}
          </div>

          {/* ── Error Banner ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Left / Main Column ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Continue Learning */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    My Courses
                  </h2>
                  <Link
                    to="/student/courses"
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {loading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[0, 1].map((i) => (
                      <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        <Skeleton className="h-36 rounded-none" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-2 w-full mt-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : enrolledCourses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {enrolledCourses.slice(0, 4).map((course, i) => (
                      <CourseCard key={course._id ?? i} course={course} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <EmptyState
                      icon={BookOpen}
                      title="No courses yet"
                      description="You haven't enrolled in any courses. Start exploring and enroll in your first course today!"
                      action={{ to: "/courses", label: "Browse Courses" }}
                    />
                  </div>
                )}
              </section>

              {/* Upcoming Assignments */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Upcoming Assignments
                  </h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                          <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : upcomingAssignments.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingAssignments.map((a, i) => (
                        <AssignmentRow key={a._id ?? i} assignment={a} index={i} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title="No upcoming assignments"
                      description="You're all caught up! Assignments from your enrolled courses will appear here."
                    />
                  )}
                </div>
              </section>

              {/* Recent Submissions */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-green-500" />
                    Recent Submissions
                  </h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  {loading ? (
                    <div className="divide-y">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3 py-3">
                          <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                          <Skeleton className="h-5 w-12" />
                        </div>
                      ))}
                    </div>
                  ) : recentSubmissions.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {recentSubmissions.map((s, i) => (
                        <SubmissionRow key={s._id ?? i} submission={s} index={i} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      title="No submissions yet"
                      description="Your submitted assignments and their grades will show up here."
                    />
                  )}
                </div>
              </section>
            </div>

            {/* ── Right Column ── */}
            <div className="space-y-6">

              {/* Assignment Progress Summary */}
              {!loading && summary.totalAssignmentsCount > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                >
                  <h2 className="text-base font-bold text-gray-900 mb-4">
                    Assignment Overview
                  </h2>
                  <div className="space-y-3">
                    {[
                      { label: "Submitted", value: summary.submittedAssignmentsCount, total: summary.totalAssignmentsCount, color: "bg-green-500" },
                      { label: "Graded", value: summary.gradedAssignmentsCount, total: summary.totalAssignmentsCount, color: "bg-indigo-500" },
                      { label: "Pending", value: summary.pendingAssignmentsCount, total: summary.totalAssignmentsCount, color: "bg-orange-400" },
                    ].map(({ label, value, total, color }) => {
                      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-semibold text-gray-800">{value} <span className="text-gray-400 font-normal">/ {total}</span></span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, delay: 0.4 }}
                              className={`h-full rounded-full ${color}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Quick Actions */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h2 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h2>
                <div className="space-y-3">
                  <QuickAction
                    to="/courses"
                    icon={BookOpen}
                    iconBg="bg-blue-100 text-blue-600"
                    label="Browse Courses"
                    sub="Explore new programs"
                  />
                  <QuickAction
                    to="/student/certificates"
                    icon={Award}
                    iconBg="bg-yellow-100 text-yellow-600"
                    label="My Certificates"
                    sub="View your achievements"
                  />
                  <QuickAction
                    to="/student/profile"
                    icon={Target}
                    iconBg="bg-green-100 text-green-600"
                    label="My Profile"
                    sub="Update your details"
                  />
                  <QuickAction
                    to="/student/change-password"
                    icon={TrendingUp}
                    iconBg="bg-purple-100 text-purple-600"
                    label="Update Password"
                    sub="Keep your account secure"
                  />
                </div>
              </motion.section>

              {/* Encouragement card when no courses */}
              {!loading && enrolledCourses.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 }}
                  className="bg-gradient-to-br from-orange-500 to-indigo-600 rounded-2xl p-6 text-white text-center"
                >
                  <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-90" />
                  <h3 className="font-bold text-lg">Start your journey</h3>
                  <p className="text-sm text-white/80 mt-1 mb-4">
                    Join thousands of professionals advancing their careers with globally recognized certifications.
                  </p>
                  <Link
                    to="/courses"
                    className="inline-block bg-white text-orange-600 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-orange-50 transition"
                  >
                    Explore Courses
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
