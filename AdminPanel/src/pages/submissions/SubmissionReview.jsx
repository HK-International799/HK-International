


// import { useCallback, useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import AdminLayout from "../../components/layout/AdminLayout";
// import { Badge, Button } from "../../components/ui";
// import {
//   getSubmissionById,
//   gradeSubmission,
//   saveAnnotations,
// } from "../../services/assignmentService";

// import {
//   ArrowLeft,
//   CheckCircle2,
//   XCircle,
//   MinusCircle,
//   FileText,
//   Save,
//   Loader2,
//   AlertTriangle,
//   User,
//   Calendar,
//   Award,
//   MessageSquare,
//   Star,
//   TrendingUp,
// } from "lucide-react";
// import DocumentAnnotatorModal from "../../components/documentViewer/DocumentAnnotatorModal";

// const ICONS = [
//   {
//     key: "correct",
//     label: "Correct",
//     icon: CheckCircle2,
//     color: "text-emerald-500",
//     bg: "bg-emerald-50 border-emerald-200",
//   },
//   {
//     key: "partial",
//     label: "Partial",
//     icon: MinusCircle,
//     color: "text-orange-500",
//     bg: "bg-orange-50 border-orange-200",
//   },
//   {
//     key: "wrong",
//     label: "Wrong",
//     icon: XCircle,
//     color: "text-red-500",
//     bg: "bg-red-50 border-red-200",
//   },
// ];

// // Auto-expanding textarea hook
// function useAutoExpand(value) {
//   const ref = useRef(null);
//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     el.style.height = "auto";
//     el.style.height = `${el.scrollHeight}px`;
//   }, [value]);
//   return ref;
// }

// export default function SubmissionReview() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [submission, setSubmission] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);

//   // Grading state
//   const [totalScore, setTotalScore] = useState("");
//   const [feedback, setFeedback] = useState("");
//   const [questionGrades, setQuestionGrades] = useState({});
//   const [annotations, setAnnotations] = useState({});

//   // Document annotator modal
//   const [annotatorOpen, setAnnotatorOpen] = useState(false);
//   const [docAnnotations, setDocAnnotations] = useState([]);
//   const annotationsAtModalOpenRef = useRef([]);
//   const [autoSavingAnnotations, setAutoSavingAnnotations] = useState(false);

//   const feedbackRef = useAutoExpand(feedback);

//   // Auto-calculate total from per-question grades
//   useEffect(() => {
//     const total = Object.values(questionGrades).reduce(
//       (sum, g) => sum + (g.marks || 0),
//       0,
//     );
//     setTotalScore(String(total));
//   }, [questionGrades]);

//   useEffect(() => {
//     loadSubmission();
//   }, [id]);

//   const loadSubmission = useCallback(async () => {
//     try {
//       // FIX: getSubmissionById already returns res.data.data (the raw submission
//       // object) — we must NOT try to unwrap .data again.
//       const sub = await getSubmissionById(id);
//       setSubmission(sub);

//       // FIX: ALWAYS hydrate document annotations from the API response, not
//       // only when status === "graded". A submission can have annotations saved
//       // (via the inline "Save Annotations" button in the annotator modal)
//       // BEFORE it gets a totalScore / feedback. Gating on status === "graded"
//       // is exactly why annotations seemed to vanish after reload.
//       //
//       // Canonical field: `annotations`. We still fall back to the legacy
//       // `documentAnnotations` so previously-graded rows keep working, but all
//       // NEW writes go to `annotations` (see handleGrade below).
//       setDocAnnotations(sub.annotations || sub.documentAnnotations || []);

//       if (sub.status === "graded") {
//         setTotalScore(String(sub.totalScore ?? ""));
//         setFeedback(sub.feedback || "");

//         const ann = {};
//         (sub.reviewAnnotations || []).forEach((a) => {
//           ann[a.questionId] = a.icon;
//         });
//         setAnnotations(ann);

//         const qg = {};
//         (sub.answers || []).forEach((ans) => {
//           if (ans.marksAwarded != null) {
//             qg[ans._id] = { marks: ans.marksAwarded, isCorrect: ans.isCorrect };
//           }
//         });
//         setQuestionGrades(qg);
//       }
//     } catch (err) {
//       setError("Failed to load submission");
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   const setAnswerGrade = (answerId, field, value) => {
//     setQuestionGrades((prev) => ({
//       ...prev,
//       [answerId]: { ...prev[answerId], [field]: value },
//     }));
//   };

//   const setAnnotation = (questionId, icon) => {
//     setAnnotations((prev) => {
//       const updated = { ...prev };
//       if (updated[questionId] === icon) delete updated[questionId];
//       else updated[questionId] = icon;
//       return updated;
//     });
//   };

//   // Auto-save annotations when modal closes if they changed
//   const handleAnnotatorClose = useCallback(async () => {
//     const prev = annotationsAtModalOpenRef.current || [];
//     const curr = docAnnotations || [];
//     const changed = JSON.stringify(prev) !== JSON.stringify(curr);

//     // Close the modal optimistically — the save runs in the background and
//     // we refresh from the server afterwards. Closing first keeps the UX snappy
//     // and prevents the modal from "freezing" while we wait on the network.
//     setAnnotatorOpen(false);

//     if (changed && submission?._id) {
//       setAutoSavingAnnotations(true);
//       try {
//         await saveAnnotations(submission._id, curr);
//         // FIX: After a successful save, reload from the server so the local
//         // state (and the badge count on the "Open" tile) reflects what was
//         // actually persisted. This is the same data the page would fetch on
//         // a hard reload, so it guarantees the UI matches what the user will
//         // see on F5.
//         await loadSubmission();
//       } catch (err) {
//         console.error("Auto-save annotations failed:", err);
//         // Keep the in-memory annotations so the user can retry; do NOT roll
//         // back to annotationsAtModalOpenRef — that would silently destroy
//         // their work.
//       } finally {
//         setAutoSavingAnnotations(false);
//       }
//     }
//   }, [docAnnotations, submission?._id, loadSubmission]);

//   const handleAnnotatorOpen = useCallback(() => {
//     annotationsAtModalOpenRef.current = [...(docAnnotations || [])];
//     setAnnotatorOpen(true);
//   }, [docAnnotations]);

//   const handleGrade = async () => {
//     if (totalScore === "" || totalScore === null) {
//       return setError("Please enter a total score");
//     }
//     setError("");
//     setSaving(true);
//     try {
//       const qGrades = Object.entries(questionGrades).map(([answerId, g]) => ({
//         answerId,
//         marks: g.marks,
//         isCorrect: g.isCorrect,
//       }));

//       const reviewAnnotations = Object.entries(annotations)
//         .filter(([, icon]) => icon)
//         .map(([questionId, icon]) => ({ questionId, icon }));

//       await gradeSubmission(id, {
//         totalScore: Number(totalScore),
//         feedback,
//         questionGrades: qGrades,
//         reviewAnnotations,
//         // FIX: Use the canonical field name `annotations` so the read path
//         // (loadSubmission) and write path agree. Keep `documentAnnotations`
//         // as well for one release so a backend that still expects the old
//         // name doesn't break — it's harmless extra payload otherwise.
//         annotations: docAnnotations,
//         documentAnnotations: docAnnotations,
//       });

//       setSuccess(true);
//       setError("");
//       loadSubmission();
//       setTimeout(() => setSuccess(false), 4000);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to grade submission");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <AdminLayout>
//         <div className="flex flex-col items-center justify-center h-64 gap-3">
//           <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
//           <p className="text-sm text-gray-400">Loading submission…</p>
//         </div>
//       </AdminLayout>
//     );
//   }

//   if (!submission) {
//     return (
//       <AdminLayout>
//         <div className="text-center py-20 text-gray-400">
//           <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
//           <p>Submission not found</p>
//         </div>
//       </AdminLayout>
//     );
//   }

//   const {
//     studentId,
//     assignmentId: assignment,
//     answers = [],
//     submissionFile,
//   } = submission;
//   const maxMarks = Number(assignment?.totalMarks || 0);
//   const percentage =
//     maxMarks > 0 && totalScore !== ""
//       ? Math.min(100, (Number(totalScore) / maxMarks) * 100)
//       : 0;

//   const gradeColor =
//     percentage >= 70 ? "text-emerald-600" :
//     percentage >= 40 ? "text-orange-500" :
//     "text-red-500";

//   return (
//     <AdminLayout>
//       <div className="animate-fadeIn max-w-5xl mx-auto">
//         {/* ── Header ── */}
//         <div className="flex items-start justify-between mb-6">
//           <div>
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition"
//             >
//               <ArrowLeft size={15} /> Back to submissions
//             </button>
//             <h1 className="text-xl font-bold text-gray-900">
//               {assignment?.title || "Submission Review"}
//             </h1>
//             <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
//               <span className="flex items-center gap-1.5">
//                 <User size={13} /> {studentId?.name || "Student"}
//               </span>
//               {studentId?.email && (
//                 <span className="text-gray-300 hidden sm:inline">|</span>
//               )}
//               {studentId?.email && (
//                 <span className="text-xs text-gray-400">{studentId.email}</span>
//               )}
//               <span className="text-gray-300">|</span>
//               <span className="flex items-center gap-1.5">
//                 <Calendar size={13} />
//                 {new Date(submission.createdAt).toLocaleString()}
//               </span>
//               {submission.isLate && (
//                 <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
//                   <AlertTriangle size={12} /> Late
//                 </span>
//               )}
//               <Badge
//                 variant={
//                   submission.status === "graded"
//                     ? "success"
//                     : submission.status === "submitted"
//                       ? "primary"
//                       : "warning"
//                 }
//               >
//                 {submission.status}
//               </Badge>
//             </div>
//           </div>
//         </div>

//         {/* Alerts */}
//         {error && (
//           <div className="mb-5 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
//             <AlertTriangle size={14} /> {error}
//           </div>
//         )}
//         {success && (
//           <div className="mb-5 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-200">
//             <CheckCircle2 size={14} /> Submission graded successfully!
//           </div>
//         )}

//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* ── Left: Document + Answers ── */}
//           <div className="lg:col-span-2 space-y-4">

//             {/* Submitted file */}
//             {submissionFile?.url ? (
//               <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
//                 <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                   <FileText size={15} className="text-indigo-500" />
//                   Submitted Document
//                 </h3>
//                 <div
//                   onClick={handleAnnotatorOpen}
//                   className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 rounded-xl border border-indigo-100 transition group cursor-pointer"
//                 >
//                   <div className="p-2.5 bg-white rounded-xl border border-indigo-200 shadow-sm">
//                     <FileText size={18} className="text-indigo-600" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-indigo-700 truncate">
//                       {submissionFile.originalName || "Open submission"}
//                     </p>
//                     <p className="text-xs text-indigo-400 mt-0.5">
//                       Click to open & annotate
//                       {docAnnotations.length > 0 && (
//                         <span className="ml-2 text-indigo-500 font-medium">
//                           · {docAnnotations.length} annotation{docAnnotations.length !== 1 ? "s" : ""} saved
//                         </span>
//                       )}
//                     </p>
//                   </div>
//                   <div className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg group-hover:bg-indigo-700 transition flex-shrink-0">
//                     Open
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex items-center gap-3 text-sm text-amber-700">
//                 <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
//                 <div>
//                   <p className="font-medium">No submission file</p>
//                   <p className="text-xs text-amber-500 mt-0.5">
//                     The student did not upload a file with this submission.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Assignment reference file */}
//             {assignment?.file?.url && (
//               <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
//                 <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                   <FileText size={15} className="text-gray-400" />
//                   Assignment File (reference)
//                 </h3>
//                 <a
//                   href={assignment.file.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
//                 >
//                   <div className="p-2.5 bg-white rounded-xl border border-gray-200">
//                     <FileText size={18} className="text-gray-400" />
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-700">
//                       {assignment.file.originalName || "Assignment file"}
//                     </p>
//                     <p className="text-xs text-gray-400">View assignment document</p>
//                   </div>
//                 </a>
//               </div>
//             )}

//             {/* Answers */}
//             {answers.length > 0 ? (
//               <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
//                 <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
//                   <h3 className="text-sm font-semibold text-gray-700">
//                     Student Answers ({answers.length})
//                   </h3>
//                   <span className="text-xs text-gray-400">
//                     {Object.keys(questionGrades).length}/{answers.length} graded
//                   </span>
//                 </div>

//                 <div className="divide-y divide-gray-50">
//                   {answers.map((ans, i) => {
//                     const question = ans.questionId;
//                     const qId = question?._id || ans.questionId;
//                     const answerId = ans._id;
//                     const currentIcon = annotations[qId];
//                     const currentGrade = questionGrades[answerId] || {};

//                     return (
//                       <div key={answerId || i} className="p-5">
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex-1">
//                             <div className="flex items-start gap-2 mb-1">
//                               <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
//                                 {i + 1}
//                               </span>
//                               <p className="text-sm font-medium text-gray-800 flex-1">
//                                 {question?.prompt || `Question ${i + 1}`}
//                               </p>
//                               <span className="text-xs text-gray-400 flex-shrink-0">
//                                 {question?.marks ?? "?"} marks
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="ml-8 space-y-3">
//                           {/* Answer */}
//                           <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
//                             {ans.selectedOption ? (
//                               <p className="text-sm text-gray-700">
//                                 <span className="text-xs text-gray-400 mr-2">Selected:</span>
//                                 <span className="font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
//                                   {ans.selectedOption}
//                                 </span>
//                               </p>
//                             ) : ans.textAnswer ? (
//                               <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
//                                 {ans.textAnswer}
//                               </p>
//                             ) : (
//                               <p className="text-xs text-gray-400 italic">No answer provided</p>
//                             )}
//                           </div>

//                           {/* Mark icons */}
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs text-gray-400">Mark:</span>
//                             {ICONS.map(({ key, label, icon: Icon, color, bg }) => (
//                               <button
//                                 key={key}
//                                 onClick={() => setAnnotation(qId, key)}
//                                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
//                                   currentIcon === key
//                                     ? `${bg} ${color} border-current`
//                                     : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
//                                 }`}
//                                 title={label}
//                               >
//                                 <Icon size={13} className={currentIcon === key ? color : ""} />
//                                 {label}
//                               </button>
//                             ))}
//                           </div>

//                           {/* Marks input */}
//                           <div className="flex items-center gap-3">
//                             <label className="text-xs text-gray-500 flex-shrink-0">
//                               Marks awarded:
//                             </label>
//                             <input
//                               type="number"
//                               min={0}
//                               max={question?.marks}
//                               value={currentGrade.marks ?? ""}
//                               onChange={(e) =>
//                                 setAnswerGrade(answerId, "marks", Number(e.target.value))
//                               }
//                               className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                               placeholder="0"
//                             />
//                             <span className="text-xs text-gray-400">
//                               / {question?.marks ?? "?"}
//                             </span>
//                             {currentGrade.marks != null && question?.marks && (
//                               <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
//                                 <div
//                                   className="h-full bg-indigo-400 rounded-full transition-all"
//                                   style={{
//                                     width: `${Math.min(100, (currentGrade.marks / question.marks) * 100)}%`,
//                                   }}
//                                 />
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 shadow-sm">
//                 <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
//                 <p className="text-sm">No text answers — student submitted a file</p>
//               </div>
//             )}
//           </div>

//           {/* ── Right: Grading Panel ── */}
//           <div className="space-y-4">
//             <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-4 shadow-sm">
//               <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
//                 <Award size={16} className="text-indigo-500" />
//                 Grade Submission
//               </h3>

//               {/* Score */}
//               <div className="mb-5">
//                 <label className="text-xs font-medium text-gray-600 mb-1.5 block">
//                   Total Score
//                   {maxMarks > 0 && (
//                     <span className="text-gray-400 ml-1">/ {maxMarks}</span>
//                   )}
//                 </label>
//                 <input
//                   type="number"
//                   min={0}
//                   max={maxMarks || undefined}
//                   value={totalScore}
//                   onChange={(e) => setTotalScore(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 text-center"
//                   placeholder="0"
//                 />

//                 {maxMarks > 0 && totalScore !== "" && (
//                   <div className="mt-2">
//                     <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
//                       <div
//                         className={`h-full rounded-full transition-all ${
//                           percentage >= 70 ? "bg-emerald-500" :
//                           percentage >= 40 ? "bg-orange-400" :
//                           "bg-red-400"
//                         }`}
//                         style={{ width: `${Math.min(100, percentage)}%` }}
//                       />
//                     </div>
//                     <p className={`text-sm font-semibold mt-1.5 text-right ${gradeColor}`}>
//                       {percentage.toFixed(1)}%
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Feedback */}
//               <div className="mb-5">
//                 <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
//                   <MessageSquare size={12} /> Feedback for student
//                 </label>
//                 <textarea
//                   ref={feedbackRef}
//                   value={feedback}
//                   onChange={(e) => setFeedback(e.target.value)}
//                   placeholder="Great work on… You could improve…"
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
//                   style={{
//                     resize: "none",
//                     minHeight: "120px",
//                     maxHeight: "300px",
//                     overflowY: feedback.length > 800 ? "auto" : "hidden",
//                   }}
//                 />
//               </div>

//               {/* Summary stats */}
//               <div className="bg-gray-50 rounded-xl p-3.5 mb-5 space-y-2">
//                 {[
//                   { label: "Questions answered", value: answers.length },
//                   {
//                     label: "Q annotations",
//                     value: `${Object.values(annotations).filter(Boolean).length}/${answers.length}`,
//                   },
//                   {
//                     label: "Doc annotations",
//                     value: (
//                       <span className="font-medium flex items-center gap-1">
//                         {autoSavingAnnotations && (
//                           <Loader2 size={10} className="animate-spin text-indigo-500" />
//                         )}
//                         {docAnnotations.length}
//                       </span>
//                     ),
//                   },
//                   {
//                     label: "Graded answers",
//                     value: `${Object.keys(questionGrades).length}/${answers.length}`,
//                   },
//                 ].map(({ label, value }) => (
//                   <div key={label} className="flex items-center justify-between text-xs">
//                     <span className="text-gray-500">{label}</span>
//                     <span className="font-medium text-gray-700">{value}</span>
//                   </div>
//                 ))}
//               </div>

//               <Button
//                 onClick={handleGrade}
//                 disabled={saving}
//                 className="w-full justify-center"
//               >
//                 {saving ? (
//                   <>
//                     <Loader2 size={15} className="animate-spin" /> Saving…
//                   </>
//                 ) : (
//                   <>
//                     <Save size={15} /> Submit Grade
//                   </>
//                 )}
//               </Button>

//               {submission.status === "graded" && (
//                 <p className="text-xs text-center text-gray-400 mt-2.5">
//                   Graded on{" "}
//                   {submission.gradedAt
//                     ? new Date(submission.gradedAt).toLocaleDateString()
//                     : "—"}{" "}
//                   by {submission.gradedBy?.name || "—"}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Document Annotator Modal */}
//       <DocumentAnnotatorModal
//         open={annotatorOpen}
//         onClose={handleAnnotatorClose}
//         fileUrl={submissionFile?.url}
//         fileName={submissionFile?.originalName}
//         submissionId={submission._id}
//         annotations={docAnnotations}
//         onChange={setDocAnnotations}
//         readOnly={false}
//         feedback={feedback}
//         totalScore={totalScore !== "" ? Number(totalScore) : null}
//         maxMarks={maxMarks || null}
//         // FIX: Hand the modal everything it needs to produce a FULL evaluation
//         // report (student details, assignment metadata, submission timing,
//         // per-question grading, review meta). The modal forwards this to
//         // DocumentAnnotator's "Download Reviewed" feature.
//         reportContext={{
//           student: studentId
//             ? {
//                 name: studentId.name,
//                 email: studentId.email,
//                 rollNumber: studentId.rollNumber,
//               }
//             : null,
//           assignment: assignment
//             ? {
//                 title: assignment.title,
//                 description: assignment.description,
//                 createdAt: assignment.createdAt,
//                 dueDate: assignment.dueDate,
//                 totalMarks: assignment.totalMarks,
//               }
//             : null,
//           submission: {
//             submittedAt: submission.createdAt,
//             isLate: submission.isLate,
//             fileName: submissionFile?.originalName,
//             fileUrl: submissionFile?.url,
//           },
//           evaluation: {
//             totalScore: totalScore !== "" ? Number(totalScore) : null,
//             maxMarks: maxMarks || null,
//             feedback,
//             questionGrades: (answers || []).map((ans) => {
//               const q = ans.questionId;
//               const qId = q?._id || ans.questionId;
//               const grade = questionGrades[ans._id] || {};
//               return {
//                 questionText:
//                   q?.text || q?.questionText || `Question ${qId || ""}`,
//                 marks: grade.marks,
//                 isCorrect: grade.isCorrect,
//                 icon: annotations[qId],
//                 answer: ans.answer || ans.text || "",
//               };
//             }),
//           },
//           review: {
//             reviewedAt:
//               submission.status === "graded"
//                 ? submission.gradedAt || submission.updatedAt
//                 : null,
//             status: submission.status,
//           },
//         }}
//       />
//     </AdminLayout>
//   );
// }








import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Badge, Button } from "../../components/ui";
import {
  getSubmissionById,
  gradeSubmission,
  saveAnnotations,
  aiGradeText,
  aiReviewProject,
  acceptAiDraft,
  approveSubmission,
  requestResubmission,
} from "../../services/assignmentService";

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  FileText,
  Save,
  Loader2,
  AlertTriangle,
  User,
  Calendar,
  Award,
  MessageSquare,
  Star,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import DocumentAnnotatorModal from "../../components/documentViewer/DocumentAnnotatorModal";

const ICONS = [
  {
    key: "correct",
    label: "Correct",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-200",
  },
  {
    key: "partial",
    label: "Partial",
    icon: MinusCircle,
    color: "text-orange-500",
    bg: "bg-orange-50 border-orange-200",
  },
  {
    key: "wrong",
    label: "Wrong",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
  },
];

// Auto-expanding textarea hook
function useAutoExpand(value) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return ref;
}

export default function SubmissionReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Grading state
  const [totalScore, setTotalScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [questionGrades, setQuestionGrades] = useState({});
  const [annotations, setAnnotations] = useState({});

  // Document annotator modal
  const [annotatorOpen, setAnnotatorOpen] = useState(false);
  const [docAnnotations, setDocAnnotations] = useState([]);
  const annotationsAtModalOpenRef = useRef([]);
  const [autoSavingAnnotations, setAutoSavingAnnotations] = useState(false);

  // ✅ Module 5/6 — AI grading + approval workflow state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [resubmitFeedback, setResubmitFeedback] = useState("");
  const [showResubmitBox, setShowResubmitBox] = useState(false);

  const feedbackRef = useAutoExpand(feedback);

  // Auto-calculate total from per-question grades
  useEffect(() => {
    const total = Object.values(questionGrades).reduce(
      (sum, g) => sum + (g.marks || 0),
      0,
    );
    setTotalScore(String(total));
  }, [questionGrades]);

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const loadSubmission = useCallback(async () => {
    try {
      // FIX: getSubmissionById already returns res.data.data (the raw submission
      // object) — we must NOT try to unwrap .data again.
      const sub = await getSubmissionById(id);
      setSubmission(sub);

      // FIX: ALWAYS hydrate document annotations from the API response, not
      // only when status === "graded". A submission can have annotations saved
      // (via the inline "Save Annotations" button in the annotator modal)
      // BEFORE it gets a totalScore / feedback. Gating on status === "graded"
      // is exactly why annotations seemed to vanish after reload.
      //
      // Canonical field: `annotations`. We still fall back to the legacy
      // `documentAnnotations` so previously-graded rows keep working, but all
      // NEW writes go to `annotations` (see handleGrade below).
      setDocAnnotations(sub.annotations || sub.documentAnnotations || []);

      if (["graded", "ai_reviewed", "approved"].includes(sub.status)) {
        setTotalScore(sub.totalScore != null ? String(sub.totalScore) : "");
        setFeedback(sub.feedback || "");

        const ann = {};
        (sub.reviewAnnotations || []).forEach((a) => {
          ann[a.questionId] = a.icon;
        });
        setAnnotations(ann);

        const qg = {};
        (sub.answers || []).forEach((ans) => {
          if (ans.marksAwarded != null) {
            qg[ans._id] = { marks: ans.marksAwarded, isCorrect: ans.isCorrect };
          }
        });
        setQuestionGrades(qg);
      }
    } catch (err) {
      setError("Failed to load submission");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const setAnswerGrade = (answerId, field, value) => {
    setQuestionGrades((prev) => ({
      ...prev,
      [answerId]: { ...prev[answerId], [field]: value },
    }));
  };

  const setAnnotation = (questionId, icon) => {
    setAnnotations((prev) => {
      const updated = { ...prev };
      if (updated[questionId] === icon) delete updated[questionId];
      else updated[questionId] = icon;
      return updated;
    });
  };

  // Auto-save annotations when modal closes if they changed
  const handleAnnotatorClose = useCallback(async () => {
    const prev = annotationsAtModalOpenRef.current || [];
    const curr = docAnnotations || [];
    const changed = JSON.stringify(prev) !== JSON.stringify(curr);

    // Close the modal optimistically — the save runs in the background and
    // we refresh from the server afterwards. Closing first keeps the UX snappy
    // and prevents the modal from "freezing" while we wait on the network.
    setAnnotatorOpen(false);

    if (changed && submission?._id) {
      setAutoSavingAnnotations(true);
      try {
        await saveAnnotations(submission._id, curr);
        // FIX: After a successful save, reload from the server so the local
        // state (and the badge count on the "Open" tile) reflects what was
        // actually persisted. This is the same data the page would fetch on
        // a hard reload, so it guarantees the UI matches what the user will
        // see on F5.
        await loadSubmission();
      } catch (err) {
        console.error("Auto-save annotations failed:", err);
        // Keep the in-memory annotations so the user can retry; do NOT roll
        // back to annotationsAtModalOpenRef — that would silently destroy
        // their work.
      } finally {
        setAutoSavingAnnotations(false);
      }
    }
  }, [docAnnotations, submission?._id, loadSubmission]);

  const handleAnnotatorOpen = useCallback(() => {
    annotationsAtModalOpenRef.current = [...(docAnnotations || [])];
    setAnnotatorOpen(true);
  }, [docAnnotations]);

  const handleGrade = async () => {
    if (totalScore === "" || totalScore === null) {
      return setError("Please enter a total score");
    }
    setError("");
    setSaving(true);
    try {
      const qGrades = Object.entries(questionGrades).map(([answerId, g]) => ({
        answerId,
        marks: g.marks,
        isCorrect: g.isCorrect,
      }));

      const reviewAnnotations = Object.entries(annotations)
        .filter(([, icon]) => icon)
        .map(([questionId, icon]) => ({ questionId, icon }));

      await gradeSubmission(id, {
        totalScore: Number(totalScore),
        feedback,
        questionGrades: qGrades,
        reviewAnnotations,
        // FIX: Use the canonical field name `annotations` so the read path
        // (loadSubmission) and write path agree. Keep `documentAnnotations`
        // as well for one release so a backend that still expects the old
        // name doesn't break — it's harmless extra payload otherwise.
        annotations: docAnnotations,
        documentAnnotations: docAnnotations,
      });

      setSuccess(true);
      setError("");
      loadSubmission();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to grade submission");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Module 5 — AI Grading Engine actions

  const handleAiGradeText = async () => {
    setAiError("");
    setAiLoading(true);
    try {
      await aiGradeText(id);
      await loadSubmission();
    } catch (err) {
      setAiError(err.response?.data?.message || "AI grading failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiReviewProject = async () => {
    setAiError("");
    setAiLoading(true);
    try {
      await aiReviewProject(id);
      await loadSubmission();
    } catch (err) {
      setAiError(err.response?.data?.message || "AI review failed");
    } finally {
      setAiLoading(false);
    }
  };

  // "Accept Draft" — use the AI's numbers exactly as generated.
  const handleAcceptAiDraft = async () => {
    setAiError("");
    setAiLoading(true);
    try {
      await acceptAiDraft(id, {});
      await loadSubmission();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setAiError(err.response?.data?.message || "Failed to accept AI draft");
    } finally {
      setAiLoading(false);
    }
  };

  // "Accept & Edit" — admin has already tweaked totalScore/feedback/
  // questionGrades in the normal grading panel; commit those values
  // through the accept-ai-draft endpoint so it's recorded as an
  // AI-assisted grade rather than a from-scratch manual grade.
  const handleAcceptAiDraftWithEdits = async () => {
    setAiError("");
    setAiLoading(true);
    try {
      const qGrades = Object.entries(questionGrades).map(([answerId, g]) => ({
        answerId,
        marksAwarded: g.marks,
        isCorrect: g.isCorrect,
      }));
      await acceptAiDraft(id, {
        totalScore: totalScore !== "" ? Number(totalScore) : undefined,
        feedback,
        questionGrades: qGrades,
      });
      await loadSubmission();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setAiError(err.response?.data?.message || "Failed to save edited AI draft");
    } finally {
      setAiLoading(false);
    }
  };

  // ✅ Module 6 — Approval workflow

  const handleApprove = async () => {
    setError("");
    setActionLoading(true);
    try {
      await approveSubmission(id);
      await loadSubmission();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve submission");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestResubmission = async () => {
    setError("");
    setActionLoading(true);
    try {
      await requestResubmission(id, resubmitFeedback);
      setShowResubmitBox(false);
      setResubmitFeedback("");
      await loadSubmission();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request resubmission");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading submission…</p>
        </div>
      </AdminLayout>
    );
  }

  if (!submission) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Submission not found</p>
        </div>
      </AdminLayout>
    );
  }

  const {
    studentId,
    assignmentId: assignment,
    answers = [],
    submissionFile,
  } = submission;
  const maxMarks = Number(assignment?.totalMarks || 0);
  const percentage =
    maxMarks > 0 && totalScore !== ""
      ? Math.min(100, (Number(totalScore) / maxMarks) * 100)
      : 0;

  const gradeColor =
    percentage >= 70 ? "text-emerald-600" :
    percentage >= 40 ? "text-orange-500" :
    "text-red-500";

  return (
    <AdminLayout>
      <div className="animate-fadeIn max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition"
            >
              <ArrowLeft size={15} /> Back to submissions
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {assignment?.title || "Submission Review"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <User size={13} /> {studentId?.name || "Student"}
              </span>
              {studentId?.email && (
                <span className="text-gray-300 hidden sm:inline">|</span>
              )}
              {studentId?.email && (
                <span className="text-xs text-gray-400">{studentId.email}</span>
              )}
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(submission.createdAt).toLocaleString()}
              </span>
              {submission.isLate && (
                <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                  <AlertTriangle size={12} /> Late
                </span>
              )}
              <Badge
                variant={
                  ["graded", "approved"].includes(submission.status)
                    ? "success"
                    : submission.status === "submitted"
                      ? "primary"
                      : submission.status === "resubmission_required"
                        ? "danger"
                        : "warning"
                }
              >
                {submission.status}
              </Badge>
              {submission.passFail && submission.passFail !== "pending" && (
                <Badge variant={submission.passFail === "pass" ? "success" : "danger"}>
                  {submission.passFail === "pass" ? "Pass" : "Fail"}
                </Badge>
              )}
              {submission.approvalStatus === "pending" && (
                <Badge variant="warning">Approval Pending</Badge>
              )}
              {submission.approvalStatus === "approved" && (
                <Badge variant="success">
                  <ShieldCheck size={11} className="inline mr-1" />
                  Approved
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
            <AlertTriangle size={14} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-200">
            <CheckCircle2 size={14} /> Submission graded successfully!
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left: Document + Answers ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Submitted file */}
            {submissionFile?.url ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-indigo-500" />
                  Submitted Document
                </h3>
                <div
                  onClick={handleAnnotatorOpen}
                  className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 rounded-xl border border-indigo-100 transition group cursor-pointer"
                >
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-200 shadow-sm">
                    <FileText size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-700 truncate">
                      {submissionFile.originalName || "Open submission"}
                    </p>
                    <p className="text-xs text-indigo-400 mt-0.5">
                      Click to open & annotate
                      {docAnnotations.length > 0 && (
                        <span className="ml-2 text-indigo-500 font-medium">
                          · {docAnnotations.length} annotation{docAnnotations.length !== 1 ? "s" : ""} saved
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg group-hover:bg-indigo-700 transition flex-shrink-0">
                    Open
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex items-center gap-3 text-sm text-amber-700">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">No submission file</p>
                  <p className="text-xs text-amber-500 mt-0.5">
                    The student did not upload a file with this submission.
                  </p>
                </div>
              </div>
            )}

            {/* Assignment reference file */}
            {assignment?.file?.url && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-gray-400" />
                  Assignment File (reference)
                </h3>
                <a
                  href={assignment.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
                >
                  <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {assignment.file.originalName || "Assignment file"}
                    </p>
                    <p className="text-xs text-gray-400">View assignment document</p>
                  </div>
                </a>
              </div>
            )}

            {/* Answers */}
            {answers.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Student Answers ({answers.length})
                  </h3>
                  <span className="text-xs text-gray-400">
                    {Object.keys(questionGrades).length}/{answers.length} graded
                  </span>
                </div>

                <div className="divide-y divide-gray-50">
                  {answers.map((ans, i) => {
                    const question = ans.questionId;
                    const qId = question?._id || ans.questionId;
                    const answerId = ans._id;
                    const currentIcon = annotations[qId];
                    const currentGrade = questionGrades[answerId] || {};

                    return (
                      <div key={answerId || i} className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 mb-1">
                              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <p className="text-sm font-medium text-gray-800 flex-1">
                                {question?.prompt || `Question ${i + 1}`}
                              </p>
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {question?.marks ?? "?"} marks
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-8 space-y-3">
                          {/* Answer */}
                          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                            {ans.selectedOption ? (
                              <p className="text-sm text-gray-700">
                                <span className="text-xs text-gray-400 mr-2">Selected:</span>
                                <span className="font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                                  {ans.selectedOption}
                                </span>
                              </p>
                            ) : ans.textAnswer ? (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {ans.textAnswer}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No answer provided</p>
                            )}
                          </div>

                          {/* Mark icons */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Mark:</span>
                            {ICONS.map(({ key, label, icon: Icon, color, bg }) => (
                              <button
                                key={key}
                                onClick={() => setAnnotation(qId, key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                  currentIcon === key
                                    ? `${bg} ${color} border-current`
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                                title={label}
                              >
                                <Icon size={13} className={currentIcon === key ? color : ""} />
                                {label}
                              </button>
                            ))}
                          </div>

                          {/* Marks input */}
                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-500 flex-shrink-0">
                              Marks awarded:
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={question?.marks}
                              value={currentGrade.marks ?? ""}
                              onChange={(e) =>
                                setAnswerGrade(answerId, "marks", Number(e.target.value))
                              }
                              className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              placeholder="0"
                            />
                            <span className="text-xs text-gray-400">
                              / {question?.marks ?? "?"}
                            </span>
                            {currentGrade.marks != null && question?.marks && (
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                                <div
                                  className="h-full bg-indigo-400 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, (currentGrade.marks / question.marks) * 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 shadow-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No text answers — student submitted a file</p>
              </div>
            )}
          </div>

          {/* ── Right: Grading Panel ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <Award size={16} className="text-indigo-500" />
                Grade Submission
              </h3>

              {/* Score */}
              <div className="mb-5">
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Total Score
                  {maxMarks > 0 && (
                    <span className="text-gray-400 ml-1">/ {maxMarks}</span>
                  )}
                </label>
                <input
                  type="number"
                  min={0}
                  max={maxMarks || undefined}
                  value={totalScore}
                  onChange={(e) => setTotalScore(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 text-center"
                  placeholder="0"
                />

                {maxMarks > 0 && totalScore !== "" && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage >= 70 ? "bg-emerald-500" :
                          percentage >= 40 ? "bg-orange-400" :
                          "bg-red-400"
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                    <p className={`text-sm font-semibold mt-1.5 text-right ${gradeColor}`}>
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div className="mb-5">
                <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                  <MessageSquare size={12} /> Feedback for student
                </label>
                <textarea
                  ref={feedbackRef}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Great work on… You could improve…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  style={{
                    resize: "none",
                    minHeight: "120px",
                    maxHeight: "300px",
                    overflowY: feedback.length > 800 ? "auto" : "hidden",
                  }}
                />
              </div>

              {/* Summary stats */}
              <div className="bg-gray-50 rounded-xl p-3.5 mb-5 space-y-2">
                {[
                  { label: "Questions answered", value: answers.length },
                  {
                    label: "Q annotations",
                    value: `${Object.values(annotations).filter(Boolean).length}/${answers.length}`,
                  },
                  {
                    label: "Doc annotations",
                    value: (
                      <span className="font-medium flex items-center gap-1">
                        {autoSavingAnnotations && (
                          <Loader2 size={10} className="animate-spin text-indigo-500" />
                        )}
                        {docAnnotations.length}
                      </span>
                    ),
                  },
                  {
                    label: "Graded answers",
                    value: `${Object.keys(questionGrades).length}/${answers.length}`,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-700">{value}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleGrade}
                disabled={saving}
                className="w-full justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save size={15} /> Submit Grade
                  </>
                )}
              </Button>

              {submission.status === "graded" && (
                <p className="text-xs text-center text-gray-400 mt-2.5">
                  Graded on{" "}
                  {submission.gradedAt
                    ? new Date(submission.gradedAt).toLocaleDateString()
                    : "—"}{" "}
                  by {submission.gradedBy?.name || "—"}
                </p>
              )}

              {/* ✅ Module 5 — AI Grading Engine panel */}
              {assignment?.aiGradingEnabled && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-indigo-500" /> AI Grading
                  </p>

                  {aiError && (
                    <div className="mb-3 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs border border-red-200">
                      {aiError}
                    </div>
                  )}

                  {!submission.aiDraft?.generatedAt && (
                    <Button
                      variant="secondary"
                      className="w-full justify-center"
                      disabled={aiLoading}
                      onClick={
                        assignment?.assessmentType === "project_submission"
                          ? handleAiReviewProject
                          : handleAiGradeText
                      }
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Generating AI draft…
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} /> Generate AI Draft
                        </>
                      )}
                    </Button>
                  )}

                  {submission.aiDraft?.generatedAt && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-indigo-700">AI Draft</span>
                        <span className="text-xs text-indigo-400">
                          {new Date(submission.aiDraft.generatedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-indigo-900">
                        Suggested score: {submission.aiDraft.score ?? "—"}
                        {maxMarks > 0 ? ` / ${maxMarks}` : ""}
                      </p>
                      <Badge variant={submission.aiDraft.suggestedPass ? "success" : "danger"}>
                        AI suggests: {submission.aiDraft.suggestedPass ? "Pass" : "Fail"}
                      </Badge>
                      {submission.aiDraft.overallFeedback && (
                        <p className="text-xs text-indigo-800 leading-relaxed">
                          {submission.aiDraft.overallFeedback}
                        </p>
                      )}
                      {submission.aiDraft.accepted ? (
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Draft accepted
                        </p>
                      ) : (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 justify-center"
                            disabled={aiLoading}
                            onClick={handleAcceptAiDraft}
                          >
                            Accept Draft
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1 justify-center"
                            disabled={aiLoading}
                            onClick={handleAcceptAiDraftWithEdits}
                          >
                            Accept &amp; Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ✅ Module 6 — Approve / Request Resubmission actions */}
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
                {["graded", "ai_reviewed"].includes(submission.status) &&
                  submission.approvalStatus !== "approved" && (
                    <Button
                      variant="secondary"
                      className="w-full justify-center"
                      disabled={actionLoading}
                      onClick={handleApprove}
                    >
                      <ShieldCheck size={15} /> Approve Completion
                    </Button>
                  )}

                {submission.approvalStatus === "approved" && (
                  <p className="text-xs text-center text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <ShieldCheck size={13} /> Approved by{" "}
                    {submission.approvedBy?.name || "admin"} on{" "}
                    {submission.approvedAt
                      ? new Date(submission.approvedAt).toLocaleDateString()
                      : ""}
                  </p>
                )}

                {submission.status !== "resubmission_required" &&
                  assignment?.allowResubmission !== false && (
                    <>
                      {!showResubmitBox ? (
                        <Button
                          variant="secondary"
                          className="w-full justify-center"
                          onClick={() => setShowResubmitBox(true)}
                        >
                          <RotateCcw size={15} /> Request Resubmission
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            value={resubmitFeedback}
                            onChange={(e) => setResubmitFeedback(e.target.value)}
                            placeholder="Explain what the student needs to fix before resubmitting…"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 justify-center"
                              disabled={actionLoading}
                              onClick={handleRequestResubmission}
                            >
                              Send Back to Student
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1 justify-center"
                              onClick={() => setShowResubmitBox(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                {submission.status === "resubmission_required" && (
                  <p className="text-xs text-center text-orange-500 font-medium">
                    Waiting for student to resubmit
                    {submission.resubmissionFeedback
                      ? `: "${submission.resubmissionFeedback}"`
                      : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Annotator Modal */}
      <DocumentAnnotatorModal
        open={annotatorOpen}
        onClose={handleAnnotatorClose}
        fileUrl={submissionFile?.url}
        fileName={submissionFile?.originalName}
        submissionId={submission._id}
        annotations={docAnnotations}
        onChange={setDocAnnotations}
        readOnly={false}
        feedback={feedback}
        totalScore={totalScore !== "" ? Number(totalScore) : null}
        maxMarks={maxMarks || null}
        // FIX: Hand the modal everything it needs to produce a FULL evaluation
        // report (student details, assignment metadata, submission timing,
        // per-question grading, review meta). The modal forwards this to
        // DocumentAnnotator's "Download Reviewed" feature.
        reportContext={{
          student: studentId
            ? {
                name: studentId.name,
                email: studentId.email,
                rollNumber: studentId.rollNumber,
              }
            : null,
          assignment: assignment
            ? {
                title: assignment.title,
                description: assignment.description,
                createdAt: assignment.createdAt,
                dueDate: assignment.dueDate,
                totalMarks: assignment.totalMarks,
              }
            : null,
          submission: {
            submittedAt: submission.createdAt,
            isLate: submission.isLate,
            fileName: submissionFile?.originalName,
            fileUrl: submissionFile?.url,
          },
          evaluation: {
            totalScore: totalScore !== "" ? Number(totalScore) : null,
            maxMarks: maxMarks || null,
            feedback,
            questionGrades: (answers || []).map((ans) => {
              const q = ans.questionId;
              const qId = q?._id || ans.questionId;
              const grade = questionGrades[ans._id] || {};
              return {
                questionText:
                  q?.text || q?.questionText || `Question ${qId || ""}`,
                marks: grade.marks,
                isCorrect: grade.isCorrect,
                icon: annotations[qId],
                answer: ans.answer || ans.text || "",
              };
            }),
          },
          review: {
            reviewedAt:
              submission.status === "graded"
                ? submission.gradedAt || submission.updatedAt
                : null,
            status: submission.status,
          },
        }}
      />
    </AdminLayout>
  );
}
