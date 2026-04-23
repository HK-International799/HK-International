// import { useEffect, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import { toast } from "sonner";
// import {
//   ArrowLeft,
//   AlertTriangle,
//   Clock,
//   Play,
//   FileText,
// } from "lucide-react";
// import MainLayout from "../../components/layout/MainLayout";
// import {
//   getExamById,
//   startExam,
// } from "../../services/scenarioExamService";

// export default function ExamInstructionsPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [exam, setExam] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [starting, setStarting] = useState(false);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getExamById(id);
//         setExam(res.data.exam);
//         setQuestions(res.data.questions || []);
//       } catch (e) {
//         setErr(e.response?.data?.message || "Failed to load exam");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [id]);

//   const handleStart = async () => {
//     setStarting(true);
//     try {
//       const res = await startExam(id);
//       const attemptId = res.data._id;
//       toast.success("Exam started. Good luck!");
//       navigate(`/exams/scenario/${id}/attempt/${attemptId}`);
//     } catch (e) {
//       toast.error(e.response?.data?.message || "Could not start exam");
//     } finally {
//       setStarting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="text-gray-500 text-sm">Loading…</div>
//       </MainLayout>
//     );
//   }
//   if (!exam) {
//     return (
//       <MainLayout>
//         <div className="text-red-600">{err || "Exam not found"}</div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       <div className="max-w-3xl mx-auto space-y-4">
//         <Link
//           to="/exams/scenario"
//           className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
//         >
//           <ArrowLeft size={14} /> Back to exams
//         </Link>

//         <div className="bg-white border rounded-lg p-6 space-y-4">
//           <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
//             <FileText className="text-indigo-600" size={22} /> {exam.title}
//           </h1>
//           {exam.description && (
//             <p className="text-sm text-gray-600">{exam.description}</p>
//           )}

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
//             <div className="border rounded-md p-3">
//               <div className="text-xs text-gray-500">Duration</div>
//               <div className="font-medium text-gray-800 flex items-center gap-1">
//                 <Clock size={14} /> {exam.duration} min
//               </div>
//             </div>
//             <div className="border rounded-md p-3">
//               <div className="text-xs text-gray-500">Questions</div>
//               <div className="font-medium text-gray-800">
//                 {questions.length}
//               </div>
//             </div>
//             <div className="border rounded-md p-3">
//               <div className="text-xs text-gray-500">Passing Score</div>
//               <div className="font-medium text-gray-800">
//                 {exam.passingScore || "—"}
//               </div>
//             </div>
//             <div className="border rounded-md p-3">
//               <div className="text-xs text-gray-500">Reattempt</div>
//               <div className="font-medium text-gray-800">
//                 {exam.allowReattempt ? "Allowed" : "Controlled"}
//               </div>
//             </div>
//           </div>

//           <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
//             <div className="flex items-center gap-2 font-medium mb-1">
//               <AlertTriangle size={14} /> Before you begin
//             </div>
//             <ul className="list-disc pl-5 space-y-1 text-xs">
//               <li>
//                 Each question comes with a scenario PDF. Read the scenario
//                 carefully before answering.
//               </li>
//               <li>
//                 Your answers are auto-saved every 30 seconds. You can safely
//                 reload the page without losing progress.
//               </li>
//               <li>
//                 The timer will continue running even if you close the tab.
//                 Submit before time runs out.
//               </li>
//               <li>
//                 Once submitted, answers are locked. Feedback will be visible
//                 after an admin reviews your submission.
//               </li>
//             </ul>
//           </div>

//           <div className="flex items-center justify-end">
//             <button
//               onClick={handleStart}
//               disabled={starting}
//               className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-5 py-2 text-sm disabled:opacity-60"
//             >
//               <Play size={14} /> {starting ? "Starting…" : "Start Exam"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }



import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  Play,
  FileText,
  CheckSquare,
  Target,
  RefreshCw,
  Loader2,
  ChevronRight,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { getExamById, startExam } from "../../services/scenarioExamService";

export default function ExamInstructionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getExamById(id);
        setExam(res.data.exam);
        setQuestions(res.data.questions || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load exam");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await startExam(id);
      const attemptId = res.data._id;
      toast.success("Exam started — good luck!");
      navigate(`/exams/scenario/${id}/attempt/${attemptId}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not start exam");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center gap-3 text-gray-400 py-20 justify-center">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Loading exam details…</span>
        </div>
      </MainLayout>
    );
  }

  if (!exam) {
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
            {err || "Exam not found"}
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalMarks = questions.reduce(
    (s, q) => s + (Number(q.maxMarks) || 0),
    0
  );

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-2 pb-12">
        <Link
          to="/exams/scenario"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to exams
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 mb-5 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FileText size={16} />
            </div>
            <span className="text-indigo-200 text-xs font-medium uppercase tracking-wider">
              Scenario Exam
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
          {exam.description && (
            <p className="text-indigo-100 text-sm leading-relaxed">
              {exam.description}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            {
              icon: Clock,
              label: "Duration",
              value: `${exam.duration} min`,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              icon: FileText,
              label: "Scenarios",
              value: questions.length,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              icon: Target,
              label: "Total Marks",
              value: totalMarks || exam.passingScore || "—",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              icon: RefreshCw,
              label: "Reattempt",
              value: exam.allowReattempt ? "Allowed" : "Controlled",
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div
                className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-2`}
              >
                <Icon size={14} className={color} />
              </div>
              <div className="text-xs text-gray-500 mb-0.5">{label}</div>
              <div className="font-semibold text-gray-900 text-sm">{value}</div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-600" />
            <h3 className="font-semibold text-amber-900 text-sm">
              Before You Begin
            </h3>
          </div>
          <ul className="space-y-2.5">
            {[
              "Each scenario comes with a PDF. Read it thoroughly before answering the questions.",
              "Your answers auto-save every 30 seconds. You can safely reload without losing progress.",
              "The countdown timer continues even if you close the tab — submit before time runs out.",
              "Once submitted, your answers are locked. Feedback appears after admin review.",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-amber-800">
                <CheckSquare
                  size={14}
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Scenario list preview */}
        {questions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">
                Scenario Overview
              </h3>
            </div>
            {questions.map((q, i) => (
              <div
                key={q._id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i !== 0 ? "border-t border-gray-100" : ""
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-600">
                    {q.questionNumber}
                  </span>
                </div>
                <div className="flex-1 text-sm text-gray-700">
                  {q.subQuestions?.length || 0} question
                  {(q.subQuestions?.length || 0) !== 1 ? "s" : ""}
                  {q.maxMarks ? ` · ${q.maxMarks} marks` : ""}
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            ))}
          </div>
        )}

        {/* Start button */}
        <div className="flex justify-end">
          <button
            onClick={handleStart}
            disabled={starting}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl px-6 py-3 text-sm font-semibold transition-colors shadow-sm shadow-indigo-200"
          >
            {starting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Starting…
              </>
            ) : (
              <>
                <Play size={15} /> Start Exam
              </>
            )}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}