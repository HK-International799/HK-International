// import { useEffect, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import { ArrowLeft, Clock, CheckCircle2, FileText } from "lucide-react";
// import MainLayout from "../../components/layout/MainLayout";
// import { getMyAttempt } from "../../services/scenarioExamService";

// export default function ReviewPage() {
//   const { id: examId, attemptId } = useParams();
//   const navigate = useNavigate();
//   const [data, setData] = useState(null);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getMyAttempt(attemptId);
//         setData(res.data);
//       } catch (e) {
//         setErr(e.response?.data?.message || "Failed to load attempt");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [attemptId]);

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="text-gray-500">Loading…</div>
//       </MainLayout>
//     );
//   }
//   if (!data) {
//     return (
//       <MainLayout>
//         <div className="text-red-600">{err || "Attempt not found"}</div>
//       </MainLayout>
//     );
//   }

//   const { attempt, questions, exam } = data;
//   const answersByQ = new Map(
//     (attempt.answers || []).map((a) => [String(a.questionId), a])
//   );

//   return (
//     <MainLayout>
//       <div className="max-w-3xl mx-auto space-y-4">
//         <Link
//           to="/exams/scenario"
//           className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
//         >
//           <ArrowLeft size={14} /> Back to exams
//         </Link>

//         <div className="bg-white border rounded-lg p-5">
//           <h1 className="text-xl font-semibold text-gray-800">
//             {exam?.title}
//           </h1>
//           <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
//             <span>Attempt #{attempt.attemptNumber}</span>
//             <span className="capitalize">
//               Status: {attempt.status.replace("_", " ")}
//             </span>
//             {attempt.submittedAt && (
//               <span className="flex items-center gap-1">
//                 <Clock size={12} />{" "}
//                 {new Date(attempt.submittedAt).toLocaleString()}
//               </span>
//             )}
//           </div>

//           {attempt.status === "submitted" && (
//             <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md text-sm">
//               Your submission is awaiting admin review. You'll see feedback
//               here once it's ready.
//             </div>
//           )}
//           {attempt.status === "reviewed" && (
//             <div className="mt-3 bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm flex items-center gap-2">
//               <CheckCircle2 size={14} />
//               Reviewed —{" "}
//               <Link
//                 to={`/exams/scenario/${examId}/attempt/${attemptId}/feedback`}
//                 className="underline font-medium"
//               >
//                 View feedback
//               </Link>
//             </div>
//           )}
//         </div>

//         <div className="space-y-3">
//           {questions.map((q) => {
//             const ans = answersByQ.get(String(q._id));
//             return (
//               <div key={q._id} className="bg-white border rounded-lg p-4">
//                 <h3 className="font-medium text-gray-800">
//                   Question {q.questionNumber}
//                 </h3>
//                 <p className="text-sm text-gray-700 mt-1">{q.questionText}</p>
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

//                 <div className="mt-3 bg-gray-50 rounded-md p-3 space-y-2">
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
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </MainLayout>
//   );
// }




import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
  ExternalLink,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { getMyAttempt } from "../../services/scenarioExamService";

const statusConfig = {
  submitted: {
    label: "Under Review",
    icon: Clock,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    desc: "Your answers have been submitted. You'll receive feedback once an admin reviews your attempt.",
  },
  reviewed: {
    label: "Reviewed",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    desc: "Your attempt has been reviewed. Check your feedback below.",
  },
};

export default function ReviewPage() {
  const { id: examId, attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyAttempt(attemptId);
        setData(res.data);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load attempt");
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
          <span className="text-sm">Loading your submission…</span>
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
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {err || "Attempt not found"}
          </div>
        </div>
      </MainLayout>
    );
  }

  const { attempt, questions, exam } = data;
  // Build a lookup: questionId -> answer object
  const answersByQ = new Map(
    (attempt.answers || []).map((a) => [String(a.questionId), a])
  );

  const cfg = statusConfig[attempt.status] || statusConfig.submitted;
  const StatusIcon = cfg.icon;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-2 pb-12">
        <Link
          to="/exams/scenario"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to exams
        </Link>

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {exam?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                <span>Attempt #{attempt.attemptNumber}</span>
                {attempt.submittedAt && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Submitted{" "}
                    {new Date(attempt.submittedAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status banner */}
          <div
            className={`flex items-start gap-3 ${cfg.bg} ${cfg.border} border rounded-xl p-4`}
          >
            <StatusIcon size={18} className={`${cfg.text} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`text-sm font-semibold ${cfg.text} mb-0.5`}>
                {cfg.label}
              </p>
              <p className="text-sm text-gray-600">{cfg.desc}</p>
              {attempt.status === "reviewed" && (
                <Link
                  to={`/exams/scenario/${examId}/attempt/${attemptId}/feedback`}
                  className="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View detailed feedback →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scenarios summary */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Your Submissions
        </h2>
        <div className="space-y-4">
          {questions.map((q) => {
            const ans = answersByQ.get(String(q._id));
            // Build lookup: subQuestionId -> answerText
            const subAnswerMap = new Map(
              (ans?.subAnswers || []).map((sa) => [
                String(sa.subQuestionId),
                sa.answerText,
              ])
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
                    {q.maxMarks > 0 && (
                      <span className="text-xs text-gray-500">
                        {q.maxMarks} marks
                      </span>
                    )}
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

                {/* Sub-questions */}
                <div className="p-5 space-y-4">
                  {(q.subQuestions || []).map((sq, idx) => {
                    const answer = subAnswerMap.get(String(sq._id));
                    return (
                      <div key={sq._id || idx}>
                        <div className="flex items-start gap-2.5 mb-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-medium text-gray-700">
                            {sq.questionText}
                          </p>
                        </div>
                        <div className="ml-7 bg-gray-50 rounded-xl p-3">
                          {answer ? (
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                              {answer}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No answer provided
                            </p>
                          )}
                        </div>
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