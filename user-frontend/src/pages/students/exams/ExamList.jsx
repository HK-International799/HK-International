// src/pages/students/exams/ExamList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listActiveExams } from "../../../services/studentExamService";
import MainLayout from "../../../components/layout/MainLayout";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function getDifficultyConfig(passingScore) {
  if (passingScore >= 70) return { label: "Hard", classes: "bg-red-50 text-red-600 ring-1 ring-red-200" };
  if (passingScore >= 50) return { label: "Medium", classes: "bg-orange-50 text-orange-600 ring-1 ring-orange-200" };
  return { label: "Easy", classes: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" };
}

const ACCENT_GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-orange-500 to-rose-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-fuchsia-500 to-pink-500",
  "from-amber-500 to-orange-500",
];

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-1.5 bg-slate-200" />
      <div className="p-5">
        <div className="flex justify-between mb-3">
          <div className="h-5 w-24 bg-slate-100 rounded-full" />
          <div className="h-5 w-14 bg-slate-100 rounded-full" />
        </div>
        <div className="h-6 bg-slate-100 rounded mb-2" />
        <div className="h-6 w-3/4 bg-slate-100 rounded mb-5" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="px-5 py-3.5 border-t border-slate-50 bg-slate-50/60">
        <div className="h-10 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon, label, value, highlight }) {
  return (
    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
      <span className="text-sm">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-[13px] font-bold truncate ${highlight || "text-slate-800"}`}>{value}</p>
      </div>
    </div>
  );
}

// ── Exam Card ─────────────────────────────────────────────────────────────────
function ExamCard({ exam, onStart, index }) {
  const [hovered, setHovered] = useState(false);
  const courseName = exam.courseId?.title || exam.courseId?.name || "General";
  const difficulty = getDifficultyConfig(exam.passingScore);
  const gradient = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];
  const passingHighlight =
    exam.passingScore >= 70
      ? "text-red-600"
      : exam.passingScore >= 50
      ? "text-orange-600"
      : "text-emerald-600";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 cursor-pointer
        ${hovered ? "border-indigo-200 shadow-xl shadow-indigo-100 -translate-y-1" : "border-slate-100 shadow-sm"}`}
    >
      {/* Gradient top accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      {/* Card body */}
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ color: "var(--accent, #6366f1)", background: "rgba(99,102,241,0.08)" }}
          >
            {courseName}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${difficulty.classes}`}>
            {difficulty.label}
          </span>
        </div>

        <h3 className="text-[17px] font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
          {exam.title}
        </h3>

        {exam.description && (
          <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mb-4">
            {exam.description}
          </p>
        )}

        <div className={`grid grid-cols-2 gap-2 ${!exam.description ? "mt-3" : ""}`}>
          <StatChip icon="⏱" label="Duration" value={formatDuration(exam.timeLimit)} />
          <StatChip icon="📝" label="Questions" value={exam.totalQuestions} />
          <StatChip icon="🔄" label="Attempts" value={`${exam.maxAttempts} max`} />
          <StatChip icon="🎯" label="Passing" value={`${exam.passingScore}%`} highlight={passingHighlight} />
        </div>
      </div>

      {/* CTA footer */}
      <div className="px-5 py-3.5 border-t border-slate-50 bg-slate-50/60">
        <button
          onClick={onStart}
          className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300
            ${hovered
              ? `bg-gradient-to-r ${gradient} text-white shadow-md`
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
        >
          {hovered ? (
            <>Begin Exam <span className="text-base">→</span></>
          ) : (
            <><span className="text-base">▷</span> Start Exam</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    listActiveExams()
      .then(setExams)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = exams.filter((exam) => {
    const q = search.toLowerCase();
    return (
      exam.title.toLowerCase().includes(q) ||
      (exam.description || "").toLowerCase().includes(q) ||
      (exam.courseId?.title || exam.courseId?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 font-sans">
        {/* ── Page Header ────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 px-6 pt-10 pb-10 mb-8 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

          <div className="max-w-6xl mx-auto relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-xl shadow-lg shadow-orange-500/30">
                📚
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">My Exams</h1>
            </div>
            <p className="text-indigo-300 text-sm mb-6 ml-[52px]">
              Browse and attempt available exams for your enrolled courses.
            </p>

            {/* Search */}
            {!loading && !error && exams.length > 0 && (
              <div className="relative max-w-md">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 text-base pointer-events-none">🔍</span>
                <input
                  type="text"
                  placeholder="Search exams or courses…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-white placeholder-indigo-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/60 backdrop-blur-sm transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Content ──────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 pb-16">
          {/* Stats bar */}
          {!loading && !error && exams.length > 0 && (
            <div className="flex items-center gap-6 mb-6 px-5 py-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-indigo-600">{exams.length}</span>
                <span className="text-sm text-slate-500">Total Exams</span>
              </div>
              <div className="w-px h-5 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-sky-500">{filtered.length}</span>
                <span className="text-sm text-slate-500">Showing</span>
              </div>
              {search && (
                <>
                  <div className="w-px h-5 bg-slate-200" />
                  <span className="text-xs text-slate-400">
                    Results for "<span className="text-indigo-600 font-semibold">{search}</span>"
                  </span>
                </>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20 bg-white rounded-2xl border border-red-100 shadow-sm">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-red-600 mb-2">Failed to load exams</h3>
              <p className="text-slate-500 text-sm mb-5">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="text-5xl mb-4">{search ? "🔎" : "📭"}</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {search ? "No exams match your search" : "No exams available"}
              </h3>
              <p className="text-slate-500 text-sm mb-5">
                {search
                  ? "Try a different keyword or clear the search."
                  : "Check back later — your instructor may publish exams soon."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Exam grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((exam, i) => (
                <ExamCard
                  key={exam._id}
                  exam={exam}
                  index={i}
                  onStart={() => navigate(`/student/exams/${exam._id}/instructions`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}