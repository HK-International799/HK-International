
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Loader2,
  AlertCircle,
  Trophy,
  XCircle,
  Star,
  Award,
  RotateCcw,
} from "lucide-react";
import {
  getCourseChapters,
  submitChapterQuiz,
  getChapterQuiz,
  getCourseById,
} from "../../services/studentService";
import DocumentModal from "./studentComponent/DocumentModal";

/* ================================================================
   getGradeTier — derives grade tier from a result object.
   Supports both new results (with .grade) and legacy ones (percentage only).
================================================================ */
function getGradeTier(result) {
  if (result.grade) return result.grade;
  // Fallback for legacy results that don't have .grade
  if (result.percentage >= 70) return "distinction";
  if (result.percentage >= 60) return "pass";
  return "below_pass";
}

/* ================================================================
   ResultCard — 3-tier result display

   Tier       Threshold   Icon    Color
   ─────────────────────────────────────────────
   Distinction  ≥ 70%     Trophy  Yellow/Gold
   Pass         ≥ 60%     Award   Green
   Below Pass   < 60%     XCircle Orange/Red
   ─────────────────────────────────────────────
   Next chapter is ALWAYS unlocked after any attempt.
================================================================ */
function ResultCard({ result, isPersisted = false }) {
  const { score, totalMarks, percentage } = result;
  const grade = getGradeTier(result);

  const tierConfig = {
    distinction: {
      icon: <Trophy className="w-12 h-12 text-yellow-500 mb-2" />,
      heading: "Distinction! 🏆",
      subtext: "You've met the IOSH Level 3 standard (70%+).",
      badgeClass: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      barClass: "bg-gradient-to-r from-yellow-400 to-yellow-500",
      cardClass: "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200",
      badge: "DISTINCTION",
    },
    pass: {
      icon: <Award className="w-12 h-12 text-green-500 mb-2" />,
      heading: "Quiz Passed! ✅",
      subtext: "Next chapter unlocked. Score 70%+ to meet IOSH Level 3 criteria.",
      badgeClass: "bg-green-100 text-green-700 border border-green-300",
      barClass: "bg-gradient-to-r from-green-400 to-emerald-500",
      cardClass: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
      badge: "PASS",
    },
    below_pass: {
      icon: <XCircle className="w-12 h-12 text-orange-400 mb-2" />,
      heading: "Quiz Complete",
      subtext: "Next chapter unlocked. Aim for 60%+ to pass and 70%+ for IOSH Level 3.",
      badgeClass: "bg-orange-100 text-orange-700 border border-orange-300",
      barClass: "bg-gradient-to-r from-orange-400 to-red-400",
      cardClass: "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200",
      badge: "BELOW PASS",
    },
  };

  const cfg = tierConfig[grade];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border p-5 ${cfg.cardClass}`}
    >
      {/* Icon + heading */}
      <div className="flex flex-col items-center text-center mb-4">
        {cfg.icon}
        <p className="text-lg font-bold text-gray-800">{cfg.heading}</p>
        <p className="text-sm text-gray-500 mt-0.5 max-w-xs">{cfg.subtext}</p>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-center gap-8 py-3 bg-white/70 rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-black text-gray-800">
            {score}
            <span className="text-sm font-medium text-gray-400">
              /{totalMarks}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Score</p>
        </div>

        <div className="w-px h-10 bg-gray-200" />

        <div className="text-center">
          <p className="text-2xl font-black text-gray-800">{percentage}%</p>
          <p className="text-xs text-gray-400 mt-0.5">Percentage</p>
        </div>

        <div className="w-px h-10 bg-gray-200" />

        <div className="text-center">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.badgeClass}`}>
            {cfg.badge}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`h-full rounded-full ${cfg.barClass}`}
        />
      </div>

      {/* IOSH threshold markers */}
      <div className="relative mt-1 w-full">
        {/* 60% marker */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: "60%", transform: "translateX(-50%)" }}
        >
          <div className="w-px h-2 bg-green-400" />
          <span className="text-[10px] text-green-600 font-medium mt-0.5">60% Pass</span>
        </div>
        {/* 70% marker */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: "70%", transform: "translateX(-50%)" }}
        >
          <div className="w-px h-2 bg-yellow-500" />
          <span className="text-[10px] text-yellow-600 font-medium mt-0.5">70% IOSH L3</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================
   QuizPanel — loads & displays the quiz questions.
   Calls onSubmit(result) with { score, totalMarks, percentage, passed, grade }
================================================================ */
function QuizPanel({ chapterId, onSubmit }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getChapterQuiz(chapterId)
      .then(({ quiz: q }) => setQuiz(q))
      .catch(() => setError("Failed to load quiz"))
      .finally(() => setLoading(false));
  }, [chapterId]);

  const allAnswered =
    quiz?.questions?.length > 0 &&
    quiz.questions.every((q) => answers[q._id]);

  const handleSubmit = async () => {
    const formattedAnswers = quiz.questions.map((q) => ({
      questionId: q._id,
      selectedOption: answers[q._id] || "",
    }));
    setSubmitting(true);
    try {
      const result = await submitChapterQuiz(chapterId, formattedAnswers);
      onSubmit(result); // bubble up to ChapterContent
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );

  if (error)
    return (
      <div className="text-center py-6">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-3 text-xs text-orange-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );

  if (!quiz)
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No quiz for this chapter.</p>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-orange-500" />
          {quiz.title || "Chapter Quiz"}
        </h4>
        <span className="text-xs text-gray-400">
          {quiz.questions?.length} question
          {quiz.questions?.length !== 1 ? "s" : ""}
          {quiz.totalMarks > 0 && ` · ${quiz.totalMarks} marks`}
        </span>
      </div>

      {quiz.questions?.map((q, idx) => (
        <div key={q._id} className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {idx + 1}. {q.prompt}
          </p>
          <div className="grid gap-2">
            {q.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [q._id]: opt }))
                }
                className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                  answers[q._id] === opt
                    ? "bg-orange-500 border-orange-500 text-white font-medium"
                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Quiz"
        )}
      </button>
    </div>
  );
}

/* ================================================================
   ChapterContent
   Controls 3 views inside an open chapter:

   "start"  → "Take Quiz" button (never attempted)
   "quiz"   → QuizPanel with questions
   "result" → ResultCard after submission

   Completed chapters open straight to "result" using lastResult.

   NOTE: Next chapter is ALWAYS unlocked after any quiz attempt.
         The retry option is available for improvement but does NOT
         affect locking — the student can always proceed.
================================================================ */
function ChapterContent({ chapter, isCompleted, refreshProgress, lastResult }) {
  const [docModal, setDocModal] = useState(false);
  const docUrl = chapter.documentUrl || null;

  // Start on result view if chapter already done
  const [view, setView] = useState(isCompleted ? "result" : "start");

  // Holds whichever result is currently on screen
  const [currentResult, setCurrentResult] = useState(
    isCompleted ? lastResult : null
  );

  const handleQuizSubmit = (result) => {
    setCurrentResult(result);
    setView("result");
    // Always refresh progress (next chapter is now unlocked)
    setTimeout(() => refreshProgress?.(), 800);
  };

  const grade = currentResult ? getGradeTier(currentResult) : null;

  return (
    <>
      {docModal && docUrl && (
        <DocumentModal
          url={docUrl}
          name={chapter.documentName}
          onClose={() => setDocModal(false)}
        />
      )}

      <div className="border-t border-gray-100 px-5 py-5 space-y-5">

        {/* ── Document section ──────────────────────────────── */}
        {docUrl ? (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <p className="font-semibold text-blue-800 text-sm">
                Chapter Material
              </p>
            </div>
            <p className="text-xs text-blue-600">
              {chapter.documentName || "Study document"}
            </p>
            <button
              onClick={() => setDocModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              View Document
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 text-center text-sm text-gray-400">
            No document uploaded for this chapter
          </div>
        )}

        {/* ── Quiz section ──────────────────────────────────── */}
        {chapter.quizId ? (
          <AnimatePresence mode="wait">

            {/* VIEW: result ──────────────────────────────────── */}
            {view === "result" && currentResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* Score card */}
                <ResultCard
                  result={currentResult}
                  isPersisted={isCompleted && currentResult === lastResult}
                />

                {/* Chapter unlocked confirmation */}
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700 font-medium">
                    {isCompleted && currentResult === lastResult
                      ? "Chapter completed! Next chapter is unlocked."
                      : "Chapter complete! The next chapter is now unlocked."}
                  </p>
                </div>

                {/* Retry option — available for all tiers (improvement only, not for unlocking) */}
                {grade !== "distinction" && (
                  <button
                    onClick={() => {
                      setCurrentResult(null);
                      setView("quiz");
                    }}
                    className="w-full py-2.5 border border-orange-300 text-orange-600 rounded-xl font-medium text-sm hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {grade === "pass"
                      ? "Retake to achieve Distinction (70%+)"
                      : "Retake to improve your score"}
                  </button>
                )}
              </motion.div>
            )}

            {/* VIEW: quiz ────────────────────────────────────── */}
            {view === "quiz" && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >
                <QuizPanel
                  chapterId={chapter._id}
                  onSubmit={handleQuizSubmit}
                />
              </motion.div>
            )}

            {/* VIEW: start ───────────────────────────────────── */}
            {view === "start" && (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  onClick={() => setView("quiz")}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Take Chapter Quiz to Unlock Next
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-4 py-3 text-center text-sm text-gray-500">
            No quiz for this chapter — it is always accessible
          </div>
        )}

      </div>
    </>
  );
}

/* ================================================================
   ChapterCard
================================================================ */
function ChapterCard({
  chapter,
  index,
  isCompleted,
  isLocked,
  isActive,
  onOpen,
  refreshProgress,
  lastResult,
}) {
  // Derive grade tier for the badge in the collapsed card list
  const grade = lastResult ? getGradeTier(lastResult) : null;

  const gradeBadgeClass = {
    distinction: "text-yellow-700 bg-yellow-100",
    pass: "text-green-700 bg-green-100",
    below_pass: "text-orange-700 bg-orange-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border transition-all ${
        isActive
          ? "border-orange-300 shadow-md shadow-orange-100"
          : isCompleted
          ? "border-green-200 bg-green-50/40"
          : isLocked
          ? "border-gray-100 bg-gray-50 opacity-60"
          : "border-gray-200 bg-white hover:border-orange-200 hover:shadow-sm"
      }`}
    >
      <button
        onClick={() => !isLocked && onOpen(chapter)}
        disabled={isLocked}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
            isCompleted
              ? "bg-green-500 text-white"
              : isLocked
              ? "bg-gray-200 text-gray-400"
              : isActive
              ? "bg-orange-500 text-white"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            index + 1
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold truncate ${
              isLocked ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {chapter.title}
          </p>
          {chapter.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {chapter.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {chapter.documentUrl && (
              <span className="text-xs text-blue-500 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Document
              </span>
            )}
            {chapter.quizId && (
              <span className="text-xs text-orange-500 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Quiz
              </span>
            )}
            {/* Grade badge — visible in the collapsed chapter list */}
            {isCompleted && lastResult && grade && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gradeBadgeClass[grade]}`}
              >
                {lastResult.score}/{lastResult.totalMarks} &middot;{" "}
                {lastResult.percentage}%
                {grade === "distinction" && " 🏆"}
                {grade === "pass" && " ✅"}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          {isLocked ? (
            <Lock className="w-4 h-4 text-gray-300" />
          ) : isActive ? (
            <ChevronDown className="w-4 h-4 text-orange-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-300" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ChapterContent
              chapter={chapter}
              isCompleted={isCompleted}
              refreshProgress={refreshProgress}
              lastResult={lastResult}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ================================================================
   CoursePlayer — page root
================================================================ */
export default function CoursePlayer() {
  const { id: courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [chapterResults, setChapterResults] = useState({});
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = async () => {
    try {
      const [courseData, chapterData] = await Promise.all([
        getCourseById(courseId),
        getCourseChapters(courseId),
      ]);
      setCourse(courseData);
      setChapters(chapterData.chapters || []);
      setCompletedIds(new Set(chapterData.completedChapters || []));
      setChapterResults(chapterData.chapterResults || {});

      const firstIncomplete = (chapterData.chapters || []).find(
        (c) => !(chapterData.completedChapters || []).includes(c._id)
      );
      if (firstIncomplete) setActiveChapterId(firstIncomplete._id);
      else if (chapterData.chapters?.length > 0)
        setActiveChapterId(chapterData.chapters[0]._id);
    } catch (err) {
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [courseId]);

  const refreshProgress = async () => {
    try {
      const data = await getCourseChapters(courseId);
      setCompletedIds(new Set(data.completedChapters || []));
      setChapters(data.chapters || []);
      setChapterResults(data.chapterResults || {});
    } catch {
      /* silent */
    }
  };

  const isChapterLocked = (index) => {
    if (index === 0) return false;
    const prev = chapters[index - 1];
    if (!prev?.quizId) return false;
    // Locked only if the previous chapter hasn't been attempted at all
    return !completedIds.has(prev._id);
  };

  const handleOpenChapter = (chapter) => {
    setActiveChapterId((prev) =>
      prev === chapter._id ? null : chapter._id
    );
  };

  const completedCount = chapters.filter((c) =>
    completedIds.has(c._id)
  ).length;
  const progressPercent =
    chapters.length > 0
      ? Math.round((completedCount / chapters.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/student/courses"
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition text-sm flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">My Courses</span>
            </Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <h1 className="font-semibold text-gray-800 text-sm truncate">
                {course?.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6 }}
                  className={`h-full rounded-full ${
                    progressPercent >= 100 ? "bg-green-500" : "bg-orange-500"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600">
                {progressPercent}%
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {completedCount}/{chapters.length} done
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {course?.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {course.description}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Course Chapters
          </h2>
          <p className="text-sm text-gray-400">
            Complete each chapter's quiz to unlock the next
          </p>
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No chapters yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your instructor hasn't added any chapters to this course.
            </p>
          </div>
        )}

        {chapters.map((chapter, idx) => {
          const locked = isChapterLocked(idx);
          const completed = completedIds.has(chapter._id);
          const active = activeChapterId === chapter._id && !locked;
          return (
            <ChapterCard
              key={chapter._id}
              chapter={chapter}
              index={idx}
              isCompleted={completed}
              isLocked={locked}
              isActive={active}
              onOpen={handleOpenChapter}
              refreshProgress={refreshProgress}
              lastResult={chapterResults[chapter._id] || null}
            />
          );
        })}

        <AnimatePresence>
          {progressPercent >= 100 && chapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 text-center shadow-xl shadow-green-200"
            >
              <Trophy className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
              <p className="font-bold text-lg">Course Complete! 🎉</p>
              <p className="text-sm text-green-100 mt-1">
                You've finished all chapters.
              </p>
              <Link
                to="/student/certificates"
                className="mt-4 inline-block bg-white text-green-700 px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition"
              >
                View Certificates
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}