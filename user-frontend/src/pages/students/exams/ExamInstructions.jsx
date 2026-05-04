// src/pages/students/exams/ExamInstructions.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listActiveExams } from "../../../services/studentExamService";
import MainLayout from "../../../components/layout/MainLayout";

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} minutes`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hour${h > 1 ? "s" : ""} ${m} min` : `${h} hour${h > 1 ? "s" : ""}`;
}

const RULES = [
  { icon: "🚫", text: "Do NOT refresh the page during the exam — your progress may be lost.", color: "bg-red-50 border-red-100" },
  { icon: "⏱", text: "The exam timer starts as soon as you click 'Start Exam'. It cannot be paused.", color: "bg-orange-50 border-orange-100" },
  { icon: "💾", text: "Each answer is auto-saved the moment you select it.", color: "bg-emerald-50 border-emerald-100" },
  { icon: "🔀", text: "You can navigate between questions using the question palette or Prev/Next buttons.", color: "bg-indigo-50 border-indigo-100" },
  { icon: "📡", text: "If your session expires mid-exam, the attempt is auto-submitted with answers saved so far.", color: "bg-amber-50 border-amber-100" },
  { icon: "🔒", text: "Once submitted, answers cannot be changed.", color: "bg-slate-50 border-slate-200" },
  { icon: "📋", text: "After submission, a detailed result with correct answers is shown.", color: "bg-sky-50 border-sky-100" },
];

export default function ExamInstructions() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    listActiveExams()
      .then((exams) => {
        const found = exams.find((e) => e._id === examId);
        setExam(found || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [examId]);

  const handleStart = () => {
    if (!agreed) return;
    setStarting(true);
    navigate(`/student/exams/${examId}/attempt`);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-11 h-11 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm font-medium">Loading exam details…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!exam) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
          <div className="bg-white border border-red-100 rounded-2xl p-10 text-center max-w-sm shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Exam Not Found</h3>
            <p className="text-slate-500 text-sm mb-6">
              This exam may have been deactivated or doesn't exist.
            </p>
            <button
              onClick={() => navigate("/student/exams")}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
            >
              ← Back to Exams
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const courseName = exam.courseId?.title || exam.courseId?.name || "General";

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <button
            onClick={() => navigate("/student/exams")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-sm font-medium mb-6 transition"
          >
            ← Back to Exams
          </button>

          {/* Main card */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-md">

            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 px-8 py-8 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-indigo-400/10 rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-indigo-300 bg-white/10 px-3 py-1 rounded-full mb-4">
                  {courseName}
                </span>
                <h1 className="text-2xl font-extrabold text-white mb-2 leading-tight">{exam.title}</h1>
                {exam.description && (
                  <p className="text-indigo-300 text-sm leading-relaxed">{exam.description}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
              {[
                { icon: "⏱", label: "Duration", value: formatDuration(exam.timeLimit) },
                { icon: "📝", label: "Questions", value: exam.totalQuestions },
                { icon: "🎯", label: "Pass at", value: `${exam.passingScore}%` },
                { icon: "🔄", label: "Max Attempts", value: exam.maxAttempts },
              ].map((item, i) => (
                <div key={i} className="py-5 px-3 text-center">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-[15px] font-extrabold text-slate-900">{item.value}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Rules & Actions */}
            <div className="p-7">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center text-sm">⚠️</div>
                <h2 className="text-[15px] font-bold text-slate-800">Instructions — Please Read Carefully</h2>
              </div>

              <div className="space-y-2.5 mb-5">
                {RULES.map((rule, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 items-start rounded-xl px-4 py-3 border ${rule.color}`}
                  >
                    <span className="text-base mt-0.5 flex-shrink-0">{rule.icon}</span>
                    <p className="text-[13.5px] text-slate-700 leading-relaxed">{rule.text}</p>
                  </div>
                ))}
              </div>

              {/* Re-attempt notice */}
              {exam.allowReattempt && (
                <div className="mb-5 px-4 py-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-800">
                  💡 <strong>Re-attempt allowed:</strong>{" "}
                  {exam.reattemptNewQuestions
                    ? "You will receive a new set of questions on each attempt."
                    : "The same questions will appear on re-attempt."}
                </div>
              )}

              {/* Agreement checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none mb-6 group">
                <div
                  onClick={() => setAgreed((v) => !v)}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${agreed
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-white border-slate-300 group-hover:border-indigo-400"
                    }`}
                >
                  {agreed && <span className="text-white text-xs font-black">✓</span>}
                </div>
                <span className="text-sm text-slate-700 leading-relaxed">
                  I have read and understood all the instructions. I am ready to begin.
                </span>
              </label>

              {/* Start button */}
              <button
                onClick={handleStart}
                disabled={!agreed || starting}
                className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200
                  ${agreed
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
              >
                {starting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting…
                  </>
                ) : (
                  <>
                    Start Exam Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}