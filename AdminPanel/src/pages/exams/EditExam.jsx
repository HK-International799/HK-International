// pages/exams/EditExam.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExam, updateExam } from "../../services/examService";
import AdminLayout from "../../components/layout/AdminLayout";

export default function EditExam() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    timeLimit: 60,
    passingScore: 40,
    maxAttempts: 1,
    allowReattempt: false,
    reattemptNewQuestions: true,
  });
  const [examInfo, setExamInfo] = useState(null);

  useEffect(() => {
    getExam(examId)
      .then((exam) => {
        setExamInfo(exam);
        setForm({
          title: exam.title || "",
          description: exam.description || "",
          timeLimit: exam.timeLimit || 60,
          passingScore: exam.passingScore || 40,
          maxAttempts: exam.maxAttempts || 1,
          allowReattempt: exam.allowReattempt || false,
          reattemptNewQuestions:
            exam.reattemptNewQuestions !== undefined
              ? exam.reattemptNewQuestions
              : true,
        });
      })
      .catch(() => setError("Failed to load exam"))
      .finally(() => setLoading(false));
  }, [examId]);

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      await updateExam(examId, {
        ...form,
        timeLimit: Number(form.timeLimit),
        passingScore: Number(form.passingScore),
        maxAttempts: Number(form.maxAttempts),
      });
      navigate("/exams");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading exam…</div>;

  return (
    <AdminLayout>
      <div style={styles.page}>
        <button
          type="button"
          onClick={() => navigate("/exams")}
          style={styles.backBtn}
        >
          ← Back to Exams
        </button>
        <h2 style={styles.heading}>Edit Exam</h2>

        {examInfo && (
          <div style={styles.infoBox}>
            <strong>Course:</strong>{" "}
            {examInfo.courseId?.title || examInfo.courseId?.name || "—"}{" "}
            &nbsp;|&nbsp;
            <strong>Questions:</strong> {examInfo.totalQuestions} &nbsp;|&nbsp;
            <em style={{ fontSize: 12, color: "#718096" }}>
              To change course or question pool, delete and recreate the exam.
            </em>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Basic Information</h3>

            <Field label="Exam Title *">
              <input
                name="title"
                value={form.title}
                onChange={handleField}
                style={styles.input}
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                value={form.description}
                onChange={handleField}
                style={styles.textarea}
                rows={2}
              />
            </Field>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Exam Settings</h3>

            <div style={styles.grid2}>
              <Field label="Time Limit (minutes) *">
                <input
                  type="number"
                  name="timeLimit"
                  min={1}
                  value={form.timeLimit}
                  onChange={handleField}
                  style={styles.input}
                  required
                />
              </Field>

              <Field label="Passing Score (%)">
                <input
                  type="number"
                  name="passingScore"
                  min={1}
                  max={100}
                  value={form.passingScore}
                  onChange={handleField}
                  style={styles.input}
                />
              </Field>

              <Field label="Max Attempts">
                <input
                  type="number"
                  name="maxAttempts"
                  min={1}
                  value={form.maxAttempts}
                  onChange={handleField}
                  style={styles.input}
                />
              </Field>
            </div>

            <div style={styles.checkRow}>
              <label>
                <input
                  type="checkbox"
                  name="allowReattempt"
                  checked={form.allowReattempt}
                  onChange={handleField}
                />
                &nbsp;Allow Reattempt
              </label>
              {form.allowReattempt && (
                <label style={{ marginLeft: 24 }}>
                  <input
                    type="checkbox"
                    name="reattemptNewQuestions"
                    checked={form.reattemptNewQuestions}
                    onChange={handleField}
                  />
                  &nbsp;New random questions per attempt
                </label>
              )}
            </div>
          </section>

          {error && <div style={styles.error}>{error}</div>}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={submitting}
              style={styles.submitBtn}
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/exams")}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: { maxWidth: 720, margin: "0 auto", padding: "24px 16px" },
  center: { textAlign: "center", padding: 40, color: "#718096" },
  backBtn: {
    background: "none",
    border: "none",
    color: "#3182ce",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    marginBottom: 8,
  },
  heading: { fontSize: 24, fontWeight: 700, marginBottom: 16 },
  infoBox: {
    background: "#ebf8ff",
    border: "1px solid #bee3f8",
    borderRadius: 6,
    padding: "10px 16px",
    marginBottom: 20,
    fontSize: 14,
    color: "#2b6cb0",
  },
  form: { display: "flex", flexDirection: "column", gap: 0 },
  section: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
    color: "#2d3748",
    marginTop: 0,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#4a5568",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
    resize: "vertical",
  },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    fontSize: 14,
  },
  submitBtn: {
    padding: "10px 28px",
    background: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  },
  cancelBtn: {
    padding: "10px 20px",
    background: "#edf2f7",
    color: "#4a5568",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 15,
  },
  error: {
    background: "#fff5f5",
    border: "1px solid #feb2b2",
    color: "#c53030",
    padding: "10px 16px",
    borderRadius: 6,
    marginBottom: 12,
  },
};
