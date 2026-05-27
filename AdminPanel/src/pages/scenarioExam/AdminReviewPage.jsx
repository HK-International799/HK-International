
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  FileText,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getAttemptDetails,
  reviewAttempt,
  allowReattempt,
  aiCheckAttempt,
} from "../../services/scenarioExamService";

/* Feedback character limit — mirrors GEMINI_FEEDBACK_CHAR_LIMIT on the server.
   Reads from Vite env if provided, otherwise falls back to 500. */
const FEEDBACK_CHAR_LIMIT =
  Number(import.meta.env.VITE_GEMINI_FEEDBACK_CHAR_LIMIT) || 500;

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

  /* ---------------- AI CHECK STATE ---------------- */
  const [aiChecking, setAiChecking] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aiWarnings, setAiWarnings] = useState([]); // string[]

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
            isCorrect: sub.isCorrect === null ? null : Boolean(sub.isCorrect),
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

  /* ---------------- AI CHECK ---------------- */
  const handleAiCheck = async () => {
    setErr("");
    setMsg("");
    setAiWarnings([]);
    setAiChecking(true);

    try {
      const res = await aiCheckAttempt(aId);
      const { aiResults = [], warnings = [] } = res.data || {};

      // Map AI results into the reviews state (keyed by subQuestionId)
      setReviews((prev) => {
        const next = { ...prev };
        for (const qResult of aiResults) {
          for (const sub of qResult.subAnswers || []) {
            next[sub.subQuestionId] = {
              marksObtained: Number(sub.marksObtained) || 0,
              isCorrect: sub.isCorrect === null ? null : Boolean(sub.isCorrect),
              // Enforce char limit again client-side after AI fills it
              feedbackText: String(sub.feedbackText || "").slice(
                0,
                FEEDBACK_CHAR_LIMIT,
              ),
            };
          }
        }
        return next;
      });

      setAiWarnings(warnings);
      setShowConfirmModal(true);
    } catch (e) {
      setErr(e.response?.data?.message || "AI check failed");
    } finally {
      setAiChecking(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmitReview = async () => {
    setErr("");
    setMsg("");
    setSaving(true);

    try {
      const answers = questions.map((q) => {
        const original = (attempt.answers || []).find(
          (a) => String(a.questionId) === String(q._id),
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

      setShowConfirmModal(false);
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
    (attempt.answers || []).map((a) => [String(a.questionId), a]),
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

        <div className="flex items-start justify-between gap-4">
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

          {/* ── AI CHECK BUTTON ── */}
          <button
            onClick={handleAiCheck}
            disabled={aiChecking || isReadonly}
            title={
              isReadonly
                ? "Attempt is still in progress — AI check unavailable"
                : "Let Gemini auto-evaluate this attempt"
            }
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {aiChecking ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                AI Checking…
              </>
            ) : (
              <>
                <Sparkles size={14} />
                AI Check
              </>
            )}
          </button>
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

        {/* AI WARNINGS */}
        {aiWarnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-md text-sm">
            <div className="flex items-center gap-2 font-medium mb-1">
              <AlertTriangle size={14} />
              Some scenarios could not be auto-checked
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {aiWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
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
              ]),
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
                  const feedbackLen = (review.feedbackText || "").length;

                  return (
                    <div key={subQ._id} className="border-t pt-4 space-y-2">
                      {/* QUESTION */}
                      <p className="text-sm font-medium text-gray-800">
                        Q{q.questionNumber}.{index + 1} {subQ.questionText}
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
                        maxLength={FEEDBACK_CHAR_LIMIT}
                        value={review.feedbackText || ""}
                        onChange={(e) =>
                          updateReview(subQ._id, {
                            feedbackText: e.target.value.slice(
                              0,
                              FEEDBACK_CHAR_LIMIT,
                            ),
                          })
                        }
                        disabled={isReadonly}
                      />
                      {/* CHARACTER COUNTER */}
                      <div
                        className={`text-xs text-right ${
                          feedbackLen >= FEEDBACK_CHAR_LIMIT
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {feedbackLen}/{FEEDBACK_CHAR_LIMIT} chars
                      </div>
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

      {/* ─────────────── AI CONFIRMATION MODAL ─────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  AI Check Complete
                </h2>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* INFO TEXT */}
            <p className="text-sm text-gray-600">
              Gemini has read each scenario PDF and filled in the marks,
              correctness, and feedback for every sub-question. These are{" "}
              <span className="font-medium text-purple-700">drafts</span> —
              please review and edit any field before saving. Nothing has been
              saved yet.
            </p>

            {/* WARNINGS (inside modal) */}
            {aiWarnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-md text-sm">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <AlertTriangle size={14} />
                  {aiWarnings.length} scenario
                  {aiWarnings.length > 1 ? "s" : ""} need manual review
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  {aiWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* MODAL ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-sm rounded-md px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close &amp; Keep Editing
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md px-4 py-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Confirm &amp; Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
