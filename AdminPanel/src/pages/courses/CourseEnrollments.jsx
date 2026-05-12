import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Trash2,
  X,
  BarChart2,
  Award,
  BookMarked,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import {
  getCourseEnrollmentsProgress,
  revokeStudentEnrollment,
} from "../../services/courseService";

/* ─────────────────────────────────────────────────────────
   Helpers & small components
───────────────────────────────────────────────────────── */

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border rounded-2xl p-5 ${className}`}>
    {children}
  </div>
);

/** Thin horizontal progress bar */
const ProgressBar = ({ percent, color = "bg-purple-500" }) => (
  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
    <div
      className={`h-2 rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

/** Student status badge */
const StatusBadge = ({ status }) => {
  const map = {
    completed: {
      label: "Completed",
      cls: "bg-green-100 text-green-700",
      icon: <CheckCircle size={11} />,
    },
    in_progress: {
      label: "In Progress",
      cls: "bg-blue-100 text-blue-700",
      icon: <Clock size={11} />,
    },
    not_started: {
      label: "Not Started",
      cls: "bg-gray-100 text-gray-500",
      icon: <AlertCircle size={11} />,
    },
  };
  const { label, cls, icon } = map[status] || map.not_started;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cls}`}
    >
      {icon}
      {label}
    </span>
  );
};

/** Grade badge */
const GradeBadge = ({ grade }) => {
  if (!grade) return <span className="text-xs text-gray-400">—</span>;
  const map = {
    distinction: "bg-emerald-100 text-emerald-700",
    pass: "bg-blue-100 text-blue-700",
    below_pass: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[grade] || "bg-gray-100 text-gray-500"}`}
    >
      {grade.replace("_", " ")}
    </span>
  );
};

/** Avatar initials circle */
const Avatar = ({ name, size = "md" }) => {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };
  return (
    <div
      className={`${sizes[size]} rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0`}
    >
      {initials}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Skeleton loader — mirrors the table row layout
───────────────────────────────────────────────────────── */
const SkeletonRow = () => (
  <div className="border rounded-2xl p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="h-6 w-20 bg-gray-200 rounded-full" />
    </div>
    <div className="h-2 bg-gray-100 rounded-full" />
  </div>
);

/* ─────────────────────────────────────────────────────────
   Revoke Confirmation Modal
───────────────────────────────────────────────────────── */
const RevokeModal = ({ student, onConfirm, onClose, revoking }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Revoke Enrollment?</h3>
          <p className="text-sm text-gray-500 mt-1">
            Remove{" "}
            <span className="font-medium text-gray-800">{student.name}</span>{" "}
            from this course? Their quiz progress data will be preserved.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"
        >
          <X size={15} className="text-gray-400" />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm text-gray-600 border rounded-xl hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={revoking}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {revoking ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Revoking…
            </>
          ) : (
            <>
              <Trash2 size={13} />
              Revoke Access
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   Expandable chapter detail list for one student
───────────────────────────────────────────────────────── */
const ChapterDetailList = ({ chapters }) => {
  if (!chapters || chapters.length === 0) {
    return (
      <p className="text-xs text-gray-400 py-2">No chapters in this course.</p>
    );
  }

  return (
    <div className="space-y-2 mt-3">
      {chapters.map((ch, idx) => (
        <div
          key={ch._id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
            ch.completed
              ? "bg-green-50 border-green-100"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          {/* Chapter number */}
          <span
            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
              ch.completed
                ? "bg-green-200 text-green-800"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {idx + 1}
          </span>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium truncate ${
                ch.completed ? "text-gray-800" : "text-gray-500"
              }`}
            >
              {ch.title}
            </p>
            {ch.completed && ch.percentage !== null && (
              <p className="text-xs text-gray-400 mt-0.5">
                Score: {ch.score}/{ch.totalMarks} ({ch.percentage}%)
              </p>
            )}
          </div>

          {/* Quiz badge */}
          {ch.hasQuiz ? (
            ch.completed ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <GradeBadge grade={ch.grade} />
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle size={11} /> Done
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                <Clock size={11} /> Pending
              </span>
            )
          ) : (
            <span className="text-xs text-gray-300 flex-shrink-0">
              No quiz
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Student row (collapsible)
───────────────────────────────────────────────────────── */
const StudentRow = ({ student, onRevoke }) => {
  const [expanded, setExpanded] = useState(false);

  const progressColor =
    student.progressPercent >= 100
      ? "bg-green-500"
      : student.progressPercent >= 50
        ? "bg-blue-500"
        : "bg-purple-500";

  return (
    <div className="border rounded-2xl overflow-hidden">
      {/* ── Collapsed header ── */}
      <div
        className="flex items-center gap-3 px-5 py-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <Avatar name={student.name} />

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {student.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{student.email}</p>
        </div>

        {/* Progress % */}
        <div className="hidden sm:flex flex-col items-end w-24 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-700">
            {student.progressPercent}%
          </p>
          <div className="w-full mt-1">
            <ProgressBar percent={student.progressPercent} color={progressColor} />
          </div>
        </div>

        {/* Chapters completed */}
        <div className="hidden md:flex flex-col items-center w-20 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-700">
            {student.completedCount}/{student.completedCount + student.remainingCount}
          </p>
          <p className="text-xs text-gray-400">chapters</p>
        </div>

        {/* Status */}
        <div className="hidden sm:block flex-shrink-0">
          <StatusBadge status={student.status} />
        </div>

        {/* Revoke */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRevoke(student);
          }}
          title="Revoke enrollment"
          className="p-1.5 rounded-lg hover:bg-red-50 flex-shrink-0 ml-1"
        >
          <Trash2 size={14} className="text-red-400" />
        </button>

        {/* Expand chevron */}
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronDown size={15} className="text-gray-400" />
          ) : (
            <ChevronRight size={15} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t bg-gray-50 px-5 pb-5 pt-4">
          {/* Mobile stats row */}
          <div className="flex flex-wrap gap-4 mb-4 sm:hidden">
            <div>
              <p className="text-xs text-gray-400">Progress</p>
              <p className="text-sm font-semibold text-gray-800">
                {student.progressPercent}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Chapters</p>
              <p className="text-sm font-semibold text-gray-800">
                {student.completedCount} done
              </p>
            </div>
            <div>
              <StatusBadge status={student.status} />
            </div>
          </div>

          {/* Extra stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white border rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-bold text-purple-600">
                {student.completedCount}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Completed</p>
            </div>
            <div className="bg-white border rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-bold text-orange-500">
                {student.remainingCount}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Remaining</p>
            </div>
            <div className="bg-white border rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-bold text-blue-500">
                {student.quizCompletedCount}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Quizzes Done</p>
            </div>
            <div className="bg-white border rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-bold text-gray-700">
                {student.progressPercent}%
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Progress</p>
            </div>
          </div>

          {/* Full progress bar */}
          <div className="mb-4">
            <ProgressBar percent={student.progressPercent} color={progressColor} />
          </div>

          {/* Chapter-level details */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Chapter Breakdown
          </p>
          <ChapterDetailList chapters={student.chapters} />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Main Page: CourseEnrollments
───────────────────────────────────────────────────────── */
export default function CourseEnrollments() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [revokeTarget, setRevokeTarget] = useState(null); // student to revoke
  const [revoking, setRevoking] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCourseEnrollmentsProgress(id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load enrollment data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(true);
      await revokeStudentEnrollment(id, revokeTarget._id);
      setRevokeTarget(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to revoke enrollment");
    } finally {
      setRevoking(false);
    }
  };

  /* ── Filtered students ── */
  const filteredStudents = (data?.students || []).filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-7 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <AlertCircle size={40} className="mx-auto text-red-300 mb-3" />
          <p className="text-gray-600 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  const {
    course,
    totalChapters,
    chaptersWithQuiz,
    totalEnrolled,
    averageProgress,
  } = data;

  return (
    <AdminLayout>
      {/* Revoke Confirmation Modal */}
      {revokeTarget && (
        <RevokeModal
          student={revokeTarget}
          onConfirm={handleRevoke}
          onClose={() => setRevokeTarget(null)}
          revoking={revoking}
        />
      )}

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => navigate(`/admin/courses/${id}`)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                title="Back to course"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Enrollments &amp; Progress
              </h1>
            </div>
            <div className="ml-9 flex items-center gap-2">
              <BookOpen size={14} className="text-purple-500 flex-shrink-0" />
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {course.title}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  course.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {course.status}
              </span>
            </div>
          </div>
        </div>

        {/* ── Summary Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="text-center py-4">
            <Users size={20} className="mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{totalEnrolled}</p>
            <p className="text-xs text-gray-400 mt-0.5">Enrolled</p>
          </Card>
          <Card className="text-center py-4">
            <TrendingUp size={20} className="mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{averageProgress}%</p>
            <p className="text-xs text-gray-400 mt-0.5">Avg Progress</p>
          </Card>
          <Card className="text-center py-4">
            <BookMarked size={20} className="mx-auto text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-orange-500">{totalChapters}</p>
            <p className="text-xs text-gray-400 mt-0.5">Chapters</p>
          </Card>
          <Card className="text-center py-4">
            <Award size={20} className="mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {(data.students || []).filter((s) => s.status === "completed").length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Completed</p>
          </Card>
        </div>

        {/* ── Analytics Summary ── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-purple-500" />
            <h2 className="font-semibold text-gray-800">Course Analytics</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {(data.students || []).filter((s) => s.status === "not_started").length}
              </p>
              <p className="text-xs text-gray-400">Not Started</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">
                {(data.students || []).filter((s) => s.status === "in_progress").length}
              </p>
              <p className="text-xs text-gray-400">In Progress</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {(data.students || []).filter((s) => s.status === "completed").length}
              </p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Average course progress</span>
              <span className="font-semibold text-gray-700">{averageProgress}%</span>
            </div>
            <ProgressBar
              percent={averageProgress}
              color={
                averageProgress >= 75
                  ? "bg-green-500"
                  : averageProgress >= 40
                    ? "bg-blue-500"
                    : "bg-purple-500"
              }
            />
          </div>
        </Card>

        {/* ── Student List ── */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users size={16} className="text-purple-500" />
              Enrolled Students
              <span className="text-xs font-normal text-gray-400 ml-1">
                ({filteredStudents.length} of {totalEnrolled})
              </span>
            </h2>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {/* Search */}
              <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-3 py-2 text-sm min-w-0 flex-1 sm:flex-none sm:w-52">
                <svg
                  className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search students…"
                  className="bg-transparent outline-none flex-1 text-gray-700 placeholder:text-gray-400 min-w-0 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X size={12} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <select
                className="border rounded-xl px-3 py-2 text-sm bg-gray-50 outline-none text-gray-700 focus:ring-2 focus:ring-purple-200"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Empty state */}
          {totalEnrolled === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl">
              <Users size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">
                No students enrolled yet.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Go back to the course and enroll students.
              </p>
              <button
                onClick={() => navigate(`/admin/courses/${id}`)}
                className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700"
              >
                Enroll Students
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-2xl">
              <Users size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-500">
                No students match your filters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mt-3 text-xs text-purple-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <StudentRow
                  key={student._id}
                  student={student}
                  onRevoke={setRevokeTarget}
                />
              ))}
            </div>
          )}
        </Card>

        {/* ── Info banner ── */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">💡 Progress Calculation</p>
          <p>
            Progress is based on chapters that have a quiz (
            <strong>{chaptersWithQuiz}</strong> of{" "}
            <strong>{totalChapters}</strong> chapters). A chapter is marked
            complete once the student submits its quiz. Chapters without a quiz
            are accessible but not counted toward progress.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
