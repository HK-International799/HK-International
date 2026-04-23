// import { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "sonner";
// import { Save, Send, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
// import MainLayout from "../../components/layout/MainLayout";
// import Timer from "../../components/scenaroiExam/Timer";
// import PDFViewer from "../../components/scenaroiExam/PDFViewer";
// import DynamicAnswerForm from "../../components/scenaroiExam/DynamicAnswerForm";
// import QuestionNav from "../../components/scenaroiExam/QuestionNav";
// import {
//   getMyAttempt,
//   autosaveAttempt,
//   submitAttempt,
// } from "../../services/scenarioExamService";

// const AUTOSAVE_INTERVAL_MS = 30_000;

// export default function ExamPage() {
//   const { id: examId, attemptId } = useParams();
//   const navigate = useNavigate();

//   const [attempt, setAttempt] = useState(null);
//   const [exam, setExam] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [responses, setResponses] = useState({}); // keyed by questionId → { fieldId: value }
//   const [currentIdx, setCurrentIdx] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [lastSavedAt, setLastSavedAt] = useState(null);
//   const remainingRef = useRef(null);
//   const timeSpentRef = useRef(0);

//   /* ── Initial load ──────────────────────────── */
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getMyAttempt(attemptId);
//         setAttempt(res.data.attempt);
//         setExam(res.data.exam);
//         setQuestions(res.data.questions || []);

//         // Pre-populate responses from existing answers
//         const seed = {};
//         for (const a of res.data.attempt.answers || []) {
//           seed[String(a.questionId)] = a.responses || {};
//         }
//         setResponses(seed);
//       } catch (e) {
//         setErr(e.response?.data?.message || "Failed to load attempt");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [attemptId]);

//   /* ── Build payload for save/submit ─────────── */
//   const buildAnswersPayload = () =>
//     Object.entries(responses).map(([questionId, fieldValues]) => ({
//       questionId,
//       responses: fieldValues,
//     }));

//   /* ── Autosave every 30s ────────────────────── */
//   useEffect(() => {
//     if (!attempt || attempt.status !== "in_progress") return;

//     const doSave = async () => {
//       try {
//         setSaving(true);
//         await autosaveAttempt(attemptId, {
//           answers: buildAnswersPayload(),
//           timeSpent: timeSpentRef.current,
//         });
//         setLastSavedAt(new Date());
//       } catch {
//         // silent — will retry next tick
//       } finally {
//         setSaving(false);
//       }
//     };

//     const id = setInterval(doSave, AUTOSAVE_INTERVAL_MS);
//     return () => clearInterval(id);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [attempt, responses]);

//   /* ── Autosubmit when timer expires ─────────── */
//   const handleTimerExpire = async () => {
//     if (!attempt || attempt.status !== "in_progress") return;
//     toast.warning("Time is up — submitting your attempt");
//     await doSubmit(/* force */ true);
//   };

//   const handleTick = (remaining) => {
//     remainingRef.current = remaining;
//     if (exam) {
//       timeSpentRef.current = Math.max(0, exam.duration * 60 - remaining);
//     }
//   };

//   /* ── Manual save ───────────────────────────── */
//   const handleManualSave = async () => {
//     try {
//       setSaving(true);
//       await autosaveAttempt(attemptId, {
//         answers: buildAnswersPayload(),
//         timeSpent: timeSpentRef.current,
//       });
//       setLastSavedAt(new Date());
//       toast.success("Progress saved");
//     } catch (e) {
//       toast.error(e.response?.data?.message || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ── Submit ─────────────────────────────────── */
//   const doSubmit = async (force = false) => {
//     if (!force && !confirm("Submit your attempt? You won't be able to edit answers afterwards.")) {
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await submitAttempt(attemptId, {
//         answers: buildAnswersPayload(),
//         timeSpent: timeSpentRef.current,
//       });
//       toast.success("Attempt submitted. Awaiting admin review.");
//       navigate(`/exams/scenario/${examId}/attempt/${attemptId}/review`);
//     } catch (e) {
//       toast.error(e.response?.data?.message || "Submit failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   /* ── Answered set for nav ──────────────────── */
//   const answeredSet = useMemo(() => {
//     const s = new Set();
//     for (const [qid, vals] of Object.entries(responses)) {
//       const hasValue = Object.values(vals || {}).some(
//         (v) =>
//           v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
//       );
//       if (hasValue) s.add(String(qid));
//     }
//     return s;
//   }, [responses]);

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="text-gray-500 flex items-center gap-2">
//           <Loader2 className="animate-spin" size={16} /> Loading attempt…
//         </div>
//       </MainLayout>
//     );
//   }
//   if (!attempt) {
//     return (
//       <MainLayout>
//         <div className="text-red-600">{err || "Attempt not found"}</div>
//       </MainLayout>
//     );
//   }
//   if (attempt.status !== "in_progress") {
//     // already submitted or reviewed — redirect to review page
//     return (
//       <MainLayout>
//         <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md">
//           This attempt has already been submitted.{" "}
//           <button
//             className="underline"
//             onClick={() =>
//               navigate(
//                 `/exams/scenario/${examId}/attempt/${attemptId}/review`
//               )
//             }
//           >
//             View submission
//           </button>
//         </div>
//       </MainLayout>
//     );
//   }

//   const currentQ = questions[currentIdx];

//   return (
//     <MainLayout>
//       <div className="space-y-3">
//         {/* Top bar */}
//         <div className="flex flex-wrap items-center justify-between gap-2 bg-white border rounded-md p-3">
//           <div>
//             <h1 className="text-lg font-semibold text-gray-800">
//               {exam?.title}
//             </h1>
//             <div className="text-xs text-gray-500">
//               Attempt #{attempt.attemptNumber} ·{" "}
//               {lastSavedAt
//                 ? `Last saved ${lastSavedAt.toLocaleTimeString()}`
//                 : "Not saved yet"}
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <Timer
//               attemptId={attemptId}
//               durationMinutes={exam?.duration || 60}
//               startedAt={attempt.startedAt}
//               onExpire={handleTimerExpire}
//               onTick={handleTick}
//             />
//             <button
//               onClick={handleManualSave}
//               disabled={saving}
//               className="inline-flex items-center gap-1 text-sm border rounded-md px-3 py-1.5 bg-white hover:bg-gray-50 disabled:opacity-60"
//             >
//               <Save size={14} /> {saving ? "Saving…" : "Save"}
//             </button>
//             <button
//               onClick={() => doSubmit(false)}
//               disabled={submitting}
//               className="inline-flex items-center gap-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-3 py-1.5 disabled:opacity-60"
//             >
//               <Send size={14} /> {submitting ? "Submitting…" : "Submit"}
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3">
//           {/* Main question */}
//           <div className="space-y-3">
//             {currentQ ? (
//               <div className="bg-white border rounded-md p-4 space-y-4">
//                 <div>
//                   <div className="text-xs text-gray-500">
//                     Question {currentQ.questionNumber} of {questions.length}
//                   </div>
//                   <h2 className="text-base font-medium text-gray-800 mt-1">
//                     {currentQ.questionText}
//                   </h2>
//                   {currentQ.scenarioText && (
//                     <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
//                       {currentQ.scenarioText}
//                     </p>
//                   )}
//                 </div>

//                 {currentQ.scenarioPDF && (
//                   <PDFViewer url={currentQ.scenarioPDF} />
//                 )}

//                 <DynamicAnswerForm
//                   schema={currentQ.formSchema || []}
//                   value={responses[currentQ._id] || {}}
//                   onChange={(next) =>
//                     setResponses((prev) => ({
//                       ...prev,
//                       [currentQ._id]: next,
//                     }))
//                   }
//                 />

//                 <div className="flex items-center justify-between pt-2 border-t">
//                   <button
//                     onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
//                     disabled={currentIdx === 0}
//                     className="inline-flex items-center gap-1 text-sm border rounded-md px-3 py-1.5 bg-white hover:bg-gray-50 disabled:opacity-50"
//                   >
//                     <ChevronLeft size={14} /> Previous
//                   </button>
//                   <button
//                     onClick={() =>
//                       setCurrentIdx((i) =>
//                         Math.min(questions.length - 1, i + 1)
//                       )
//                     }
//                     disabled={currentIdx >= questions.length - 1}
//                     className="inline-flex items-center gap-1 text-sm border rounded-md px-3 py-1.5 bg-white hover:bg-gray-50 disabled:opacity-50"
//                   >
//                     Next <ChevronRight size={14} />
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-white border rounded-md p-4 text-sm text-gray-500">
//                 This exam has no questions configured.
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <QuestionNav
//             questions={questions}
//             currentId={currentQ?._id}
//             answeredSet={answeredSet}
//             onSelect={(qid) => {
//               const idx = questions.findIndex((q) => q._id === qid);
//               if (idx >= 0) setCurrentIdx(idx);
//             }}
//           />
//         </div>
//       </div>
//     </MainLayout>
//   );
// }





import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Save,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Timer from "../../components/scenaroiExam/Timer";
import PDFViewer from "../../components/scenaroiExam/PDFViewer";
import DynamicAnswerForm from "../../components/scenaroiExam/DynamicAnswerForm";
import QuestionNav from "../../components/scenaroiExam/QuestionNav";
import {
  getMyAttempt,
  autosaveAttempt,
  submitAttempt,
} from "../../services/scenarioExamService";

const AUTOSAVE_INTERVAL_MS = 30_000;

/**
 * responses shape:
 *   { [questionId]: { [subQuestionId]: answerText } }
 *
 * This maps to the backend's:
 *   answers: [{ questionId, subAnswers: [{ subQuestionId, answerText }] }]
 */
export default function ExamPage() {
  const { id: examId, attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  // { [questionId]: { [subQuestionId]: answerText } }
  const [responses, setResponses] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const timeSpentRef = useRef(0);

  /* ── Initial load ──────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await getMyAttempt(attemptId);
        setAttempt(res.data.attempt);
        setExam(res.data.exam);
        setQuestions(res.data.questions || []);

        // Seed responses from existing saved answers
        // Backend: answers[].subAnswers[].{ subQuestionId, answerText }
        const seed = {};
        for (const a of res.data.attempt?.answers || []) {
          const qId = String(a.questionId);
          seed[qId] = {};
          for (const sa of a.subAnswers || []) {
            seed[qId][String(sa.subQuestionId)] = sa.answerText || "";
          }
        }
        setResponses(seed);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load attempt");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  /* ── Build answers payload matching backend schema ─ */
  const buildAnswersPayload = () =>
    Object.entries(responses).map(([questionId, subMap]) => ({
      questionId,
      subAnswers: Object.entries(subMap).map(([subQuestionId, answerText]) => ({
        subQuestionId,
        answerText: answerText || "",
      })),
    }));

  /* ── Autosave every 30s ────────────────────────── */
  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;

    const doSave = async () => {
      try {
        setSaving(true);
        await autosaveAttempt(attemptId, {
          answers: buildAnswersPayload(),
          timeSpent: timeSpentRef.current,
        });
        setLastSavedAt(new Date());
      } catch {
        // silent — retry next interval
      } finally {
        setSaving(false);
      }
    };

    const id = setInterval(doSave, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, responses]);

  /* ── Timer callbacks ────────────────────────────── */
  const handleTimerExpire = async () => {
    if (!attempt || attempt.status !== "in_progress") return;
    toast.warning("Time is up — submitting your attempt");
    await doSubmit(true);
  };

  const handleTick = (remaining) => {
    if (exam) {
      timeSpentRef.current = Math.max(0, exam.duration * 60 - remaining);
    }
  };

  /* ── Manual save ────────────────────────────────── */
  const handleManualSave = async () => {
    try {
      setSaving(true);
      await autosaveAttempt(attemptId, {
        answers: buildAnswersPayload(),
        timeSpent: timeSpentRef.current,
      });
      setLastSavedAt(new Date());
      toast.success("Progress saved");
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Submit ─────────────────────────────────────── */
  const doSubmit = async (force = false) => {
    setSubmitting(true);
    setShowConfirm(false);
    try {
      await submitAttempt(attemptId, {
        answers: buildAnswersPayload(),
        timeSpent: timeSpentRef.current,
      });
      toast.success("Attempt submitted! Awaiting admin review.");
      navigate(`/exams/scenario/${examId}/attempt/${attemptId}/review`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Answered set for navigation ────────────────── */
  const answeredSet = useMemo(() => {
    const s = new Set();
    for (const [qid, subMap] of Object.entries(responses)) {
      const hasAny = Object.values(subMap || {}).some(
        (v) => v !== "" && v !== null && v !== undefined
      );
      if (hasAny) s.add(String(qid));
    }
    return s;
  }, [responses]);

  /* ── Loading / error states ─────────────────────── */
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Loading attempt…</span>
        </div>
      </MainLayout>
    );
  }

  if (!attempt) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {err || "Attempt not found"}
        </div>
      </MainLayout>
    );
  }

  if (attempt.status !== "in_progress") {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-2xl text-sm flex items-start gap-3">
            <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-blue-600" />
            <div>
              <p className="font-semibold mb-1">Attempt already submitted</p>
              <button
                className="underline text-blue-700 hover:text-blue-900"
                onClick={() =>
                  navigate(`/exams/scenario/${examId}/attempt/${attemptId}/review`)
                }
              >
                View your submission →
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = answeredSet.size;
  const totalQ = questions.length;

  return (
    <MainLayout>
      {/* Submit confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Submit Exam?</h3>
                <p className="text-xs text-gray-500">
                  {answeredCount}/{totalQ} scenarios answered
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Once submitted, you won't be able to edit your answers. They'll be
              sent for admin review.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => doSubmit(false)}
                disabled={submitting}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {submitting ? (
                  <><Loader2 size={13} className="animate-spin" /> Submitting…</>
                ) : (
                  <><Send size={13} /> Submit</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 pb-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <div>
            <h1 className="text-base font-bold text-gray-900">{exam?.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Attempt #{attempt.attemptNumber} ·{" "}
              {lastSavedAt
                ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : saving
                ? "Saving…"
                : "Not saved yet"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Timer
              attemptId={attemptId}
              durationMinutes={exam?.duration || 60}
              startedAt={attempt.startedAt}
              onExpire={handleTimerExpire}
              onTick={handleTick}
            />
            <button
              onClick={handleManualSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-sm border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 disabled:opacity-60 transition-colors font-medium text-gray-700"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 py-2 disabled:opacity-60 transition-colors font-medium"
            >
              <Send size={13} />
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>

        {/* Progress strip */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {answeredCount} of {totalQ} answered
          </span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: totalQ ? `${(answeredCount / totalQ) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs font-semibold text-indigo-600">
            {totalQ ? Math.round((answeredCount / totalQ) * 100) : 0}%
          </span>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
          {/* Question panel */}
          <div className="space-y-3">
            {currentQ ? (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Question header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-4 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-indigo-200 font-medium uppercase tracking-wider">
                      Scenario {currentQ.questionNumber} of {questions.length}
                    </span>
                    {currentQ.maxMarks > 0 && (
                      <span className="text-xs bg-white/20 rounded-full px-2.5 py-0.5 font-medium">
                        {currentQ.maxMarks} marks
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-indigo-100">
                    Read the scenario PDF below, then answer all sub-questions.
                  </p>
                </div>

                <div className="p-5 space-y-5">
                  {/* PDF viewer */}
                  <PDFViewer url={currentQ.scenarioPdfUrl} />

                  {/* Sub-questions / answer form */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </span>
                      Your Answers
                    </h3>
                    <DynamicAnswerForm
                      subQuestions={currentQ.subQuestions || []}
                      value={responses[String(currentQ._id)] || {}}
                      onChange={(next) =>
                        setResponses((prev) => ({
                          ...prev,
                          [String(currentQ._id)]: next,
                        }))
                      }
                      disabled={false}
                    />
                  </div>
                </div>

                {/* Navigation footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className="inline-flex items-center gap-1.5 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors text-gray-700 font-medium"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <span className="text-xs text-gray-400">
                    {currentIdx + 1} / {questions.length}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))
                    }
                    disabled={currentIdx >= questions.length - 1}
                    className="inline-flex items-center gap-1.5 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors text-gray-700 font-medium"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400">
                This exam has no scenarios configured.
              </div>
            )}
          </div>

          {/* Sidebar */}
          <QuestionNav
            questions={questions}
            currentId={currentQ?._id}
            answeredSet={answeredSet}
            onSelect={(qid) => {
              const idx = questions.findIndex((q) => String(q._id) === String(qid));
              if (idx >= 0) setCurrentIdx(idx);
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}