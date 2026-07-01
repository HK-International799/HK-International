// ════════════════════════════════════════════════════════════════════════
// MODULE 8 — STUDENT RESULT PAGE
// Route: /student/assignments/:assignmentId/result
// API:   GET /api/assignments/:assignmentId/my-submission
//        (reuses existing getMySubmissionForAssignment — no new endpoint)
// ════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  XCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { getMySubmissionForAssignment } from "../../services/studentService";
import MainLayout from "../../components/layout/MainLayout";

const getScoreColor = (pct) => {
  if (pct >= 80) return { text: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500" };
  if (pct >= 60) return { text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500" };
  return { text: "text-red-600", bg: "bg-red-50", bar: "bg-red-500" };
};

const ScoreRing = ({ pct }) => {
  const c = getScoreColor(pct);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full ${c.bg}`}>
      <svg width="96" height="96" className="absolute top-0 left-0 -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444"}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <span className={`text-xl font-bold ${c.text}`}>{pct}%</span>
    </div>
  );
};

const STATUS_MAP = {
  not_submitted: { label: "Not Submitted", cls: "bg-slate-100 text-slate-500 border border-slate-200", icon: AlertCircle },
  submitted: { label: "Submitted — awaiting review", cls: "bg-indigo-100 text-indigo-700 border border-indigo-200", icon: Clock },
  ai_reviewed: { label: "AI Reviewed — awaiting confirmation", cls: "bg-violet-100 text-violet-700 border border-violet-200", icon: Clock },
  graded: { label: "Graded", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200", icon: CheckCheck },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200", icon: ShieldCheck },
  resubmission_required: { label: "Resubmission Required", cls: "bg-orange-100 text-orange-700 border border-orange-200", icon: RotateCcw },
};

export default function AssignmentResult() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const sub = await getMySubmissionForAssignment(assignmentId);
        if (active) setSubmission(sub);
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Failed to load result");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [assignmentId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading your result…</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !submission) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 mb-4">{error || "No submission found for this assignment."}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
          >
            <ArrowLeft size={14} /> Go back
          </button>
        </div>
      </MainLayout>
    );
  }

  const assignment = submission.assignmentId || {};
  const maxMarks = Number(assignment.totalMarks || 0);
  const score = submission.totalScore;
  const pct = maxMarks > 0 && score != null ? Math.round((score / maxMarks) * 100) : 0;
  const statusInfo = STATUS_MAP[submission.status] || STATUS_MAP.not_submitted;
  const StatusIcon = statusInfo.icon;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition"
          >
            <ArrowLeft size={15} /> Back to assignments
          </button>
          <h1 className="text-xl font-bold text-slate-900">{assignment.title || "Assignment Result"}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
            {assignment.courseId?.title && (
              <span className="flex items-center gap-1.5">
                <BookOpen size={13} /> {assignment.courseId.title}
              </span>
            )}
            <span className="text-slate-300">|</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium capitalize">
              {(assignment.assessmentType || "general").replace(/_/g, " ")}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> Submitted {new Date(submission.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Status banner */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${statusInfo.cls}`}>
          <StatusIcon size={15} />
          {statusInfo.label}
          {submission.isLate && <span className="ml-2 text-orange-600 font-semibold">· Late submission</span>}
        </div>

        {submission.status === "resubmission_required" && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-700 mb-1">Resubmission needed</p>
            <p className="text-sm text-slate-700">
              {submission.resubmissionFeedback || "Your instructor has requested a resubmission. Please check the assignment page to resubmit."}
            </p>
          </div>
        )}

        {/* Score summary */}
        {["graded", "ai_reviewed", "approved"].includes(submission.status) && (
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
            <ScoreRing pct={pct} />
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Your Score</p>
              <p className="text-3xl font-bold text-slate-800">
                {score ?? "—"}
                <span className="text-slate-400 text-lg font-normal"> / {maxMarks || assignment.totalMarks || "—"}</span>
              </p>
              {submission.passFail && submission.passFail !== "pending" && (
                <span
                  className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${
                    submission.passFail === "pass"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {submission.passFail === "pass" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {submission.passFail === "pass" ? "Pass" : "Fail"}
                </span>
              )}
            </div>
            {submission.approvalStatus === "approved" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                <ShieldCheck size={12} /> Completion Approved
              </span>
            )}
            {submission.approvalStatus === "pending" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                <Clock size={12} /> Awaiting Approval
              </span>
            )}
          </div>
        )}

        {/* Instructor feedback */}
        {submission.feedback && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-amber-600" />
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Instructor Feedback</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        )}

        {/* Question breakdown */}
        {Array.isArray(submission.answers) && submission.answers.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Award size={13} /> Question Breakdown
            </p>
            {submission.answers.map((ans, idx) => {
              const q = ans.questionId || {};
              const hasMarks = ans.marksAwarded != null;
              return (
                <div key={ans._id || idx} className="rounded-xl border border-slate-200 p-4 bg-white space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">
                      {idx + 1}. {q.prompt || "Question"}
                    </p>
                    {hasMarks && (
                      <span
                        className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          ans.isCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ans.marksAwarded}/{q.marks ?? "—"}
                      </span>
                    )}
                  </div>

                  {ans.selectedOption && (
                    <p className="text-sm text-slate-600">
                      Your answer: <span className="font-medium">{ans.selectedOption}</span>
                    </p>
                  )}
                  {ans.textAnswer && (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{ans.textAnswer}</p>
                  )}

                  {/* Correct answer — only present if assignment.showCorrectAnswers gated it server-side */}
                  {(q.correctAnswer || (q.correctAnswers || []).length > 0) && (
                    <p className="text-xs text-emerald-600">
                      Correct answer: {q.correctAnswer || (q.correctAnswers || []).join(", ")}
                    </p>
                  )}

                  {(ans.feedback || ans.aiSuggestedFeedback) && (
                    <p className="text-xs text-slate-500 italic">
                      {ans.feedback || ans.aiSuggestedFeedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
