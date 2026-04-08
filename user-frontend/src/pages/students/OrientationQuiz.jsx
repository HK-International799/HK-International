import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle2,
  AlertTriangle, Loader2, BookOpen, Send,
} from "lucide-react";
import { getSessionQuiz, submitQuiz } from "../../services/orientationService";
import { toast } from "sonner";

const MOCK_QUIZ = {
  sessionId: "s1",
  title: "IOSH Level 3 — Orientation Quiz",
  timeLimit: 15, // minutes
  passMark: 70,
  questions: [
    {
      _id: "q1",
      text: "What does IOSH stand for?",
      options: [
        "Institute of Occupational Safety and Health",
        "International Organisation of Safety Hazards",
        "Institute of Occupational Standards and Hygiene",
        "International OSH Specialists Hub",
      ],
      correct: 0,
    },
    {
      _id: "q2",
      text: "Which UK legislation is the primary framework for workplace health and safety?",
      options: [
        "The Factories Act 1961",
        "The Health and Safety at Work Act 1974",
        "The Management of Health and Safety at Work Regulations 1999",
        "The Workplace (Health, Safety and Welfare) Regulations 1992",
      ],
      correct: 1,
    },
    {
      _id: "q3",
      text: "What is the primary purpose of a risk assessment?",
      options: [
        "To eliminate all workplace hazards",
        "To identify hazards and evaluate the risks they pose",
        "To assign blame for accidents",
        "To satisfy legal requirements only",
      ],
      correct: 1,
    },
    {
      _id: "q4",
      text: "Which of the following best describes a 'hazard' in OSH?",
      options: [
        "An event that has already caused harm",
        "The likelihood that harm will occur",
        "Anything with potential to cause harm",
        "A written safety policy",
      ],
      correct: 2,
    },
    {
      _id: "q5",
      text: "The IOSH Managing Safely qualification is primarily aimed at:",
      options: [
        "Senior executives only",
        "Managers and supervisors in all sectors",
        "Safety officers with specialist training",
        "New employees during induction",
      ],
      correct: 1,
    },
  ],
};

function useTimer(initialSeconds, onExpire) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) { onExpire(); return; }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, onExpire]);

  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return { mins, secs, seconds };
}

export default function OrientationQuiz() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSessionQuiz(sessionId);
        setQuiz(data);
      } catch {
        setQuiz(MOCK_QUIZ);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const handleExpire = useCallback(() => {
    if (!submitted) handleSubmit(true);
  }, [submitted]);

  const totalSeconds = quiz ? quiz.timeLimit * 60 : 0;
  const { mins, secs, seconds: remainingSeconds } = useTimer(
    submitted ? 0 : totalSeconds,
    handleExpire
  );
  const isLowTime = remainingSeconds <= 60 && !submitted;

  async function handleSubmit(auto = false) {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const answersArray = quiz.questions.map((q) => ({
        questionId: q._id,
        selectedIndex: answers[q._id] ?? -1,
      }));
      const data = await submitQuiz(sessionId, answersArray);
      setResult(data);
    } catch {
      // Calculate mock result
      let correct = 0;
      quiz.questions.forEach((q) => {
        if (answers[q._id] === q.correct) correct++;
      });
      const score = Math.round((correct / quiz.questions.length) * 100);
      const passed = score >= quiz.passMark;
      setResult({ score, correct, total: quiz.questions.length, passed });
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      if (auto) toast.info("Time's up! Quiz auto-submitted.");
      else toast.success("Quiz submitted!");
    }
  }

  const answered = Object.keys(answers).length;
  const total = quiz?.questions?.length || 0;
  const progress = total > 0 ? (answered / total) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (submitted && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
          <div className={`h-2 ${result.passed ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-red-400 to-orange-400"}`} />
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                result.passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {result.passed ? (
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-red-500" />
              )}
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {result.passed ? "Congratulations! 🎉" : "Not Passed"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {result.passed
                ? "You passed the orientation quiz!"
                : `You need ${quiz.passMark}% to pass. Try again after the next session.`}
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="text-5xl font-bold mb-2" style={{
                color: result.passed ? "#10b981" : "#ef4444"
              }}>
                {result.score}%
              </div>
              <p className="text-gray-500 text-sm">
                {result.correct} out of {result.total} correct
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {result.passed && (
                <button
                  onClick={() => navigate(`/student/orientation/${sessionId}/certificate`)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold hover:from-yellow-600 hover:to-amber-600 transition-all"
                >
                  Download Certificate
                </button>
              )}
              <button
                onClick={() => navigate("/student/orientations")}
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                Back to Sessions
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const question = quiz.questions[current];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-500">Pass mark: {quiz.passMark}%</p>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${
            isLowTime ? "bg-red-100 text-red-600 animate-pulse" : "bg-white text-gray-800 shadow-sm"
          }`}>
            <Clock className="w-5 h-5" />
            {mins}:{secs}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{answered}/{total} answered</span>
            <span>Q{current + 1} of {total}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6"
          >
            <div className="flex items-start gap-4 mb-6">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                {current + 1}
              </span>
              <p className="text-gray-900 font-medium text-lg leading-relaxed">
                {question.text}
              </p>
            </div>

            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                const isSelected = answers[question._id] === idx;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setAnswers((prev) => ({ ...prev, [question._id]: idx }))}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all ${
                        isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-gray-300 text-gray-400"
                      }`}>
                        {isSelected ? "✓" : String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium disabled:opacity-40 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Question Nav Dots */}
          <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
            {quiz.questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  idx === current
                    ? "bg-indigo-600 text-white"
                    : answers[q._id] !== undefined
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {current < total - 1 ? (
            <button
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              <Send className="w-4 h-4" /> Submit Quiz
            </button>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Quiz?</h3>
                <p className="text-gray-500 text-sm">
                  You've answered {answered} of {total} questions.
                  {answered < total && ` ${total - answered} question(s) unanswered.`}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Review
                </button>
                <button
                  onClick={() => { setShowConfirm(false); handleSubmit(); }}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
