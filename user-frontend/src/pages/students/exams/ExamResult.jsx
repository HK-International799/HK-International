// src/pages/students/exams/ExamResult.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAttemptResult } from "../../../services/studentExamService";
import MainLayout from "../../../components/layout/MainLayout";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Donut Chart (pure CSS/SVG) ────────────────────────────────────────────────
function DonutChart({ correct, incorrect, skipped, total }) {
  const size = 120;
  const r = 46;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  const correctPct = total > 0 ? correct / total : 0;
  const incorrectPct = total > 0 ? incorrect / total : 0;
  const skippedPct = total > 0 ? skipped / total : 0;

  // Dash offsets (start from top = -circ/4 rotation)
  const correctDash = correctPct * circ;
  const incorrectDash = incorrectPct * circ;
  const skippedDash = skippedPct * circ;

  const correctOffset = -(circ / 4);
  const incorrectOffset = correctOffset - correctDash;
  const skippedOffset = incorrectOffset - incorrectDash;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth={14}
      />

      {/* Correct */}
      {correct > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth={14}
          strokeDasharray={`${correctDash} ${circ}`}
          strokeDashoffset={correctOffset}
          strokeLinecap="butt"
        />
      )}
      {/* Incorrect */}
      {incorrect > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#ef4444"
          strokeWidth={14}
          strokeDasharray={`${incorrectDash} ${circ}`}
          strokeDashoffset={incorrectOffset}
          strokeLinecap="butt"
        />
      )}
      {/* Skipped */}
      {skipped > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#d1d5db"
          strokeWidth={14}
          strokeDasharray={`${skippedDash} ${circ}`}
          strokeDashoffset={skippedOffset}
          strokeLinecap="butt"
        />
      )}

      {/* Center text */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill="#111827"
      >
        {correct}
      </text>
      <text
        x={cx}
        y={cy + 11}
        textAnchor="middle"
        fontSize="10"
        fill="#6b7280"
        fontWeight="600"
      >
        correct
      </text>
    </svg>
  );
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ percentage, isPassed }) {
  const r = 58;
  const circ = 2 * Math.PI * r;
  const filled = (percentage / 100) * circ;
  const color = isPassed ? "#22c55e" : "#ef4444";

  return (
    <div
      style={{ position: "relative", display: "inline-block", lineHeight: 0 }}
    >
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={12}
        />
        <circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={`${filled} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{ fontSize: 28, fontWeight: 900, color: color, lineHeight: 1 }}
        >
          {percentage}%
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: isPassed ? "#16a34a" : "#dc2626",
            marginTop: 2,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {isPassed ? "PASSED" : "FAILED"}
        </span>
      </div>
    </div>
  );
}

// ── Question Breakdown ────────────────────────────────────────────────────────
function QuestionBreakdown({ questionBreakdown }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all"); // all | correct | incorrect | skipped

  const filtered = questionBreakdown.filter((q) => {
    if (filter === "correct") return q.isCorrect;
    if (filter === "incorrect") return !q.isCorrect && q.selectedOption;
    if (filter === "skipped") return !q.selectedOption;
    return true;
  });

  return (
    <div>
      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            key: "all",
            label: "All",
            count: questionBreakdown.length,
            color: "#6366f1",
          },
          {
            key: "correct",
            label: "Correct",
            count: questionBreakdown.filter((q) => q.isCorrect).length,
            color: "#22c55e",
          },
          {
            key: "incorrect",
            label: "Incorrect",
            count: questionBreakdown.filter(
              (q) => !q.isCorrect && q.selectedOption,
            ).length,
            color: "#ef4444",
          },
          {
            key: "skipped",
            label: "Skipped",
            count: questionBreakdown.filter((q) => !q.selectedOption).length,
            color: "#9ca3af",
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border:
                filter === tab.key
                  ? `2px solid ${tab.color}`
                  : "2px solid #e5e7eb",
              background: filter === tab.key ? `${tab.color}15` : "#fff",
              color: filter === tab.key ? tab.color : "#6b7280",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            {tab.label}
            <span
              style={{
                background: filter === tab.key ? tab.color : "#f3f4f6",
                color: filter === tab.key ? "#fff" : "#6b7280",
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 6px",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((q, i) => {
          const originalIdx = questionBreakdown.indexOf(q);
          const statusColor = q.isCorrect
            ? "#22c55e"
            : q.selectedOption
              ? "#ef4444"
              : "#9ca3af";
          const statusLabel = q.isCorrect
            ? "Correct"
            : q.selectedOption
              ? "Incorrect"
              : "Skipped";
          const isOpen = expanded === originalIdx;

          return (
            <div
              key={originalIdx}
              style={{
                border: `1px solid ${isOpen ? statusColor + "40" : "#e5e7eb"}`,
                borderLeft: `4px solid ${statusColor}`,
                borderRadius: 10,
                background: "#fff",
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}
            >
              {/* Collapsed row */}
              <button
                onClick={() => setExpanded(isOpen ? null : originalIdx)}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#374151",
                    flexShrink: 0,
                  }}
                >
                  Q{originalIdx + 1}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: "#374151",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {q.questionText}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: statusColor,
                    flexShrink: 0,
                    background: `${statusColor}15`,
                    padding: "3px 9px",
                    borderRadius: 20,
                  }}
                >
                  {statusLabel}
                  {q.marksAwarded !== 0 &&
                    ` (${q.marksAwarded > 0 ? "+" : ""}${q.marksAwarded})`}
                </span>
                <span style={{ color: "#9ca3af", fontSize: 16, flexShrink: 0 }}>
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div
                  style={{
                    padding: "0 18px 18px",
                    borderTop: "1px solid #f3f4f6",
                    paddingTop: 14,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 14px",
                      fontSize: 15,
                      color: "#111827",
                      fontWeight: 600,
                      lineHeight: 1.55,
                    }}
                  >
                    {q.questionText}
                  </p>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {q.options.map((opt) => {
                      const isCorrect = opt.label === q.correctAnswer;
                      const isSelected = opt.label === q.selectedOption;
                      const isWrongSelected = isSelected && !isCorrect;

                      return (
                        <div
                          key={opt.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: isCorrect
                              ? "#f0fdf4"
                              : isWrongSelected
                                ? "#fef2f2"
                                : "#f9fafb",
                            border: isCorrect
                              ? "1px solid #bbf7d0"
                              : isWrongSelected
                                ? "1px solid #fecaca"
                                : "1px solid #f3f4f6",
                          }}
                        >
                          <div
                            style={{
                              minWidth: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: isCorrect
                                ? "#22c55e"
                                : isWrongSelected
                                  ? "#ef4444"
                                  : "#e5e7eb",
                              color:
                                isCorrect || isWrongSelected
                                  ? "#fff"
                                  : "#6b7280",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: 11,
                              flexShrink: 0,
                            }}
                          >
                            {opt.label}
                          </div>
                          <span
                            style={{
                              fontSize: 13.5,
                              color: isCorrect
                                ? "#166534"
                                : isWrongSelected
                                  ? "#991b1b"
                                  : "#374151",
                              fontWeight:
                                isCorrect || isWrongSelected ? 600 : 400,
                              flex: 1,
                            }}
                          >
                            {opt.text}
                          </span>
                          <div
                            style={{
                              flexShrink: 0,
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {isCorrect && (
                              <span style={{ color: "#16a34a" }}>
                                ✓ Correct
                              </span>
                            )}
                            {isWrongSelected && (
                              <span style={{ color: "#dc2626" }}>
                                ✗ Your answer
                              </span>
                            )}
                            {isSelected && isCorrect && (
                              <span style={{ color: "#16a34a" }}>
                                ✓ Your answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: "11px 14px",
                        background: "#fefce8",
                        border: "1px solid #fef08a",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#713f12",
                        lineHeight: 1.5,
                      }}
                    >
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ExamResult() {
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    getAttemptResult(examId, attemptId)
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [examId, attemptId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI', sans-serif",
          gap: 14,
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            width: 44,
            height: 44,
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#64748b", fontSize: 14 }}>Loading your result…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: "40px 32px",
            textAlign: "center",
            maxWidth: 380,
            border: "1px solid #fecaca",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>
            Result not available
          </h3>
          <p style={{ color: "#6b7280", margin: "0 0 20px", fontSize: 14 }}>
            {error || "The result could not be loaded."}
          </p>
          <button
            onClick={() => navigate("/student/exams")}
            style={{
              padding: "10px 22px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ← Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const { attempt, questionBreakdown } = data;
  const r = attempt.result;

  return (
    <MainLayout>
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          fontFamily: "'Segoe UI', sans-serif",
          padding: "28px 20px 48px",
        }}
      >
        <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-card { animation: fadeUp 0.4s ease both; }
      `}</style>

        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* Back button */}
          <button
            onClick={() => navigate("/student/exams")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
              padding: 0,
            }}
          >
            ← Back to Exams
          </button>

          {/* ── Hero result card ─────────────────────────── */}
          <div
            className="result-card"
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              marginBottom: 20,
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            }}
          >
            {/* Gradient banner */}
            <div
              style={{
                background: r.isPassed
                  ? "linear-gradient(135deg, #14532d, #166534)"
                  : "linear-gradient(135deg, #7f1d1d, #991b1b)",
                padding: "28px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 20,
                    padding: "5px 14px",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  {r.isPassed ? "🎉 Congratulations!" : "💪 Keep Going!"}
                </div>
                <h1
                  style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  Attempt #{attempt.attemptNumber} Result
                </h1>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 13,
                  }}
                >
                  Submitted: {formatDate(attempt.submittedAt)}
                </p>
              </div>

              <ScoreRing percentage={r.percentage} isPassed={r.isPassed} />
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              {[
                {
                  label: "Total Marks",
                  value: `${r.marksObtained}/${r.totalMarks}`,
                  color: "#111827",
                },
                { label: "Correct", value: r.correct, color: "#16a34a" },
                { label: "Incorrect", value: r.incorrect, color: "#dc2626" },
                { label: "Skipped", value: r.skipped, color: "#9ca3af" },
                {
                  label: "Time Taken",
                  value: formatTime(r.timeTaken),
                  color: "#1d4ed8",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "18px 12px",
                    textAlign: "center",
                    borderRight: i < 4 ? "1px solid #f3f4f6" : "none",
                  }}
                >
                  <div
                    style={{ fontSize: 20, fontWeight: 800, color: s.color }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart row + feedback */}
            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                flexWrap: "wrap",
              }}
            >
              {/* Donut */}
              <DonutChart
                correct={r.correct}
                incorrect={r.incorrect}
                skipped={r.skipped}
                total={r.totalQuestions}
              />

              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  {
                    color: "#22c55e",
                    label: "Correct",
                    count: r.correct,
                    total: r.totalQuestions,
                  },
                  {
                    color: "#ef4444",
                    label: "Incorrect",
                    count: r.incorrect,
                    total: r.totalQuestions,
                  },
                  {
                    color: "#d1d5db",
                    label: "Skipped",
                    count: r.skipped,
                    total: r.totalQuestions,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        background: row.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{ fontSize: 13, color: "#374151", minWidth: 70 }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {row.count}
                    </span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>
                      (
                      {row.total > 0
                        ? Math.round((row.count / row.total) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                ))}
              </div>

              {/* Admin feedback */}
              {attempt.feedback?.text && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 220,
                    background: "#fefce8",
                    border: "1px solid #fef08a",
                    borderRadius: 12,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#a16207",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    📝 Instructor Feedback
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      color: "#713f12",
                      lineHeight: 1.55,
                    }}
                  >
                    {attempt.feedback.text}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                padding: "16px 28px",
                borderTop: "1px solid #f3f4f6",
                background: "#fafafa",
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => navigate("/student/exams")}
                style={{
                  padding: "10px 20px",
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#374151",
                }}
              >
                ← Back to Exams
              </button>

              <button
                onClick={() => setShowBreakdown((v) => !v)}
                style={{
                  padding: "10px 20px",
                  background: showBreakdown
                    ? "#6366f1"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {showBreakdown ? "Hide" : "📋 Show"} Question Breakdown
              </button>
            </div>
          </div>

          {/* ── Question Breakdown ──────────────────────── */}
          {showBreakdown && (
            <div
              className="result-card"
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #e5e7eb",
                padding: "24px 24px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 18px",
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                📖 Question-wise Breakdown
              </h2>
              <QuestionBreakdown questionBreakdown={questionBreakdown} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
