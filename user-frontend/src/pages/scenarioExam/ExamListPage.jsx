
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   BookOpen,
//   Clock,
//   ArrowRight,
//   FileText,
//   ChevronRight,
//   AlertCircle,
//   CheckCircle2,
//   Loader2,
//   RotateCcw,
//   Eye,
// } from "lucide-react";
// import MainLayout from "../../components/layout/MainLayout";
// import {
//   getPublishedExams,
//   getMyAttempts,
// } from "../../services/scenarioExamService";

// const statusConfig = {
//   in_progress: {
//     label: "In Progress",
//     className: "bg-amber-100 text-amber-700 border-amber-200",
//   },
//   submitted: {
//     label: "Under Review",
//     className: "bg-blue-100 text-blue-700 border-blue-200",
//   },
//   reviewed: {
//     label: "Reviewed",
//     className: "bg-emerald-100 text-emerald-700 border-emerald-200",
//   },
// };

// export default function ExamListPage() {
//   const [exams, setExams] = useState([]);
//   const [attempts, setAttempts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         const [examsRes, attemptsRes] = await Promise.all([
//           getPublishedExams(),
//           getMyAttempts(),
//         ]);
//         setExams(examsRes.data || []);
//         setAttempts(attemptsRes.data || []);
//       } catch (e) {
//         setErr(e.response?.data?.message || "Failed to load exams");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const attemptsByExam = attempts.reduce((acc, a) => {
//     const key = String(a.examId?._id || a.examId);
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(a);
//     return acc;
//   }, {});

//   return (
//     <MainLayout>
//       <div className="max-w-5xl mx-auto px-2 pb-12">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
//               <BookOpen className="text-white" size={20} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Scenario Exams
//               </h1>
//               <p className="text-sm text-gray-500">
//                 Read the scenario PDF, then answer each question
//               </p>
//             </div>
//           </div>
//         </div>

//         {err && (
//           <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6">
//             <AlertCircle size={16} />
//             {err}
//           </div>
//         )}

//         {loading ? (
//           <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
//             <Loader2 className="animate-spin" size={20} />
//             <span className="text-sm">Loading exams…</span>
//           </div>
//         ) : exams.length === 0 ? (
//           <div className="text-center py-20">
//             <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
//               <FileText size={28} className="text-gray-400" />
//             </div>
//             <p className="text-gray-500 text-sm">
//               No scenario exams are available yet.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
//             {exams.map((ex) => {
//               const mine = attemptsByExam[ex._id] || [];
//               const inProgress = mine.find((m) => m.status === "in_progress");
//               const latest = mine[0];
//               const attemptCount = mine.length;

//               return (
//                 <div
//                   key={ex._id}
//                   className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
//                 >
//                   <div className="flex items-start gap-3 mb-4">
//                     <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
//                       <FileText size={16} className="text-indigo-600" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h3 className="font-semibold text-gray-900 text-base leading-snug">
//                         {ex.title}
//                       </h3>
//                       {ex.description && (
//                         <p className="text-sm text-gray-500 mt-1 line-clamp-2">
//                           {ex.description}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-4 mb-4">
//                     <span className="flex items-center gap-1.5 text-xs text-gray-500">
//                       <Clock size={12} />
//                       {ex.duration} min
//                     </span>
//                     <span className="text-xs text-gray-500">
//                       {ex.questions?.length || 0} scenario
//                       {(ex.questions?.length || 0) !== 1 ? "s" : ""}
//                     </span>
//                     {attemptCount > 0 && (
//                       <span className="text-xs text-gray-500">
//                         {attemptCount} attempt{attemptCount !== 1 ? "s" : ""}
//                       </span>
//                     )}
//                   </div>

//                   {latest && (
//                     <div className="mb-4">
//                       <span
//                         className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${
//                           statusConfig[latest.status]?.className ||
//                           "bg-gray-100 text-gray-600 border-gray-200"
//                         }`}
//                       >
//                         {latest.status === "reviewed" && (
//                           <CheckCircle2 size={10} />
//                         )}
//                         {statusConfig[latest.status]?.label || latest.status}
//                       </span>
//                     </div>
//                   )}

//                   <div className="flex items-center gap-2 justify-end">
//                     {inProgress ? (
//                       <Link
//                         to={`/exams/scenario/${ex._id}/attempt/${inProgress._id}`}
//                         className="inline-flex items-center gap-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 font-medium transition-colors"
//                       >
//                         <RotateCcw size={13} /> Resume
//                       </Link>
//                     ) : latest?.status === "reviewed" ? (
//                       <>
//                         <Link
//                           to={`/exams/scenario/${ex._id}/attempt/${latest._id}/feedback`}
//                           className="inline-flex items-center gap-1.5 text-sm border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl px-4 py-2 font-medium transition-colors"
//                         >
//                           <Eye size={13} /> Feedback
//                         </Link>
//                         {ex.allowReattempt && (
//                           <Link
//                             to={`/exams/scenario/${ex._id}/instructions`}
//                             className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors"
//                           >
//                             Retry <ArrowRight size={13} />
//                           </Link>
//                         )}
//                       </>
//                     ) : (
//                       <Link
//                         to={`/exams/scenario/${ex._id}/instructions`}
//                         className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors"
//                       >
//                         {mine.length === 0 ? "Start Exam" : "Details"}{" "}
//                         <ArrowRight size={13} />
//                       </Link>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Past attempts */}
//         {attempts.length > 0 && (
//           <div>
//             <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
//               <Clock size={16} className="text-gray-400" />
//               My Attempts
//             </h2>
//             <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="bg-gray-50 border-b border-gray-200">
//                     <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                       Exam
//                     </th>
//                     <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                       Attempt
//                     </th>
//                     <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                       Status
//                     </th>
//                     <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {attempts.map((a, i) => (
//                     <tr
//                       key={a._id}
//                       className={`${
//                         i !== 0 ? "border-t border-gray-100" : ""
//                       } hover:bg-gray-50 transition-colors`}
//                     >
//                       <td className="py-3 px-4 font-medium text-gray-800">
//                         {a.examId?.title || "—"}
//                       </td>
//                       <td className="py-3 px-4 text-gray-500">
//                         #{a.attemptNumber}
//                       </td>
//                       <td className="py-3 px-4">
//                         <span
//                           className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${
//                             statusConfig[a.status]?.className ||
//                             "bg-gray-100 text-gray-600 border-gray-200"
//                           }`}
//                         >
//                           {statusConfig[a.status]?.label ||
//                             a.status.replace("_", " ")}
//                         </span>
//                       </td>
//                       <td className="py-3 px-4 text-right">
//                         {a.status === "reviewed" ? (
//                           <Link
//                             to={`/exams/scenario/${a.examId?._id || a.examId}/attempt/${a._id}/feedback`}
//                             className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
//                           >
//                             View feedback <ChevronRight size={12} />
//                           </Link>
//                         ) : a.status === "submitted" ? (
//                           <span className="text-xs text-gray-400 italic">
//                             Awaiting review
//                           </span>
//                         ) : (
//                           <Link
//                             to={`/exams/scenario/${a.examId?._id || a.examId}/attempt/${a._id}`}
//                             className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 text-xs font-medium"
//                           >
//                             Continue <ChevronRight size={12} />
//                           </Link>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// }





import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  ArrowRight,
  FileText,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Eye,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import {
  getPublishedExams,
  getMyAttempts,
} from "../../services/scenarioExamService";

const statusConfig = {
  in_progress: {
    label: "In Progress",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  submitted: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

export default function ExamListPage() {
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [examsRes, attemptsRes] = await Promise.all([
          getPublishedExams(),
          getMyAttempts(),
        ]);
        setExams(examsRes.data || []);
        setAttempts(attemptsRes.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load exams");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const attemptsByExam = attempts.reduce((acc, a) => {
    const key = String(a.examId?._id || a.examId);
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-2 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <BookOpen className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Scenario Exams
              </h1>
              <p className="text-sm text-gray-500">
                Read the scenario PDF, then answer each question
              </p>
            </div>
          </div>
        </div>

        {err && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6">
            <AlertCircle size={16} />
            {err}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm">Loading exams…</span>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              No scenario exams available for your enrolled courses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {exams.map((ex) => {
              const mine = attemptsByExam[ex._id] || [];
              const inProgress = mine.find((m) => m.status === "in_progress");
              const latest = mine[0];
              const attemptCount = mine.length;

              return (
                <div
                  key={ex._id}
                  className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText size={16} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base leading-snug">
                        {ex.title}
                      </h3>
                      {ex.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {ex.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} />
                      {ex.duration} min
                    </span>
                    <span className="text-xs text-gray-500">
                      {ex.questions?.length || 0} scenario
                      {(ex.questions?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    {attemptCount > 0 && (
                      <span className="text-xs text-gray-500">
                        {attemptCount} attempt{attemptCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {latest && (
                    <div className="mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${
                          statusConfig[latest.status]?.className ||
                          "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {latest.status === "reviewed" && (
                          <CheckCircle2 size={10} />
                        )}
                        {statusConfig[latest.status]?.label || latest.status}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 justify-end">
                    {inProgress ? (
                      <Link
                        to={`/exams/scenario/${ex._id}/attempt/${inProgress._id}`}
                        className="inline-flex items-center gap-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 font-medium transition-colors"
                      >
                        <RotateCcw size={13} /> Resume
                      </Link>
                    ) : latest?.status === "reviewed" ? (
                      <>
                        <Link
                          to={`/exams/scenario/${ex._id}/attempt/${latest._id}/feedback`}
                          className="inline-flex items-center gap-1.5 text-sm border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl px-4 py-2 font-medium transition-colors"
                        >
                          <Eye size={13} /> Feedback
                        </Link>
                        {ex.allowReattempt && (
                          <Link
                            to={`/exams/scenario/${ex._id}/instructions`}
                            className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors"
                          >
                            Retry <ArrowRight size={13} />
                          </Link>
                        )}
                      </>
                    ) : (
                      <Link
                        to={`/exams/scenario/${ex._id}/instructions`}
                        className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors"
                      >
                        {mine.length === 0 ? "Start Exam" : "Details"}{" "}
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Past attempts */}
        {attempts.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              My Attempts
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Exam
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Attempt
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, i) => (
                    <tr
                      key={a._id}
                      className={`${
                        i !== 0 ? "border-t border-gray-100" : ""
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {a.examId?.title || "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        #{a.attemptNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${
                            statusConfig[a.status]?.className ||
                            "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {statusConfig[a.status]?.label ||
                            a.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {a.status === "reviewed" ? (
                          <Link
                            to={`/exams/scenario/${a.examId?._id || a.examId}/attempt/${a._id}/feedback`}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                          >
                            View feedback <ChevronRight size={12} />
                          </Link>
                        ) : a.status === "submitted" ? (
                          <span className="text-xs text-gray-400 italic">
                            Awaiting review
                          </span>
                        ) : (
                          <Link
                            to={`/exams/scenario/${a.examId?._id || a.examId}/attempt/${a._id}`}
                            className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 text-xs font-medium"
                          >
                            Continue <ChevronRight size={12} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}