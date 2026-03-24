import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Loader2,
  Award,
  BookOpen,
  Filter,
  MessageSquare,
  Upload,
  X,
} from "lucide-react";
import {
  getAssignments,
  submitAssignment,
} from "../../services/studentService";
import MainLayout from "../../components/layout/MainLayout";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAssignments();
        setAssignments(data);
      } catch (err) {
        setError(err.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    if (filter === "all") return true;
    if (filter === "pending") return a.submissionStatus === "not_submitted";
    if (filter === "submitted") return a.submissionStatus === "pending";
    if (filter === "graded") return a.submissionStatus === "graded";
    return true;
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => a.submissionStatus === "not_submitted").length,
    submitted: assignments.filter((a) => a.submissionStatus === "pending").length,
    graded: assignments.filter((a) => a.submissionStatus === "graded").length,
  };

  const handleAnswerChange = (assignmentId, questionId, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        [questionId]: {
          ...prev[assignmentId]?.[questionId],
          questionId,
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (assignment) => {
    const assignmentAnswers = answers[assignment._id] || {};
    const formattedAnswers = Object.values(assignmentAnswers).map((a) => ({
      questionId: a.questionId,
      textAnswer: a.textAnswer || "",
      selectedOption: a.selectedOption || "",
    }));

    setSubmitting(assignment._id);
    try {
      await submitAssignment({
        assignmentId: assignment._id,
        answers: formattedAnswers,
      });

      // Update local state
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignment._id
            ? { ...a, submissionStatus: "pending" }
            : a
        )
      );
      setSubmitSuccess(assignment._id);
      setTimeout(() => setSubmitSuccess(null), 3000);
      setExpandedId(null);
    } catch (err) {
      setError(err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "graded":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
            <CheckCircle2 className="w-3 h-3" />
            Graded
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Clock className="w-3 h-3" />
            Submitted
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const getDueDateInfo = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;
    const isUrgent = daysLeft >= 0 && daysLeft <= 3;

    return {
      text: due.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      daysLeft,
      isOverdue,
      isUrgent,
    };
  };

  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            My Assignments
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Track and submit your course assignments
          </p>
        </div>

        {/* Stats */}
        {!loading && assignments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total", value: stats.total, color: "bg-gray-100 text-gray-700" },
              { label: "Pending", value: stats.pending, color: "bg-orange-50 text-orange-700" },
              { label: "Submitted", value: stats.submitted, color: "bg-blue-50 text-blue-700" },
              { label: "Graded", value: stats.graded, color: "bg-green-50 text-green-700" },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.color} px-4 py-3 rounded-xl text-center`}
              >
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {!loading && assignments.length > 0 && (
          <div className="flex gap-2 mb-6">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "submitted", label: "Submitted" },
              { key: "graded", label: "Graded" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.key
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Assignment submitted successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssignments.map((assignment, i) => {
              const isExpanded = expandedId === assignment._id;
              const dueInfo = getDueDateInfo(assignment.dueDate);
              const canSubmit = assignment.submissionStatus === "not_submitted";

              return (
                <motion.div
                  key={assignment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Assignment Header */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : assignment._id)
                    }
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                        assignment.submissionStatus === "graded"
                          ? "bg-green-100"
                          : assignment.submissionStatus === "pending"
                          ? "bg-blue-100"
                          : "bg-orange-100"
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 ${
                          assignment.submissionStatus === "graded"
                            ? "text-green-600"
                            : assignment.submissionStatus === "pending"
                            ? "text-blue-600"
                            : "text-orange-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {assignment.courseId?.title || "—"}
                        </span>
                        {assignment.totalMarks > 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {assignment.totalMarks} marks
                          </span>
                        )}
                        {dueInfo && (
                          <span
                            className={`text-xs flex items-center gap-1 ${
                              dueInfo.isOverdue
                                ? "text-red-500"
                                : dueInfo.isUrgent
                                ? "text-orange-500"
                                : "text-gray-400"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {dueInfo.isOverdue
                              ? "Overdue"
                              : `Due ${dueInfo.text}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Score if graded */}
                      {assignment.submissionStatus === "graded" &&
                        assignment.totalScore != null && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {assignment.totalScore}
                            </p>
                            <p className="text-xs text-gray-400">
                              /{assignment.totalMarks}
                            </p>
                          </div>
                        )}

                      {getStatusBadge(assignment.submissionStatus)}

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-gray-100">
                          {/* Description */}
                          {assignment.description && (
                            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                              {assignment.description}
                            </p>
                          )}

                          {/* Attachment */}
                          {assignment.file?.url && (
                            <div className="mt-4">
                              <a
                                href={assignment.file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm border border-gray-200 transition"
                              >
                                <Upload className="w-4 h-4" />
                                {assignment.file.originalName || "Download Attachment"}
                              </a>
                            </div>
                          )}

                          {/* Feedback */}
                          {assignment.feedback && (
                            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                              <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Tutor Feedback
                              </p>
                              <p className="text-sm text-green-800">
                                {assignment.feedback}
                              </p>
                            </div>
                          )}

                          {/* Questions & Submit Form */}
                          {canSubmit && assignment.questions?.length > 0 && (
                            <div className="mt-5 space-y-4">
                              <h4 className="text-sm font-semibold text-gray-800">
                                Questions ({assignment.questions.length})
                              </h4>

                              {assignment.questions.map((q, qIdx) => (
                                <div
                                  key={q._id}
                                  className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                                >
                                  <p className="text-sm font-medium text-gray-800 mb-2">
                                    {qIdx + 1}. {q.prompt}
                                    <span className="text-xs text-gray-400 ml-2">
                                      ({q.marks} marks)
                                    </span>
                                  </p>

                                  {q.type === "mcq" && q.options?.length > 0 ? (
                                    <div className="space-y-2">
                                      {q.options.map((opt, oIdx) => (
                                        <label
                                          key={oIdx}
                                          className="flex items-center gap-3 cursor-pointer group"
                                        >
                                          <input
                                            type="radio"
                                            name={`q-${assignment._id}-${q._id}`}
                                            value={opt}
                                            onChange={() =>
                                              handleAnswerChange(
                                                assignment._id,
                                                q._id,
                                                "selectedOption",
                                                opt
                                              )
                                            }
                                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                          />
                                          <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                            {opt}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    <textarea
                                      rows={3}
                                      placeholder="Type your answer here..."
                                      onChange={(e) =>
                                        handleAnswerChange(
                                          assignment._id,
                                          q._id,
                                          "textAnswer",
                                          e.target.value
                                        )
                                      }
                                      className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none"
                                    />
                                  )}
                                </div>
                              ))}

                              {/* Submit button */}
                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => handleSubmit(assignment)}
                                  disabled={submitting === assignment._id}
                                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-60"
                                >
                                  {submitting === assignment._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}
                                  {submitting === assignment._id
                                    ? "Submitting..."
                                    : "Submit Assignment"}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* No questions - text submission */}
                          {canSubmit && (!assignment.questions || assignment.questions.length === 0) && (
                            <div className="mt-5">
                              <p className="text-sm text-gray-500 mb-3">
                                This assignment has no questions. You can submit directly.
                              </p>
                              <button
                                onClick={() => handleSubmit(assignment)}
                                disabled={submitting === assignment._id}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-60"
                              >
                                {submitting === assignment._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                                {submitting === assignment._id
                                  ? "Submitting..."
                                  : "Mark as Submitted"}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
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
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-700 text-lg mb-1">
              {filter !== "all" ? "No matching assignments" : "No assignments yet"}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm">
              {filter !== "all"
                ? "Try changing the filter to see more assignments."
                : "Assignments from your enrolled courses will appear here."}
            </p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
