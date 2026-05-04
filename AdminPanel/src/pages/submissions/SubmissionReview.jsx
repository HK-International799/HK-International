
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Badge, Button } from "../../components/ui";
import {
  getSubmissionById,
  gradeSubmission,
} from "../../services/assignmentService";

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  FileText,
  Save,
  Loader2,
  AlertTriangle,
  User,
  Calendar,
  Award,
  MessageSquare,
} from "lucide-react";
import DocumentAnnotatorModal from "../../components/documentViewer/DocumentAnnotatorModal";

const ICONS = [
  { key: "correct", label: "Correct", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  { key: "partial", label: "Partial", icon: MinusCircle,  color: "text-orange-500",  bg: "bg-orange-50 border-orange-200"  },
  { key: "wrong",   label: "Wrong",   icon: XCircle,      color: "text-red-500",     bg: "bg-red-50 border-red-200"        },
];

// ─── FIX: Auto-expanding textarea hook ───────────────────────────────────────
// Textareas should grow with content, not scroll inside unless very long.
function useAutoExpand(value) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset height to auto so shrinking also works
    el.style.height = "auto";
    // Set to scrollHeight so it fills the content
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return ref;
}

export default function SubmissionReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Grading state
  const [totalScore, setTotalScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [questionGrades, setQuestionGrades] = useState({});
  const [annotations, setAnnotations] = useState({});

  // Document annotator modal
  const [annotatorOpen, setAnnotatorOpen] = useState(false);
  const [docAnnotations, setDocAnnotations] = useState([]);

  // FIX: Auto-expand textarea ref
  const feedbackRef = useAutoExpand(feedback);

  useEffect(() => {
    const total = Object.values(questionGrades).reduce(
      (sum, g) => sum + (g.marks || 0), 0,
    );
    setTotalScore(String(total));
  }, [questionGrades]);

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const loadSubmission = useCallback(async () => {
    try {
      const res = await getSubmissionById(id);
      const sub = res.data || res;
      setSubmission(sub);

      if (sub.status === "graded") {
        // FIX: Load saved document annotations (field is "annotations" on model)
        setDocAnnotations(sub.annotations || sub.documentAnnotations || []);
        setTotalScore(String(sub.totalScore ?? ""));
        setFeedback(sub.feedback || "");

        const ann = {};
        (sub.reviewAnnotations || []).forEach((a) => {
          ann[a.questionId] = a.icon;
        });
        setAnnotations(ann);

        const qg = {};
        (sub.answers || []).forEach((ans) => {
          if (ans.marksAwarded != null) {
            qg[ans._id] = { marks: ans.marksAwarded, isCorrect: ans.isCorrect };
          }
        });
        setQuestionGrades(qg);
      }
    } catch (err) {
      setError("Failed to load submission");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const setAnswerGrade = (answerId, field, value) => {
    setQuestionGrades((prev) => ({
      ...prev,
      [answerId]: { ...prev[answerId], [field]: value },
    }));
  };

  const setAnnotation = (questionId, icon) => {
    setAnnotations((prev) => {
      const updated = { ...prev };
      if (updated[questionId] === icon) delete updated[questionId];
      else updated[questionId] = icon;
      return updated;
    });
  };

  const handleGrade = async () => {
    if (totalScore === "" || totalScore === null) {
      return setError("Please enter a total score");
    }
    setError("");
    setSaving(true);
    try {
      const qGrades = Object.entries(questionGrades).map(([answerId, g]) => ({
        answerId,
        marks: g.marks,
        isCorrect: g.isCorrect,
      }));

      const reviewAnnotations = Object.entries(annotations)
        .filter(([, icon]) => icon)
        .map(([questionId, icon]) => ({ questionId, icon }));

      await gradeSubmission(id, {
        totalScore: Number(totalScore),
        feedback,
        questionGrades: qGrades,
        reviewAnnotations,
        // FIX: Always include document annotations with grading
        documentAnnotations: docAnnotations,
      });

      setSuccess(true);
      setError("");
      loadSubmission();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to grade submission");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!submission) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-gray-400">Submission not found</div>
      </AdminLayout>
    );
  }

  const { studentId, assignmentId: assignment, answers = [], submissionFile } = submission;
  const maxMarks = Number(assignment?.totalMarks || 0);

  return (
    <AdminLayout>
      <div className="animate-fadeIn max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
            >
              <ArrowLeft size={15} /> Back to submissions
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {assignment?.title || "Submission Review"}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <User size={13} /> {studentId?.name || "Student"}
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(submission.createdAt).toLocaleString()}
              </span>
              {submission.isLate && (
                <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                  <AlertTriangle size={12} /> Late
                </span>
              )}
              <Badge
                variant={
                  submission.status === "graded" ? "success"
                  : submission.status === "submitted" ? "primary"
                  : "warning"
                }
              >
                {submission.status}
              </Badge>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
            <AlertTriangle size={14} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-200">
            <CheckCircle2 size={14} /> Submission graded successfully!
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left: Answers ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Submitted file */}
            {submissionFile?.url && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Submitted Document
                </h3>
                <div
                  onClick={() => setAnnotatorOpen(true)}
                  className="flex items-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition group cursor-pointer"
                >
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-200">
                    <FileText size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-700 truncate">
                      {submissionFile.originalName || "Open submission"}
                    </p>
                    <p className="text-xs text-indigo-400">
                      Click to open & annotate
                      {docAnnotations.length > 0 && (
                        <span className="ml-2 text-indigo-500 font-medium">
                          · {docAnnotations.length} annotation{docAnnotations.length !== 1 ? "s" : ""} saved
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Assignment file for reference */}
            {assignment?.file?.url && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Assignment File (for reference)
                </h3>
                <a
                  href={assignment.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
                >
                  <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                    <FileText size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {assignment.file.originalName || "Assignment file"}
                    </p>
                    <p className="text-xs text-gray-400">View assignment document</p>
                  </div>
                </a>
              </div>
            )}

            {/* Answers */}
            {answers.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Student Answers ({answers.length})
                  </h3>
                </div>

                <div className="divide-y divide-gray-50">
                  {answers.map((ans, i) => {
                    const question = ans.questionId;
                    const qId = question?._id || ans.questionId;
                    const answerId = ans._id;
                    const currentIcon = annotations[qId];
                    const currentGrade = questionGrades[answerId] || {};

                    return (
                      <div key={answerId || i} className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {i + 1}
                              </span>
                              <p className="text-sm font-medium text-gray-800">
                                {question?.prompt || `Question ${i + 1}`}
                              </p>
                              <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                                {question?.marks ?? "?"} marks
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-8">
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-3">
                            {ans.selectedOption ? (
                              <p className="text-sm text-gray-700">
                                <span className="text-xs text-gray-400 mr-2">Selected:</span>
                                <span className="font-medium">{ans.selectedOption}</span>
                              </p>
                            ) : ans.textAnswer ? (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ans.textAnswer}</p>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No answer provided</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-400">Mark:</span>
                            {ICONS.map(({ key, label, icon: Icon, color, bg }) => (
                              <button
                                key={key}
                                onClick={() => setAnnotation(qId, key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                  currentIcon === key
                                    ? `${bg} ${color} border-current`
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                                title={label}
                              >
                                <Icon size={13} className={currentIcon === key ? color : ""} />
                                {label}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-500 flex-shrink-0">Marks awarded:</label>
                            <input
                              type="number"
                              min={0}
                              max={question?.marks}
                              value={currentGrade.marks ?? ""}
                              onChange={(e) => setAnswerGrade(answerId, "marks", Number(e.target.value))}
                              className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              placeholder="0"
                            />
                            <span className="text-xs text-gray-400">/ {question?.marks ?? "?"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Student submitted a file — no text answers</p>
              </div>
            )}
          </div>

          {/* ── Right: Grading Panel ─────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award size={16} className="text-indigo-500" />
                Grade Submission
              </h3>

              {/* Total score */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Total Score
                  {maxMarks > 0 && <span className="text-gray-400 ml-1">/ {maxMarks}</span>}
                </label>
                <input
                  type="number"
                  min={0}
                  max={maxMarks || undefined}
                  value={totalScore}
                  onChange={(e) => setTotalScore(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="0"
                />

                {maxMarks > 0 && totalScore !== "" && (() => {
                  const percentage = maxMarks > 0 ? (Number(totalScore) / maxMarks) * 100 : 0;
                  return (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* FIX: Auto-expanding feedback textarea */}
              <div className="mb-4 w-90">
                <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                  <MessageSquare size={13} /> Feedback for student
                </label>
                {/*
                  FIX: Changed from fixed rows={15} with resize-none to an
                  auto-expanding textarea. The textarea grows to fit content,
                  with a min-height and overflow-hidden (so no internal scroll
                  unless the content is very large).
                */}
                <textarea
                  ref={feedbackRef}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Great work on... You could improve..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  style={{
                    resize: "none",
                    minHeight: "300px",
                    maxHeight: "400px",
                    overflowY: feedback.length > 1500 ? "auto" : "hidden",
                  }}
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Questions answered</span>
                  <span className="font-medium">{answers.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Q annotations</span>
                  <span className="font-medium">
                    {Object.values(annotations).filter(Boolean).length}/{answers.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Doc annotations</span>
                  <span className="font-medium">{docAnnotations.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Graded answers</span>
                  <span className="font-medium">
                    {Object.keys(questionGrades).length}/{answers.length}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGrade}
                disabled={saving}
                className="w-full justify-center"
              >
                {saving ? (
                  <><Loader2 size={15} className="animate-spin" /> Saving…</>
                ) : (
                  <><Save size={15} /> Submit Grade</>
                )}
              </Button>

              {submission.status === "graded" && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  Graded on{" "}
                  {submission.gradedAt
                    ? new Date(submission.gradedAt).toLocaleDateString()
                    : "—"}{" "}
                  by {submission.gradedBy?.name || "—"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FIX: Pass feedback/score to modal for "Download Reviewed" button */}
      <DocumentAnnotatorModal
        open={annotatorOpen}
        onClose={() => setAnnotatorOpen(false)}
        fileUrl={submissionFile?.url}
        fileName={submissionFile?.originalName}
        submissionId={submission._id}
        annotations={docAnnotations}
        onChange={setDocAnnotations}
        readOnly={false}
        feedback={feedback}
        totalScore={totalScore !== "" ? Number(totalScore) : null}
        maxMarks={maxMarks || null}
      />
    </AdminLayout>
  );
}
