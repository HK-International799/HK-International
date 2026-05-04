// pages/exams/ExamReport.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getExam,
  getExamReport,
  getAttemptDetail,
  addFeedback,
  downloadExamReport,
} from "../../services/examService";
import AdminLayout from "../../components/layout/AdminLayout";

export default function ExamReport() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [report, setReport] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [detail, setDetail] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  useEffect(() => {
    Promise.all([getExam(examId), getExamReport(examId)])
      .then(([e, r]) => {
        setExam(e);
        setReport(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [examId]);

  const openDetail = async (row) => {
    setSelectedAttempt(row);
    setFeedbackText(row.feedback?.text || "");
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await getAttemptDetail(examId, row.attemptId);
      setDetail(d);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim() || !selectedAttempt) return;
    setFeedbackSaving(true);
    try {
      await addFeedback(examId, selectedAttempt.attemptId, feedbackText);
      setReport((r) => ({
        ...r,
        report: r.report.map((row) =>
          row.attemptId === selectedAttempt.attemptId
            ? { ...row, feedback: { text: feedbackText } }
            : row,
        ),
      }));
      alert("Feedback saved successfully.");
    } catch (e) {
      alert("Failed to save feedback: " + e.message);
    } finally {
      setFeedbackSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadExamReport(examId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `exam-report-${examId}.csv`; // filename
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download report");
    }
  };

  if (loading) return <div style={styles.center}>Loading report…</div>;
  if (!report) return <div style={styles.center}>Report not found.</div>;

  const rows = report.report || [];

  return (
    <AdminLayout>
      <div style={styles.page}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>
        <div style={styles.rowBetween}>
          <h2 style={styles.heading}>Exam Report: {exam?.title || ""}</h2>

          <button onClick={handleDownload} style={styles.downloadBtn} className="bg-indigo-600 rounded-2xl p-1 border border-indigo-600 hover:bg-orange-600 hover:border-indigo-950">
             Download Report
          </button>
        </div>
        {/* ── Summary Stats ─────────────────────────────────────────────── */}
        <div style={styles.stats}>
          <Stat label="Total Attempts" value={report.totalAttempts} />
          <Stat
            label="Passed"
            value={rows.filter((r) => r.isPassed).length}
            color="#38a169"
          />
          <Stat
            label="Failed"
            value={rows.filter((r) => !r.isPassed).length}
            color="#e53e3e"
          />
          <Stat
            label="Avg Score"
            value={
              rows.length
                ? Math.round(
                    rows.reduce((s, r) => s + (r.percentage || 0), 0) /
                      rows.length,
                  ) + "%"
                : "—"
            }
          />
        </div>

        {/* ── Attempts Table ───────────────────────────────────────────── */}
        {rows.length === 0 ? (
          <div style={styles.empty}>No submissions yet.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  {[
                    "Student",
                    "Attempt #",
                    "Score",
                    "%",
                    "✓ Correct",
                    "✗ Wrong",
                    "— Skipped",
                    "Time",
                    "Result",
                    "Feedback",
                    "Detail",
                  ].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.attemptId} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{row.student?.name || "—"}</strong>
                      <br />
                      <small style={{ color: "#718096" }}>
                        {row.student?.email || ""}
                      </small>
                    </td>
                    <td style={styles.td}>{row.attemptNumber}</td>
                    <td style={styles.td}>
                      {row.score}/{row.totalMarks}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        color: row.isPassed ? "#38a169" : "#e53e3e",
                        fontWeight: 600,
                      }}
                    >
                      {row.percentage}%
                    </td>
                    <td style={{ ...styles.td, color: "#38a169" }}>
                      {row.correct}
                    </td>
                    <td style={{ ...styles.td, color: "#e53e3e" }}>
                      {row.incorrect}
                    </td>
                    <td style={{ ...styles.td, color: "#718096" }}>
                      {row.skipped}
                    </td>
                    <td style={styles.td}>{formatTime(row.timeTaken)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: row.isPassed ? "#c6f6d5" : "#fed7d7",
                          color: row.isPassed ? "#276749" : "#9b2c2c",
                        }}
                      >
                        {row.isPassed ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {row.feedback?.text ? (
                        <span
                          title={row.feedback.text}
                          style={{ cursor: "help" }}
                        >
                          ✅
                        </span>
                      ) : (
                        <span style={{ color: "#a0aec0" }}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => openDetail(row)}
                        style={styles.viewBtn}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Detail Panel ──────────────────────────────────────────────── */}
        {selectedAttempt && (
          <div style={styles.panel}>
            <div style={styles.rowBetween}>
              <h3 style={styles.sectionTitle}>
                {selectedAttempt.student?.name || "Student"} — Attempt{" "}
                {selectedAttempt.attemptNumber}
              </h3>
              <button
                onClick={() => {
                  setSelectedAttempt(null);
                  setDetail(null);
                }}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {/* Feedback */}
            <div style={styles.feedbackBox}>
              <label style={styles.label}>Admin Feedback</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                style={styles.textarea}
                rows={3}
                placeholder="Write feedback for this student…"
              />
              <button
                onClick={submitFeedback}
                disabled={feedbackSaving}
                style={styles.addBtn}
              >
                {feedbackSaving ? "Saving…" : "Save Feedback"}
              </button>
            </div>

            {/* Question breakdown */}
            {detailLoading ? (
              <div style={styles.center}>Loading details…</div>
            ) : detail ? (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 12, fontWeight: 600 }}>
                  Question-wise Breakdown
                </h4>
                {detail.questionBreakdown.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.qCard,
                      borderLeft: `4px solid ${
                        q.isCorrect
                          ? "#38a169"
                          : q.selectedOption
                            ? "#e53e3e"
                            : "#a0aec0"
                      }`,
                    }}
                  >
                    <div style={styles.rowBetween}>
                      <strong style={{ fontSize: 14 }}>Q{i + 1}.</strong>
                      <span
                        style={{
                          fontSize: 12,
                          color: q.isCorrect
                            ? "#38a169"
                            : q.selectedOption
                              ? "#e53e3e"
                              : "#718096",
                        }}
                      >
                        {q.isCorrect
                          ? "✓ Correct"
                          : q.selectedOption
                            ? "✗ Wrong"
                            : "— Skipped"}{" "}
                        ({q.marksAwarded > 0 ? "+" : ""}
                        {q.marksAwarded})
                      </span>
                    </div>

                    <p style={{ margin: "6px 0", fontSize: 14 }}>
                      {q.questionText}
                    </p>

                    <div style={styles.optionsList}>
                      {(q.options || []).map((opt) => {
                        const label = typeof opt === "string" ? opt : opt.label;
                        const text = typeof opt === "string" ? opt : opt.text;
                        const isCorrect = label === q.correctAnswer;
                        const isSelected = label === q.selectedOption;
                        return (
                          <span
                            key={label}
                            style={{
                              ...styles.optPill,
                              background: isCorrect
                                ? "#c6f6d5"
                                : isSelected
                                  ? "#fed7d7"
                                  : "#f7fafc",
                              fontWeight: isCorrect ? 600 : 400,
                              border: isSelected
                                ? "1px solid #fc8181"
                                : "1px solid #e2e8f0",
                            }}
                          >
                            {label}) {text}
                          </span>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p style={styles.explanation}>💡 {q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || "#2d3748" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

const styles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  center: { textAlign: "center", padding: 40, color: "#718096" },
  heading: { fontSize: 22, fontWeight: 700, margin: "8px 0 20px" },
  backBtn: {
    background: "none",
    border: "none",
    color: "#3182ce",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    marginBottom: 8,
  },
  stats: { display: "flex", gap: 16, marginBottom: 20 },
  statCard: {
    flex: 1,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "16px 20px",
    textAlign: "center",
  },
  empty: {
    textAlign: "center",
    padding: 40,
    color: "#a0aec0",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
  },
  tableWrap: {
    overflowX: "auto",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    marginBottom: 20,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  thead: { background: "#f7fafc" },
  th: {
    padding: "10px 12px",
    textAlign: "left",
    fontWeight: 600,
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "10px 12px", verticalAlign: "middle" },
  badge: {
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  viewBtn: {
    padding: "4px 10px",
    background: "#ebf8ff",
    color: "#2b6cb0",
    border: "1px solid #bee3f8",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: "#2d3748", margin: 0 },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#718096",
  },
  feedbackBox: {
    background: "#fffff0",
    border: "1px solid #fef08a",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#4a5568",
    marginBottom: 4,
  },
  textarea: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
    resize: "vertical",
  },
  addBtn: {
    marginTop: 8,
    padding: "6px 16px",
    background: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  qCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    background: "#fafafa",
  },
  optionsList: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 },
  optPill: { padding: "3px 10px", borderRadius: 14, fontSize: 13 },
  explanation: {
    fontSize: 12,
    color: "#4a5568",
    marginTop: 6,
    fontStyle: "italic",
  },
};
