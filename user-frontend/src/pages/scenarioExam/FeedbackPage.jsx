// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import {
//   ArrowLeft,
//   Award,
//   CheckCircle2,
//   XCircle,
//   FileText,
//   MessageSquare,
// } from "lucide-react";
// import MainLayout from "../../components/layout/MainLayout";
// import { getFeedback } from "../../services/scenarioExamService";

// export default function FeedbackPage() {
//   const { attemptId } = useParams();
//   const [data, setData] = useState(null);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getFeedback(attemptId);
//         setData(res.data);
//       } catch (e) {
//         setErr(e.response?.data?.message || "Feedback not available yet");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [attemptId]);

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="text-gray-500">Loading feedback…</div>
//       </MainLayout>
//     );
//   }
//   if (!data) {
//     return (
//       <MainLayout>
//         <div className="max-w-xl mx-auto">
//           <Link
//             to="/exams/scenario"
//             className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-3"
//           >
//             <ArrowLeft size={14} /> Back to exams
//           </Link>
//           <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm">
//             {err || "Feedback is not yet available."}
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   const { attempt, questions } = data;
//   const answersByQ = new Map(
//     (attempt.answers || []).map((a) => [String(a.questionId), a])
//   );

//   const totalMax = questions.reduce(
//     (sum, q) => sum + (Number(q.maxMarks) || 0),
//     0
//   );
//   const pct =
//     totalMax > 0
//       ? Math.round(((attempt.totalMarksObtained || 0) / totalMax) * 100)
//       : null;
//   const passed =
//     attempt.examId?.passingScore &&
//     attempt.totalMarksObtained >= attempt.examId.passingScore;

//   return (
//     <MainLayout>
//       <div className="max-w-3xl mx-auto space-y-4">
//         <Link
//           to="/exams/scenario"
//           className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
//         >
//           <ArrowLeft size={14} /> Back to exams
//         </Link>

//         {/* Summary */}
//         <div className="bg-white border rounded-lg p-5">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <h1 className="text-xl font-semibold text-gray-800">
//                 {attempt.examId?.title}
//               </h1>
//               <div className="text-sm text-gray-500 mt-1">
//                 Attempt #{attempt.attemptNumber} · Reviewed{" "}
//                 {attempt.reviewedAt
//                   ? new Date(attempt.reviewedAt).toLocaleDateString()
//                   : ""}
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-3xl font-bold text-gray-800 flex items-center gap-2 justify-end">
//                 <Award
//                   size={22}
//                   className={passed ? "text-green-600" : "text-gray-400"}
//                 />
//                 {attempt.totalMarksObtained || 0}
//                 <span className="text-base font-normal text-gray-500">
//                   / {totalMax}
//                 </span>
//               </div>
//               {pct !== null && (
//                 <div className="text-xs text-gray-500">{pct}%</div>
//               )}
//             </div>
//           </div>

//           {attempt.overallFeedback && (
//             <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-md p-3 text-sm">
//               <div className="font-medium text-indigo-800 flex items-center gap-1 mb-1">
//                 <MessageSquare size={14} /> Overall feedback
//               </div>
//               <p className="text-gray-700 whitespace-pre-wrap">
//                 {attempt.overallFeedback}
//               </p>
//             </div>
//           )}

//           {attempt.reattemptAllowed && (
//             <div className="mt-3 bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm">
//               You've been granted a reattempt.{" "}
//               <Link
//                 to={`/exams/scenario/${attempt.examId?._id || attempt.examId}/instructions`}
//                 className="underline font-medium"
//               >
//                 Start a new attempt
//               </Link>
//             </div>
//           )}
//         </div>

//         {/* Per-question feedback */}
//         <div className="space-y-3">
//           {questions.map((q) => {
//             const ans = answersByQ.get(String(q._id));
//             const correct = ans?.isCorrect === true;
//             const incorrect = ans?.isCorrect === false;
//             return (
//               <div key={q._id} className="bg-white border rounded-lg p-4">
//                 <div className="flex items-start justify-between gap-2">
//                   <div>
//                     <h3 className="font-medium text-gray-800">
//                       Question {q.questionNumber}
//                     </h3>
//                     <p className="text-sm text-gray-700 mt-1">
//                       {q.questionText}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-semibold text-gray-800">
//                       {ans?.marksObtained ?? 0}
//                       <span className="text-gray-400 text-xs">
//                         /{q.maxMarks}
//                       </span>
//                     </div>
//                     {correct && (
//                       <span className="inline-flex items-center gap-1 text-xs text-green-700">
//                         <CheckCircle2 size={12} /> Correct
//                       </span>
//                     )}
//                     {incorrect && (
//                       <span className="inline-flex items-center gap-1 text-xs text-red-600">
//                         <XCircle size={12} /> Incorrect
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {q.scenarioPDF && (
//                   <a
//                     href={q.scenarioPDF}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-600 hover:underline"
//                   >
//                     <FileText size={12} /> Scenario PDF
//                   </a>
//                 )}

//                 {/* Student's answers */}
//                 <div className="mt-3 bg-gray-50 rounded-md p-3 space-y-2">
//                   <div className="text-xs font-medium text-gray-500 uppercase">
//                     Your answer
//                   </div>
//                   {(q.formSchema || []).map((f) => {
//                     const v = ans?.responses?.[f.fieldId];
//                     return (
//                       <div key={f.fieldId}>
//                         <div className="text-xs text-gray-500">{f.label}</div>
//                         <div className="text-sm text-gray-800">
//                           {v === undefined ||
//                           v === null ||
//                           v === "" ||
//                           (Array.isArray(v) && v.length === 0) ? (
//                             <span className="text-gray-400 italic">
//                               No answer
//                             </span>
//                           ) : Array.isArray(v) ? (
//                             v.join(", ")
//                           ) : (
//                             String(v)
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {/* Admin feedback */}
//                 {ans?.adminFeedback && (
//                   <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-md p-3 text-sm">
//                     <div className="text-xs font-medium text-indigo-800 flex items-center gap-1 mb-1">
//                       <MessageSquare size={12} /> Instructor feedback
//                     </div>
//                     <p className="text-gray-700 whitespace-pre-wrap">
//                       {ans.adminFeedback}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </MainLayout>
//   );
// }




import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  TrendingUp,
  Loader2,
  ExternalLink,
  Minus,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { getFeedback } from "../../services/scenarioExamService";

export default function FeedbackPage() {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getFeedback(attemptId);
        setData(res.data);
      } catch (e) {
        setErr(e.response?.data?.message || "Feedback not available yet");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Loading feedback…</span>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto">
          <Link
            to="/exams/scenario"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={14} /> Back to exams
          </Link>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-xl text-sm">
            {err || "Feedback is not yet available."}
          </div>
        </div>
      </MainLayout>
    );
  }

  const { attempt, questions } = data;

  // Build: questionId -> answer obj
  const answersByQ = new Map(
    (attempt.answers || []).map((a) => [String(a.questionId), a])
  );

  // Score totals
  const totalMax = questions.reduce(
    (sum, q) => sum + (Number(q.maxMarks) || 0),
    0
  );
  const totalObtained = attempt.totalMarksObtained || 0;
  const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;
  const passingScore = attempt.examId?.passingScore;
  const passed = passingScore != null && totalObtained >= passingScore;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-2 pb-12">
        <Link
          to="/exams/scenario"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to exams
        </Link>

        {/* Score hero card */}
        <div
          className={`rounded-2xl p-6 mb-5 text-white shadow-lg ${
            passed
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200"
              : "bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-indigo-200"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-75 mb-1">
                Exam Feedback
              </p>
              <h1 className="text-xl font-bold mb-1">
                {attempt.examId?.title}
              </h1>
              <p className="text-sm opacity-75">
                Attempt #{attempt.attemptNumber} · Reviewed{" "}
                {attempt.reviewedAt
                  ? new Date(attempt.reviewedAt).toLocaleDateString([], {
                      dateStyle: "medium",
                    })
                  : ""}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-end gap-1 justify-end">
                <span className="text-4xl font-extrabold">{totalObtained}</span>
                <span className="text-lg opacity-60 mb-1">/ {totalMax}</span>
              </div>
              {pct !== null && (
                <div className="text-sm opacity-75">{pct}%</div>
              )}
              {passed !== null && passingScore != null && (
                <div className="mt-1 inline-flex items-center gap-1 text-xs bg-white/20 rounded-full px-2.5 py-0.5 font-medium">
                  {passed ? (
                    <>
                      <CheckCircle2 size={11} /> Passed
                    </>
                  ) : (
                    <>
                      <XCircle size={11} /> Not passed
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Score bar */}
          {pct !== null && (
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/70 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>

        {/* Overall feedback */}
        {attempt.overallFeedback && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={15} className="text-indigo-600" />
              <h3 className="font-semibold text-indigo-900 text-sm">
                Overall Feedback
              </h3>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {attempt.overallFeedback}
            </p>
          </div>
        )}

        {/* Reattempt notice */}
        {attempt.reattemptAllowed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-emerald-800 font-medium">
              You've been granted a reattempt for this exam.
            </p>
            <Link
              to={`/exams/scenario/${attempt.examId?._id || attempt.examId}/instructions`}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 font-medium transition-colors"
            >
              Start New Attempt →
            </Link>
          </div>
        )}

        {/* Per-scenario breakdown */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Scenario Breakdown
        </h2>
        <div className="space-y-5">
          {questions.map((q) => {
            const ans = answersByQ.get(String(q._id));

            // Build: subQuestionId -> subAnswer obj
            const subAnswerMap = new Map(
              (ans?.subAnswers || []).map((sa) => [
                String(sa.subQuestionId),
                sa,
              ])
            );

            // Sum marks for this question
            const qObtained = (ans?.subAnswers || []).reduce(
              (s, sa) => s + (Number(sa.marksObtained) || 0),
              0
            );

            return (
              <div
                key={q._id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
              >
                {/* Scenario header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Scenario {q.questionNumber}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        q.maxMarks && qObtained >= q.maxMarks * 0.5
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {qObtained}
                      <span className="text-gray-400 font-normal text-xs">
                        /{q.maxMarks || 0}
                      </span>
                    </span>
                    {q.scenarioPdfUrl && (
                      <a
                        href={q.scenarioPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <FileText size={11} /> PDF <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Sub-questions with answers + feedback */}
                <div className="p-5 space-y-6">
                  {(q.subQuestions || []).map((sq, idx) => {
                    const sa = subAnswerMap.get(String(sq._id));
                    const isCorrect = sa?.isCorrect === true;
                    const isIncorrect = sa?.isCorrect === false;

                    return (
                      <div key={sq._id || idx} className="space-y-3">
                        {/* Question */}
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {sq.questionText}
                            </p>
                            {sq.maxMarks > 0 && (
                              <span className="text-xs text-gray-400">
                                {sq.maxMarks} mark{sq.maxMarks !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          {/* Marks badge */}
                          <div className="flex-shrink-0 flex flex-col items-end gap-1">
                            <span
                              className={`text-sm font-bold ${
                                isCorrect
                                  ? "text-emerald-600"
                                  : isIncorrect
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {sa?.marksObtained ?? "—"}
                              <span className="text-gray-400 font-normal text-xs">
                                /{sq.maxMarks || 0}
                              </span>
                            </span>
                            {isCorrect && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                                <CheckCircle2 size={11} /> Correct
                              </span>
                            )}
                            {isIncorrect && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-medium">
                                <XCircle size={11} /> Incorrect
                              </span>
                            )}
                            {!isCorrect && !isIncorrect && sa && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                <Minus size={11} /> Partial
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Student's answer */}
                        <div className="ml-7">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">
                            Your Answer
                          </p>
                          <div className="bg-gray-50 rounded-xl p-3">
                            {sa?.answerText ? (
                              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {sa.answerText}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">
                                No answer provided
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Feedback */}
                        {sa?.feedbackText && (
                          <div className="ml-7">
                            <p className="text-[11px] font-semibold text-indigo-500 uppercase mb-1.5 flex items-center gap-1">
                              <MessageSquare size={10} /> Instructor Feedback
                            </p>
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {sa.feedbackText}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Improvement notes */}
                        {sa?.improvementNotes && (
                          <div className="ml-7">
                            <p className="text-[11px] font-semibold text-amber-600 uppercase mb-1.5 flex items-center gap-1">
                              <TrendingUp size={10} /> How to Improve
                            </p>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {sa.improvementNotes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}