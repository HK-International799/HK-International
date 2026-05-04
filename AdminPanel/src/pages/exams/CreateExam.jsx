// pages/exams/CreateExam.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  createExam,
  listCourses,
  getCourseQuestionCount,
} from "../../services/examService";
import AdminLayout from "../../components/layout/AdminLayout";

const LABELS = ["A", "B", "C", "D"];

// ── Manual Question Row ────────────────────────────────────────────────────────
function ManualQuestionRow({ index, question, onChange, onRemove }) {
  const handleOption = (i, value) => {
    const opts = [...question.options];
    opts[i] = { ...opts[i], text: value };
    onChange(index, "options", opts);
  };

  return (
    <div style={styles.manualCard}>
      <div style={styles.rowBetween}>
        <strong style={{ fontSize: 14 }}>Question {index + 1}</strong>
        <button
          style={styles.removeBtn}
          type="button"
          onClick={() => onRemove(index)}
        >
          ✕ Remove
        </button>
      </div>

      <textarea
        placeholder="Question text *"
        value={question.questionText}
        onChange={(e) => onChange(index, "questionText", e.target.value)}
        style={styles.textarea}
        rows={2}
      />

      <div style={styles.optionsGrid}>
        {question.options.map((opt, i) => (
          <div key={i} style={styles.optionRow}>
            <span style={styles.optionLabel}>{opt.label})</span>
            <input
              placeholder={`Option ${opt.label} *`}
              value={opt.text}
              onChange={(e) => handleOption(i, e.target.value)}
              style={styles.optionInput}
            />
          </div>
        ))}
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Correct Answer *</label>
        <select
          value={question.correctAnswer}
          onChange={(e) => onChange(index, "correctAnswer", e.target.value)}
          style={{ ...styles.select, width: 80 }}
        >
          <option value="">—</option>
          {LABELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <label style={{ ...styles.label, marginLeft: 16 }}>Marks</label>
        <input
          type="number"
          min={1}
          value={question.marks}
          onChange={(e) => onChange(index, "marks", Number(e.target.value))}
          style={{ ...styles.input, width: 64 }}
        />

        <label style={{ ...styles.label, marginLeft: 16 }}>Neg. Marks</label>
        <input
          type="number"
          min={0}
          step={0.25}
          value={question.negativeMarks}
          onChange={(e) =>
            onChange(index, "negativeMarks", Number(e.target.value))
          }
          style={{ ...styles.input, width: 64 }}
        />
      </div>

      <input
        placeholder="Explanation (optional)"
        value={question.explanation}
        onChange={(e) => onChange(index, "explanation", e.target.value)}
        style={{ ...styles.input, marginTop: 8 }}
      />
    </div>
  );
}

function blankManualQuestion() {
  return {
    questionText: "",
    options: LABELS.map((label) => ({ label, text: "" })),
    correctAnswer: "",
    explanation: "",
    marks: 1,
    negativeMarks: 0,
  };
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CreateExam() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    courseId: "",
    timeLimit: 60,
    totalQuestions: 10,
    passingScore: 40,
    maxAttempts: 1,
    allowReattempt: false,
    reattemptNewQuestions: true,
  });
  const [manualQuestions, setManualQuestions] = useState([]);
  const [availableCount, setAvailableCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listCourses().then(setCourses).catch(console.error);
  }, []);

  const fetchQuestionCount = useCallback(async (courseId) => {
    if (!courseId) {
      setAvailableCount(null);
      return;
    }
    setLoadingCount(true);
    try {
      const data = await getCourseQuestionCount(courseId);
      setAvailableCount(data.count);
    } catch {
      setAvailableCount(null);
    } finally {
      setLoadingCount(false);
    }
  }, []);

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((f) => ({ ...f, [name]: val }));
    if (name === "courseId") fetchQuestionCount(value);
  };

  const addManualQuestion = () =>
    setManualQuestions((q) => [...q, blankManualQuestion()]);

  const updateManualQuestion = (idx, field, value) => {
    setManualQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const removeManualQuestion = (idx) =>
    setManualQuestions((prev) => prev.filter((_, i) => i !== idx));

  const totalPool = (availableCount || 0) + manualQuestions.length;
  const required = Number(form.totalQuestions);
  const isCountValid = totalPool >= required;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.courseId) {
      setError("Please select a course.");
      return;
    }

    if (!isCountValid) {
      setError(
        `Not enough questions. Pool: ${totalPool}, Required: ${required}`,
      );
      return;
    }

    // Validate manual questions
    for (let i = 0; i < manualQuestions.length; i++) {
      const q = manualQuestions[i];
      if (!q.questionText.trim()) {
        setError(`Manual Q${i + 1}: question text is required`);
        return;
      }
      if (!q.correctAnswer) {
        setError(`Manual Q${i + 1}: correct answer is required`);
        return;
      }
      for (const opt of q.options) {
        if (!opt.text.trim()) {
          setError(`Manual Q${i + 1}: all option texts are required`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      await createExam({
        ...form,
        manualQuestions,
        totalQuestions: required,
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
        <h2 style={styles.heading}>Create New Exam</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* ── Basic Info ───────────────────────────────────────────────── */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Basic Information</h3>

            <Field label="Exam Title *">
              <input
                name="title"
                value={form.title}
                onChange={handleField}
                style={styles.input}
                required
                placeholder="e.g. Unit 1 Mock Test"
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                value={form.description}
                onChange={handleField}
                style={styles.textarea}
                rows={2}
                placeholder="Optional description shown to students"
              />
            </Field>

            <Field label="Course *">
              <select
                name="courseId"
                value={form.courseId}
                onChange={handleField}
                style={styles.select}
                required
              >
                <option value="">— Select a Course —</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title || c.name}
                  </option>
                ))}
              </select>

              {form.courseId && (
                <div
                  style={{
                    ...styles.hint,
                    color: availableCount === 0 ? "#e53e3e" : "#718096",
                  }}
                >
                  {loadingCount
                    ? "Fetching question count…"
                    : availableCount !== null
                      ? `✅ ${availableCount} questions available from course quizzes`
                      : "⚠️ Could not fetch question count"}
                </div>
              )}
            </Field>
          </section>

          {/* ── Exam Settings ───────────────────────────────────────────── */}
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

              <Field label={`Questions to Select * (Pool: ${totalPool})`}>
                <input
                  type="number"
                  name="totalQuestions"
                  min={1}
                  value={form.totalQuestions}
                  onChange={handleField}
                  style={{
                    ...styles.input,
                    borderColor:
                      !isCountValid && form.courseId ? "#e53e3e" : undefined,
                  }}
                  required
                />
                {!isCountValid && form.courseId && (
                  <div style={{ ...styles.hint, color: "#e53e3e" }}>
                    Need {required}, have {totalPool}
                  </div>
                )}
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

          {/* ── Manual Questions ─────────────────────────────────────────── */}
          <section style={styles.section}>
            <div style={styles.rowBetween}>
              <div>
                <h3 style={styles.sectionTitle}>
                  Manual Questions ({manualQuestions.length})
                </h3>
                <p style={styles.hint}>
                  These questions are added on top of the randomly selected
                  course questions.
                </p>
              </div>
              <button
                type="button"
                onClick={addManualQuestion}
                style={styles.addBtn}
              >
                + Add Question
              </button>
            </div>

            {manualQuestions.map((q, i) => (
              <ManualQuestionRow
                key={i}
                index={i}
                question={q}
                onChange={updateManualQuestion}
                onRemove={removeManualQuestion}
              />
            ))}
          </section>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={submitting || !form.courseId || !isCountValid}
            style={{
              ...styles.submitBtn,
              opacity: submitting || !form.courseId || !isCountValid ? 0.6 : 1,
              cursor:
                submitting || !form.courseId || !isCountValid
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {submitting ? "Creating…" : "Create Exam"}
          </button>
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
  page: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  backBtn: {
    background: "none",
    border: "none",
    color: "#3182ce",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    marginBottom: 8,
  },
  heading: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
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
  select: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    fontSize: 14,
    background: "#fff",
  },
  hint: { fontSize: 12, color: "#718096", marginTop: 4 },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    fontSize: 14,
  },
  manualCard: {
    border: "1px solid #bee3f8",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    background: "#ebf8ff",
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  row: {
    display: "flex",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
    gap: 6,
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    margin: "8px 0",
  },
  optionRow: { display: "flex", alignItems: "center", gap: 6 },
  optionLabel: { fontWeight: 700, minWidth: 20, fontSize: 14 },
  optionInput: {
    flex: 1,
    padding: "6px 10px",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    fontSize: 13,
  },
  addBtn: {
    padding: "8px 16px",
    background: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  removeBtn: {
    padding: "4px 10px",
    background: "#fed7d7",
    color: "#c53030",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
  },
  submitBtn: {
    padding: "12px 32px",
    background: "#38a169",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    alignSelf: "flex-start",
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
