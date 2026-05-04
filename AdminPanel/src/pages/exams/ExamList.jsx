// pages/exams/ExamList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listExams,
  toggleExam,
  deleteExam,
  regenerateQuestions,
} from "../../services/examService";
import AdminLayout from "../../components/layout/AdminLayout";

export default function ExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores exam id being acted upon

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = () => {
    setLoading(true);
    listExams()
      .then(setExams)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleToggle = async (id) => {
    setActionLoading(id + "_toggle");
    try {
      const res = await toggleExam(id);
      setExams((prev) =>
        prev.map((e) => (e._id === id ? { ...e, isActive: res.isActive } : e)),
      );
    } catch (err) {
      alert("Toggle failed: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete exam "${title}"? This cannot be undone.`))
      return;
    setActionLoading(id + "_delete");
    try {
      await deleteExam(id);
      setExams((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegenerate = async (id) => {
    if (
      !window.confirm(
        "Regenerate question pool? The current question set will be replaced.",
      )
    )
      return;
    setActionLoading(id + "_regen");
    try {
      const res = await regenerateQuestions(id);
      alert(`Question pool regenerated (${res.questionCount} questions).`);
    } catch (err) {
      alert("Regenerate failed: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div style={styles.center}>Loading exams…</div>;

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Exams</h2>
          <button
            onClick={() => navigate("/exams/create")}
            style={styles.createBtn}
          >
            + Create Exam
          </button>
        </div>

        {exams.length === 0 ? (
          <div style={styles.empty}>No exams yet. Create your first exam!</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  {[
                    "Title",
                    "Course",
                    "Questions",
                    "Time",
                    "Passing %",
                    "Max Attempts",
                    "Status",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{exam.title}</strong>
                      {exam.description && (
                        <div style={styles.desc}>{exam.description}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {exam.courseId?.title || exam.courseId?.name || "—"}
                    </td>
                    <td style={styles.td}>{exam.totalQuestions}</td>
                    <td style={styles.td}>{exam.timeLimit} min</td>
                    <td style={styles.td}>{exam.passingScore}%</td>
                    <td style={styles.td}>{exam.maxAttempts}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: exam.isActive ? "#c6f6d5" : "#e2e8f0",
                          color: exam.isActive ? "#276749" : "#718096",
                        }}
                      >
                        {exam.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {/* Reports */}
                        <button
                          onClick={() => navigate(`/exams/${exam._id}/report`)}
                          style={styles.reportBtn}
                        >
                          Reports
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/exams/${exam._id}/edit`)}
                          style={styles.editBtn}
                        >
                          Edit
                        </button>

                        {/* Regenerate questions */}
                        <button
                          onClick={() => handleRegenerate(exam._id)}
                          disabled={actionLoading === exam._id + "_regen"}
                          style={styles.regenBtn}
                          title="Re-shuffle question pool from course quizzes"
                        >
                          {actionLoading === exam._id + "_regen"
                            ? "…"
                            : "↺ Regen"}
                        </button>

                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(exam._id)}
                          disabled={actionLoading === exam._id + "_toggle"}
                          style={{
                            ...styles.toggleBtn,
                            background: exam.isActive ? "#fff5f5" : "#f0fff4",
                            color: exam.isActive ? "#c53030" : "#276749",
                          }}
                        >
                          {actionLoading === exam._id + "_toggle"
                            ? "…"
                            : exam.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(exam._id, exam.title)}
                          disabled={actionLoading === exam._id + "_delete"}
                          style={styles.deleteBtn}
                        >
                          {actionLoading === exam._id + "_delete"
                            ? "…"
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const styles = {
  page: { maxWidth: 1200, margin: "0 auto", padding: "24px 16px" },
  center: { textAlign: "center", padding: 40, color: "#718096" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: { fontSize: 22, fontWeight: 700, margin: 0 },
  empty: {
    textAlign: "center",
    padding: 60,
    color: "#a0aec0",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
  },
  createBtn: {
    padding: "10px 20px",
    background: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  tableWrap: {
    overflowX: "auto",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  thead: { background: "#f7fafc" },
  th: {
    padding: "12px 14px",
    textAlign: "left",
    fontWeight: 600,
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "10px 14px", verticalAlign: "middle" },
  desc: { fontSize: 11, color: "#718096", marginTop: 2 },
  badge: {
    padding: "3px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  actions: { display: "flex", gap: 4, flexWrap: "wrap" },
  reportBtn: {
    padding: "4px 10px",
    background: "#ebf8ff",
    color: "#2b6cb0",
    border: "1px solid #bee3f8",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
  },
  editBtn: {
    padding: "4px 10px",
    background: "#fefcbf",
    color: "#744210",
    border: "1px solid #faf089",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
  },
  regenBtn: {
    padding: "4px 10px",
    background: "#e9d8fd",
    color: "#553c9a",
    border: "1px solid #d6bcfa",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
  },
  toggleBtn: {
    padding: "4px 10px",
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
  },
  deleteBtn: {
    padding: "4px 10px",
    background: "#fff5f5",
    color: "#c53030",
    border: "1px solid #feb2b2",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
  },
};
