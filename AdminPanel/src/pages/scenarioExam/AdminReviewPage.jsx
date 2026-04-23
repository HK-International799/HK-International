import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  FileText,
  CheckCircle2,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getAttemptDetails,
  reviewAttempt,
  allowReattempt,
} from "../../services/scenarioExamService";

export default function AdminReviewPage() {
  const { aId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState({}); // keyed by subQuestionId
  const [overallFeedback, setOverallFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  /* ---------------- LOAD ---------------- */
  const load = async () => {
    try {
      setLoading(true);
      const res = await getAttemptDetails(aId);
      const data = res.data;

      setAttempt(data.attempt);
      setQuestions(data.questions || []);
      setOverallFeedback(data.attempt.overallFeedback || "");

      // ✅ Prefill reviews (SUB QUESTION LEVEL)
      const init = {};

      for (const a of data.attempt.answers || []) {
        for (const sub of a.subAnswers || []) {
          init[sub.subQuestionId] = {
            marksObtained: sub.marksObtained || 0,
            isCorrect:
              sub.isCorrect === null ? null : Boolean(sub.isCorrect),
            feedbackText: sub.feedbackText || "",
          };
        }
      }

      setReviews(init);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load attempt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [aId]);

  /* ---------------- UPDATE REVIEW ---------------- */
  const updateReview = (subQId, patch) =>
    setReviews((prev) => ({
      ...prev,
      [subQId]: { ...(prev[subQId] || {}), ...patch },
    }));

  /* ---------------- SUBMIT ---------------- */
  const handleSubmitReview = async () => {
    setErr("");
    setMsg("");
    setSaving(true);

    try {
      const answers = questions.map((q) => {
        const original = (attempt.answers || []).find(
          (a) => String(a.questionId) === String(q._id)
        );

        return {
          questionId: q._id,
          subAnswers: (q.subQuestions || []).map((subQ) => ({
            subQuestionId: subQ._id,
            ...(reviews[subQ._id] || {}),
          })),
        };
      });

      await reviewAttempt(aId, { answers, overallFeedback });

      setMsg("Review saved successfully.");
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- REATTEMPT ---------------- */
  const handleAllowReattempt = async () => {
    if (!confirm("Allow this student to reattempt the exam?")) return;

    try {
      await allowReattempt(aId);
      setMsg("Reattempt allowed.");
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to allow reattempt");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-gray-500">Loading…</div>
      </AdminLayout>
    );
  }

  if (!attempt) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-600">{err || "Attempt not found"}</div>
      </AdminLayout>
    );
  }

  const answersByQ = new Map(
    (attempt.answers || []).map((a) => [String(a.questionId), a])
  );

  const isReadonly = attempt.status === "in_progress";

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            onClick={handleAllowReattempt}
            className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm rounded-md px-3 py-2"
          >
            <RefreshCw size={14} /> Allow Reattempt
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Review Attempt
          </h1>
          <p className="text-sm text-gray-500">
            Attempt #{attempt.attemptNumber} ·{" "}
            <span className="capitalize font-medium">
              {attempt.status.replace("_", " ")}
            </span>
          </p>
        </div>

        {/* ALERTS */}
        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
            {err}
          </div>
        )}
        {msg && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm flex items-center gap-2">
            <CheckCircle2 size={14} /> {msg}
          </div>
        )}

        {/* QUESTIONS */}
        <div className="space-y-5">
          {questions.map((q) => {
            const ans = answersByQ.get(String(q._id)) || {};

            const subAnswerMap = new Map(
              (ans.subAnswers || []).map((sa) => [
                String(sa.subQuestionId),
                sa,
              ])
            );

            return (
              <div
                key={q._id}
                className="bg-white border rounded-xl p-5 space-y-4 shadow-sm"
              >
                {/* QUESTION HEADER */}
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Scenario {q.questionNumber}
                    </h3>
                  </div>
                </div>

                {/* PDF */}
                {q.scenarioPdfUrl && (
                  <a
                    href={q.scenarioPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                  >
                    <FileText size={12} /> View Scenario PDF
                  </a>
                )}

                {/* SUB QUESTIONS */}
                {(q.subQuestions || []).map((subQ, index) => {
                  const subAns = subAnswerMap.get(String(subQ._id));
                  const review = reviews[subQ._id] || {};

                  return (
                    <div
                      key={subQ._id}
                      className="border-t pt-4 space-y-2"
                    >
                      {/* QUESTION */}
                      <p className="text-sm font-medium text-gray-800">
                        Q{q.questionNumber}.{index + 1}{" "}
                        {subQ.questionText}
                      </p>

                      {/* ANSWER */}
                      <div className="bg-gray-50 p-2 rounded text-sm text-gray-700">
                        {subAns?.answerText || (
                          <span className="text-gray-400 italic">
                            No answer
                          </span>
                        )}
                      </div>

                      {/* CONTROLS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="Marks"
                          className="border rounded p-2 text-sm"
                          value={review.marksObtained ?? 0}
                          onChange={(e) =>
                            updateReview(subQ._id, {
                              marksObtained: Number(e.target.value),
                            })
                          }
                          disabled={isReadonly}
                        />

                        <select
                          className="border rounded p-2 text-sm"
                          value={
                            review.isCorrect === null ||
                            review.isCorrect === undefined
                              ? ""
                              : review.isCorrect
                                ? "true"
                                : "false"
                          }
                          onChange={(e) =>
                            updateReview(subQ._id, {
                              isCorrect:
                                e.target.value === ""
                                  ? null
                                  : e.target.value === "true",
                            })
                          }
                          disabled={isReadonly}
                        >
                          <option value="">Not set</option>
                          <option value="true">Correct</option>
                          <option value="false">Incorrect</option>
                        </select>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Feedback for student..."
                        className="w-full border rounded p-2 text-sm"
                        value={review.feedbackText || ""}
                        onChange={(e) =>
                          updateReview(subQ._id, {
                            feedbackText: e.target.value,
                          })
                        }
                        disabled={isReadonly}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* OVERALL */}
        <div className="bg-white border rounded-lg p-5 space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Overall Feedback
          </label>

          <textarea
            rows={3}
            className="w-full border rounded p-2 text-sm"
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            disabled={isReadonly}
          />

          <button
            onClick={handleSubmitReview}
            disabled={saving || isReadonly}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md px-4 py-2 disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? "Saving…" : "Save Review"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}