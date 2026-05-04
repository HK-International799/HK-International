// src/pages/students/exams/ExamAttempt.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  startExam,
  saveAnswer,
  submitExam,
} from "../../../services/studentExamService";

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad(n) {
  return String(n).padStart(2, "0");
}

function formatTimeLeft(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

const SAVE_DEBOUNCE_MS = 600;

// ── Confirm Submit Modal ──────────────────────────────────────────────────────
function ConfirmSubmitModal({ total, answered, onConfirm, onCancel }) {
  const skipped = total - answered;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-[popIn_0.2s_ease]">
        <div className="text-5xl mb-4">{skipped > 0 ? "⚠️" : "✅"}</div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">Submit Exam?</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-3">
          You have answered{" "}
          <strong className="text-slate-900">{answered}</strong> of{" "}
          <strong className="text-slate-900">{total}</strong> questions.
          {skipped > 0 && (
            <span className="text-orange-600">
              {" "}{skipped} question{skipped > 1 ? "s" : ""} will be skipped.
            </span>
          )}
        </p>
        <p className="text-red-500 text-xs font-semibold mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-indigo-800 transition shadow-md shadow-indigo-200"
          >
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Timer Display ─────────────────────────────────────────────────────────────
function TimerDisplay({ timeLeft }) {
  if (timeLeft === null) return <div className="w-28" />;

  const isCritical = timeLeft < 60;
  const isDanger = timeLeft < 300;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono font-extrabold text-lg border transition-all duration-300
        ${isCritical
          ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
          : isDanger
          ? "bg-orange-50 border-orange-200 text-orange-600"
          : "bg-indigo-50 border-indigo-200 text-indigo-700"
        }`}
    >
      <span className="text-sm">{isCritical ? "🔴" : isDanger ? "🟠" : "⏱"}</span>
      {formatTimeLeft(timeLeft)}
    </div>
  );
}

// ── Question Panel ────────────────────────────────────────────────────────────
function QuestionPanel({ q, idx, total, answers, onSelect, onClear, saving }) {
  const selected = answers[String(q._id)];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Meta bar */}
      <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-slate-50 bg-slate-50/70 flex-wrap">
        <span className="text-[11px] font-extrabold uppercase tracking-widest bg-indigo-600 text-white px-2.5 py-1 rounded-full">
          Q{idx + 1} / {total}
        </span>
        {q.marks && (
          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">
            +{q.marks} mark{q.marks > 1 ? "s" : ""}
          </span>
        )}
        {q.negativeMarks > 0 && (
          <span className="text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full">
            −{q.negativeMarks} negative
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {saving && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin inline-block" />
              Saving…
            </span>
          )}
          {!saving && selected && (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              ✓ Saved
            </span>
          )}
        </div>
      </div>

      {/* Question text */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-[16.5px] font-semibold text-slate-900 leading-relaxed">{q.questionText}</p>
      </div>

      {/* Options */}
      <div className="px-6 pb-6 pt-3 space-y-3">
        {q.options.map((opt) => {
          const isSelected = selected === opt.label;
          return (
            <button
              key={opt.label}
              onClick={() => onSelect(String(q._id), opt.label)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150
                ${isSelected
                  ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                  : "border-slate-100 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/40"
                }`}
            >
              {/* Label bubble */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[13px] flex-shrink-0 transition-all duration-150
                  ${isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                {opt.label}
              </div>
              {/* Text */}
              <span
                className={`flex-1 text-sm leading-relaxed transition-colors duration-150
                  ${isSelected ? "text-indigo-900 font-semibold" : "text-slate-700"}`}
              >
                {opt.text}
              </span>
              {/* Checkmark */}
              {isSelected && (
                <span className="text-indigo-600 font-bold text-lg flex-shrink-0">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Question Palette ──────────────────────────────────────────────────────────
function QuestionPalette({ questions, answers, currentIdx, onJump }) {
  const answered = questions.filter((q) => answers[String(q._id)]).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Progress header */}
      <div className="px-4 py-3.5 border-b border-slate-50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-600">Progress</span>
          <span className="text-xs font-extrabold text-indigo-600">{answered}/{total} answered</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-right text-[10px] text-slate-400 mt-1 font-medium">{pct}% complete</div>
      </div>

      {/* Grid */}
      <div className="p-3.5">
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, i) => {
            const qId = String(q._id);
            const isAnswered = Boolean(answers[qId]);
            const isCurrent = i === currentIdx;
            return (
              <button
                key={qId}
                onClick={() => onJump(i)}
                title={`Q${i + 1}${isAnswered ? " (answered)" : " (unanswered)"}`}
                className={`aspect-square rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center
                  ${isAnswered
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : isCurrent
                    ? "bg-orange-100 text-orange-700 border-2 border-orange-400"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }
                  ${isCurrent && !isAnswered ? "ring-2 ring-orange-300 ring-offset-1" : ""}
                  ${isCurrent && isAnswered ? "ring-2 ring-indigo-300 ring-offset-1" : ""}
                `}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3.5 pt-3 border-t border-slate-50 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-600" />
            <span className="text-[10px] text-slate-500">Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-200 border border-orange-400" />
            <span className="text-[10px] text-slate-500">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
            <span className="text-[10px] text-slate-500">Not answered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ExamAttempt() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [endTime, setEndTime] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const timerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const submittingRef = useRef(false);
  const answersRef = useRef({});
  const attemptIdRef = useRef(null);
  answersRef.current = answers;
  attemptIdRef.current = attemptId;

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await startExam(examId);
        setAttemptId(data.attemptId);
        setQuestions(data.questions);
        setEndTime(new Date(data.endTime));
        if (data.answers?.length) {
          const map = {};
          data.answers.forEach((a) => {
            if (a.selectedOption) map[String(a.questionId)] = a.selectedOption;
          });
          setAnswers(map);
        }
        setPhase("ready");
      } catch (err) {
        setErrorMsg(err.response?.data?.message || err.message);
        setPhase("error");
      }
    })();
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(saveTimerRef.current);
    };
  }, [examId]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setCurrentIdx((i) => Math.min(i + 1, questions.length - 1));
      if (e.key === "ArrowLeft") setCurrentIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [questions.length]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = Math.max(0, Math.round((endTime - new Date()) / 1000));
      setTimeLeft(diff);
      if (diff === 0) {
        clearInterval(timerRef.current);
        if (!submittingRef.current) {
          submittingRef.current = true;
          setAutoSubmitted(true);
          doSubmit(true);
        }
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [endTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Select + debounced save ───────────────────────────────────────────────
  const handleSelect = useCallback(
    (questionId, optionLabel) => {
      setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
      clearTimeout(saveTimerRef.current);
      setSaving(true);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await saveAnswer(examId, {
            attemptId: attemptIdRef.current,
            questionId,
            selectedOption: optionLabel,
          });
        } catch (err) {
          if (err.response?.status === 410 || err.message?.includes("expired")) {
            clearInterval(timerRef.current);
            navigate(`/student/exams/${examId}/result/${attemptIdRef.current}`);
          }
        } finally {
          setSaving(false);
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [examId, navigate]
  );

  // ── Clear answer ──────────────────────────────────────────────────────────
  const handleClear = useCallback((questionId) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const doSubmit = useCallback(
    async (isAuto = false) => {
      if (submittingRef.current && !isAuto) return;
      submittingRef.current = true;
      setPhase("submitting");
      clearInterval(timerRef.current);
      clearTimeout(saveTimerRef.current);
      try {
        const answersArr = Object.entries(answersRef.current).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        }));
        await submitExam(examId, { attemptId: attemptIdRef.current, answers: answersArr });
        navigate(`/student/exams/${examId}/result/${attemptIdRef.current}`);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || err.message);
        setPhase("error");
        submittingRef.current = false;
      }
    },
    [examId, navigate]
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 text-[15px] font-medium">Preparing your exam…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="bg-white border border-red-100 rounded-2xl p-10 max-w-sm text-center shadow-md">
          <div className="text-5xl mb-4">{autoSubmitted ? "⏰" : "😔"}</div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">
            {autoSubmitted ? "Time's Up!" : "Something went wrong"}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {errorMsg || "Unable to process the exam request. Please try again."}
          </p>
          <button
            onClick={() => navigate("/student/exams")}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
          >
            ← Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // ── Submitting ────────────────────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-700 text-[15px] font-bold">Submitting your exam…</p>
        <p className="text-slate-400 text-sm">Please do not close this window.</p>
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────
  const q = questions[currentIdx];
  const answered = Object.keys(answers).length;
  const total = questions.length;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === total - 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {showConfirm && (
        <ConfirmSubmitModal
          total={total}
          answered={answered}
          onConfirm={() => { setShowConfirm(false); doSubmit(false); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* ── Sticky top bar ─────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-indigo-950 border-b border-indigo-900 h-14 flex items-center justify-between px-5 shadow-lg shadow-black/20">
        {/* Left */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg">📝</span>
          <span className="text-white font-bold text-sm truncate hidden sm:block">Exam in Progress</span>
        </div>

        {/* Center: Timer */}
        <TimerDisplay timeLeft={timeLeft} />

        {/* Right: progress */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-900 text-indigo-100 text-xs font-bold px-3 py-1 rounded-lg tabular-nums">
            {answered}/{total}
          </div>
          <span className="text-indigo-400 text-xs hidden sm:block">answered</span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5 items-start">

        {/* Left: question + nav */}
        <div className="space-y-4">
          <QuestionPanel
            q={q}
            idx={currentIdx}
            total={total}
            answers={answers}
            onSelect={handleSelect}
            onClear={handleClear}
            saving={saving}
          />

          {/* Navigation bar */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-5 py-3.5 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all
                ${isFirst
                  ? "border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed"
                  : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300"
                }`}
            >
              ← Prev
            </button>

            {/* Clear answer */}
            {answers[String(q._id)] && (
              <button
                onClick={() => handleClear(String(q._id))}
                className="px-4 py-2 border border-red-100 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-50 transition"
              >
                ✕ Clear
              </button>
            )}

            <button
              onClick={() =>
                isLast ? setShowConfirm(true) : setCurrentIdx((i) => Math.min(total - 1, i + 1))
              }
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all
                ${isLast
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-200"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                }`}
            >
              {isLast ? "Submit Exam ✓" : "Next →"}
            </button>
          </div>

          {/* Early submit */}
          {!isLast && (
            <div className="text-center">
              <button
                onClick={() => setShowConfirm(true)}
                className="text-slate-400 text-xs hover:text-indigo-600 underline underline-offset-2 transition"
              >
                Submit exam early
              </button>
            </div>
          )}
        </div>

        {/* Right: palette + stats */}
        <div className="space-y-4">
          <QuestionPalette
            questions={questions}
            answers={answers}
            currentIdx={currentIdx}
            onJump={setCurrentIdx}
          />

          {/* Quick stats */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status</p>
            <div className="space-y-2.5">
              {[
                { label: "Answered", count: answered, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Unanswered", count: total - answered, color: "text-slate-400", bg: "bg-slate-50" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{s.label}</span>
                  <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg ${s.color} ${s.bg}`}>
                    {s.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Orange submit now CTA */}
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-4 w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:from-orange-600 hover:to-orange-700 transition shadow-md shadow-orange-200"
            >
              Submit Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}