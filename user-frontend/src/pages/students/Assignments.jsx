// import { useEffect, useState, useRef, useCallback } from "react";
// import { Link } from "react-router-dom";
// import {
//   FileText,
//   Calendar,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
//   Send,
//   Loader2,
//   Award,
//   BookOpen,
//   MessageSquare,
//   Upload,
//   X,
//   Download,
//   File,
//   Star,
//   RotateCcw,
//   Eye,
//   Paperclip,
//   CheckCheck,
//   AlertTriangle,
//   Trophy,
//   Lock,
//   RefreshCw,
//   PencilLine,
// } from "lucide-react";

// import {
//   getAssignments,
//   submitAssignment,
//   resubmitAssignment,
//   getMySubmissionForAssignment,
// } from "../../services/studentService";

// import MainLayout from "../../components/layout/MainLayout";

// // ─── HELPERS ────────────────────────────────────────────────────────────────

// const getDueDateInfo = (dueDate) => {
//   if (!dueDate) return null;
//   const due = new Date(dueDate);
//   const now = new Date();
//   const diff = due - now;
//   const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
//   return {
//     text: due.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     }),
//     daysLeft: days,
//     isOverdue: days < 0,
//   };
// };

// const formatScore = (score, total) => {
//   if (score == null) return null;
//   const pct = total ? Math.round((score / total) * 100) : 0;
//   return { score, total, pct };
// };

// const getScoreColor = (pct) => {
//   if (pct >= 80)
//     return {
//       text: "text-emerald-600",
//       bg: "bg-emerald-50",
//       bar: "bg-emerald-500",
//     };
//   if (pct >= 60)
//     return { text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500" };
//   return { text: "text-red-500", bg: "bg-red-50", bar: "bg-red-500" };
// };

// // Sanitize a string for use as a filename
// const sanitizeForFilename = (s = "") =>
//   s
//     .replace(/[\\/:*?"<>|]+/g, "")
//     .replace(/\s+/g, "_")
//     .trim() || "file";

// // Blob-forced download — preserves the original filename instead of cloudinary hash
// const triggerDownload = async (url, filename) => {
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     const objectUrl = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = objectUrl;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(objectUrl);
//   } catch (err) {
//     console.error("Download failed:", err);
//     // Last-resort: open in new tab so the user can save it
//     window.open(url, "_blank");
//   }
// };

// // ─── STATUS BADGE ─────────────────────────────────────────────────────────────

// const StatusBadge = ({ status, isLate }) => {
//   const safe = status || "not_submitted";
//   const map = {
//     graded: {
//       cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
//       icon: <CheckCheck size={11} />,
//       label: "Graded",
//     },
//     approved: {
//       cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
//       icon: <CheckCheck size={11} />,
//       label: "Approved",
//     },
//     ai_reviewed: {
//       cls: "bg-violet-100 text-violet-700 border border-violet-200",
//       icon: <Clock size={11} />,
//       label: "AI Reviewed",
//     },
//     resubmission_required: {
//       cls: "bg-orange-100 text-orange-700 border border-orange-200",
//       icon: <RotateCcw size={11} />,
//       label: "Resubmission Needed",
//     },
//     submitted: {
//       cls: "bg-indigo-100 text-indigo-700 border border-indigo-200",
//       icon: <Clock size={11} />,
//       label: "Submitted",
//     },
//     not_submitted: {
//       cls: "bg-slate-100 text-slate-500 border border-slate-200",
//       icon: <AlertCircle size={11} />,
//       label: "Pending",
//     },
//   };
//   const { cls, icon, label } = map[safe] || map.not_submitted;
//   return (
//     <span
//       className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${cls}`}
//     >
//       {icon}
//       {label}
//       {isLate && safe !== "not_submitted" && (
//         <span className="ml-1 text-orange-500 font-semibold">· Late</span>
//       )}
//     </span>
//   );
// };

// // ─── SCORE RING ───────────────────────────────────────────────────────────────

// const ScoreRing = ({ pct }) => {
//   const c = getScoreColor(pct);
//   const r = 22;
//   const circ = 2 * Math.PI * r;
//   const dash = (pct / 100) * circ;
//   return (
//     <div
//       className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full ${c.bg}`}
//     >
//       <svg width="64" height="64" className="absolute top-0 left-0 -rotate-90">
//         <circle
//           cx="32"
//           cy="32"
//           r={r}
//           fill="none"
//           stroke="#e2e8f0"
//           strokeWidth="4"
//         />
//         <circle
//           cx="32"
//           cy="32"
//           r={r}
//           fill="none"
//           stroke={pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444"}
//           strokeWidth="4"
//           strokeDasharray={`${dash} ${circ}`}
//           strokeLinecap="round"
//           style={{ transition: "stroke-dasharray 0.8s ease" }}
//         />
//       </svg>
//       <span className={`text-sm font-bold ${c.text}`}>{pct}%</span>
//     </div>
//   );
// };

// // ─── FILE DROP ZONE (PDF ONLY) ─────────────────────────────────────────────
// // FIX: Restricted to PDF only for student submissions (FROM .pdf,.doc,.docx,.ppt,.pptx,.csv → TO .pdf)

// const FileDropZone = ({ file, onFile, onClear, assignmentId }) => {
//   const inputRef = useRef();
//   const [dragging, setDragging] = useState(false);

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragging(false);
//     const f = e.dataTransfer.files[0];
//     if (f) onFile(f);
//   };

//   return (
//     <div
//       onDragOver={(e) => {
//         e.preventDefault();
//         setDragging(true);
//       }}
//       onDragLeave={() => setDragging(false)}
//       onDrop={handleDrop}
//       onClick={() => !file && inputRef.current?.click()}
//       className={`
//         relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all
//         ${dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}
//         ${file ? "cursor-default" : ""}
//       `}
//     >
//       <input
//         ref={inputRef}
//         type="file"
//         className="hidden"
//         accept=".pdf,application/pdf"
//         onChange={(e) => onFile(e.target.files[0])}
//       />

//       {file ? (
//         <div className="flex items-center justify-between gap-3">
//           <div className="flex items-center gap-3 min-w-0">
//             <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
//               <File size={18} className="text-indigo-600" />
//             </div>
//             <div className="text-left min-w-0">
//               <p className="text-sm font-medium text-slate-700 truncate">
//                 {file.name}
//               </p>
//               <p className="text-xs text-slate-400">
//                 {(file.size / 1024 / 1024).toFixed(2)} MB
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onClear();
//             }}
//             className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
//           >
//             <X size={16} />
//           </button>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
//             <Upload size={18} className="text-slate-400" />
//           </div>
//           <p className="text-sm text-slate-500">
//             <span className="font-medium text-indigo-600">Click to upload</span>{" "}
//             or drag & drop
//           </p>
//           <p className="text-xs text-slate-400">PDF only — up to 100MB</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── QUESTION INPUT ───────────────────────────────────────────────────────────

// const QuestionInput = ({ question, answer, onChange }) => {
//   const q = question;

//   if (q.type === "mcq" && q.options?.length > 0) {
//     return (
//       <div className="space-y-2">
//         <p className="text-sm font-medium text-slate-700">{q.prompt}</p>
//         <div className="space-y-1.5">
//           {q.options.map((opt, i) => (
//             <label
//               key={i}
//               className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
//                 answer?.selectedOption === opt
//                   ? "border-indigo-400 bg-indigo-50"
//                   : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
//               }`}
//             >
//               <input
//                 type="radio"
//                 name={`q-${q._id}`}
//                 value={opt}
//                 checked={answer?.selectedOption === opt}
//                 onChange={() => onChange("selectedOption", opt)}
//                 className="text-indigo-600"
//               />
//               <span className="text-sm text-slate-700">{opt}</span>
//             </label>
//           ))}
//         </div>
//         {q.marks && (
//           <p className="text-xs text-slate-400">
//             {q.marks} mark{q.marks !== 1 ? "s" : ""}
//           </p>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-1.5">
//       <div className="flex items-start justify-between gap-2">
//         <p className="text-sm font-medium text-slate-700">{q.prompt}</p>
//         {q.marks && (
//           <span className="text-xs text-slate-400 shrink-0">
//             {q.marks} mark{q.marks !== 1 ? "s" : ""}
//           </span>
//         )}
//       </div>
//       <textarea
//         rows={3}
//         placeholder="Type your answer here..."
//         value={answer?.textAnswer || ""}
//         onChange={(e) => onChange("textAnswer", e.target.value)}
//         className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-y transition-all"
//       />
//     </div>
//   );
// };

// // ─── SUBMISSION RESULT VIEW ───────────────────────────────────────────────────

// const SubmissionResult = ({ sub, assignment }) => {
//   if (!sub) return null;
//   const scoreData = formatScore(sub.totalScore, assignment?.totalMarks);
//   const annotationCount = sub.annotations?.length || 0;
//   // ✅ treat AI-reviewed/approved the same as graded for display purposes
//   const isGradedLike = ["graded", "ai_reviewed", "approved"].includes(
//     sub.status,
//   );

//   // Build reviewed-PDF download filename: [studentName]-[assignmentTitle]-reviewed.pdf
//   const reviewedFilename = () => {
//     const student = sanitizeForFilename(sub.studentId?.name || "student");
//     const title = sanitizeForFilename(assignment?.title || "assignment");
//     return `${student}-${title}-reviewed.pdf`;
//   };

//   return (
//     <div className="space-y-4">
//       {/* ✅ Module 8 — link to the full result page */}
//       {["graded", "ai_reviewed", "approved"].includes(sub.status) &&
//         assignment?._id && (
//           <Link
//             to={`/student/assignments/${assignment._id}/result`}
//             className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
//           >
//             View Full Result →
//           </Link>
//         )}

//       {/* Score */}
//       {isGradedLike && scoreData && (
//         <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
//           <ScoreRing pct={scoreData.pct} />
//           <div className="flex-1">
//             <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
//               Your Score
//             </p>
//             <p className="text-2xl font-bold text-slate-800">
//               {scoreData.score}
//               <span className="text-slate-400 text-lg font-normal">
//                 {" "}
//                 / {scoreData.total}
//               </span>
//             </p>
//           </div>
//           {annotationCount > 0 && (
//             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
//               <PencilLine size={11} />
//               {annotationCount} annotation{annotationCount !== 1 ? "s" : ""}
//             </span>
//           )}
//         </div>
//       )}

//       {/* Feedback */}
//       {sub.feedback && (
//         <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
//           <div className="flex items-center gap-2 mb-2">
//             <MessageSquare size={14} className="text-amber-600" />
//             <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
//               Tutor Feedback
//             </p>
//           </div>
//           <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
//             {sub.feedback}
//           </p>
//         </div>
//       )}

//       {/* Submitted file — blob-forced download with originalName */}
//       {sub.submissionFile?.url && (
//         <button
//           type="button"
//           onClick={() =>
//             triggerDownload(
//               sub.submissionFile.url,
//               sub.submissionFile.originalName || "my-submission.pdf",
//             )
//           }
//           className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
//         >
//           <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
//             <Download
//               size={16}
//               className="text-slate-500 group-hover:text-indigo-600"
//             />
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="text-sm font-medium text-slate-700 truncate">
//               {sub.submissionFile.originalName || "Submitted File"}
//             </p>
//             <p className="text-xs text-indigo-500">Download my submission ↓</p>
//           </div>
//         </button>
//       )}

//       {/* Reviewed PDF download (only when graded AND submission file exists) */}
//       {isGradedLike && sub.submissionFile?.url && (
//         <button
//           type="button"
//           onClick={() =>
//             triggerDownload(sub.submissionFile.url, reviewedFilename())
//           }
//           className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all group"
//         >
//           <div className="w-9 h-9 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
//             <Award size={16} className="text-emerald-700" />
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="text-sm font-medium text-emerald-800 truncate">
//               Reviewed Submission
//             </p>
//             <p className="text-xs text-emerald-700">
//               Download annotated copy ↓
//             </p>
//           </div>
//         </button>
//       )}

//       {/* Per-question results */}
//       {sub.answers?.length > 0 && (
//         <div className="space-y-3">
//           <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
//             Your Answers
//           </p>
//           {sub.answers.map((ans, i) => {
//             const q = ans.questionId;
//             const isCorrect = ans.isCorrect;
//             const awarded = ans.marksAwarded;
//             return (
//               <div
//                 key={ans._id}
//                 className={`rounded-xl border p-3 space-y-2 ${
//                   isGradedLike
//                     ? isCorrect === true
//                       ? "border-emerald-200 bg-emerald-50"
//                       : isCorrect === false
//                         ? "border-red-200 bg-red-50"
//                         : "border-slate-200 bg-white"
//                     : "border-slate-200 bg-white"
//                 }`}
//               >
//                 <div className="flex items-start justify-between gap-2">
//                   <p className="text-xs font-medium text-slate-600">
//                     Q{i + 1}. {q?.prompt}
//                   </p>
//                   {isGradedLike && awarded != null && (
//                     <span className="text-xs font-semibold text-slate-500 shrink-0">
//                       {awarded}/{q?.marks || "?"}
//                     </span>
//                   )}
//                 </div>
//                 <p className="text-sm text-slate-700">
//                   {ans.textAnswer || ans.selectedOption || (
//                     <span className="italic text-slate-400">No answer</span>
//                   )}
//                 </p>
//                 {isGradedLike && q?.correctAnswer && (
//                   <p className="text-xs text-emerald-600">
//                     ✓ Correct: {q.correctAnswer}
//                   </p>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Review annotations */}
//       {sub.reviewAnnotations?.length > 0 && (
//         <div className="space-y-2">
//           <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
//             Review Notes
//           </p>
//           {sub.reviewAnnotations.map((ann, i) => (
//             <div
//               key={i}
//               className="flex items-start gap-2 text-sm text-slate-600"
//             >
//               <span>{ann.icon || "📝"}</span>
//               <span>{ann.note}</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── REPLACE-SUBMISSION PANEL ────────────────────────────────────────────────
// // Shown for submitted-but-not-graded entries when due date has not passed.
// const ReplaceSubmissionPanel = ({
//   sub,
//   assignment,
//   onResubmitDone,
//   onError,
// }) => {
//   const [newFile, setNewFile] = useState(null);
//   const [showReplace, setShowReplace] = useState(false);
//   const [busy, setBusy] = useState(false);

//   // ✅ FIX: Mirror the backend's resubmission gating (assignment.js
//   // service — allowResubmission / maxResubmissions) here so the
//   // "Replace Submission" button doesn't stay visible and clickable
//   // when a resubmission would just be rejected with a 403. Defaults
//   // match the backend's own defaults (maxResubmissions ?? 3).
//   const resubmissionCount = sub?.resubmissionCount || 0;
//   const maxResubmissions = Number(assignment?.maxResubmissions ?? 3);
//   const allowResubmission = assignment?.allowResubmission !== false;

//   const resubmissionBlocked =
//     (!allowResubmission && resubmissionCount > 0) ||
//     (maxResubmissions > 0 && resubmissionCount >= maxResubmissions);

//   if (resubmissionBlocked) {
//     return (
//       <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
//         <Lock size={14} />
//         {!allowResubmission
//           ? "Resubmission is not allowed for this assignment."
//           : `Maximum number of resubmissions (${maxResubmissions}) reached.`}
//       </div>
//     );
//   }

//   const submitReplace = async () => {
//     if (!newFile) return;
//     setBusy(true);
//     try {
//       const fd = new FormData();
//       fd.append("file", newFile);
//       const updated = await resubmitAssignment(assignment._id, fd);
//       onResubmitDone(updated);
//       setNewFile(null);
//       setShowReplace(false);
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to replace submission.";
//       onError(msg);
//     } finally {
//       setBusy(false);
//     }
//   };

//   if (!showReplace) {
//     return (
//       <button
//         type="button"
//         onClick={() => setShowReplace(true)}
//         className="w-full flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 py-2.5 rounded-xl transition-all"
//       >
//         <RefreshCw size={14} />
//         Replace Submission
//       </button>
//     );
//   }

//   return (
//     <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
//       <div className="flex items-center justify-between">
//         <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
//           Upload a new PDF
//         </p>
//         <button
//           type="button"
//           onClick={() => {
//             setShowReplace(false);
//             setNewFile(null);
//           }}
//           className="p-1 rounded-md hover:bg-white text-slate-400 hover:text-slate-600 transition-colors"
//         >
//           <X size={14} />
//         </button>
//       </div>

//       <FileDropZone
//         file={newFile}
//         onFile={(f) => setNewFile(f)}
//         onClear={() => setNewFile(null)}
//         assignmentId={assignment._id}
//       />

//       <button
//         type="button"
//         onClick={submitReplace}
//         disabled={!newFile || busy}
//         className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
//       >
//         {busy ? (
//           <>
//             <Loader2 size={15} className="animate-spin" />
//             Replacing…
//           </>
//         ) : (
//           <>
//             <Send size={15} />
//             Confirm Replace
//           </>
//         )}
//       </button>
//     </div>
//   );
// };

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

// export default function Assignments() {
//   const [assignments, setAssignments] = useState([]);
//   const [expandedId, setExpandedId] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [files, setFiles] = useState({});
//   const [mode, setMode] = useState({}); // "text" | "file"
//   const [submitting, setSubmitting] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [cached, setCached] = useState({}); // submission cache by assignmentId
//   const [errors, setErrors] = useState({});
//   const [globalError, setGlobalError] = useState(null);
//   const [successId, setSuccessId] = useState(null);

//   // ── Load assignments ─────────────────────────────────────────────────────

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getAssignments();
//         const normalized = (data?.assignments || data || []).map((a) => ({
//           ...a,
//           submissionStatus: a.submissionStatus || "not_submitted",
//         }));
//         setAssignments(normalized);
//       } catch {
//         setGlobalError("Failed to load assignments. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // ── Toggle expand + fetch submission ────────────────────────────────────

//   const toggleExpand = async (a) => {
//     const id = a._id;
//     if (expandedId === id) {
//       setExpandedId(null);
//       return;
//     }
//     setExpandedId(id);

//     if (cached[id] !== undefined) return; // already fetched

//     try {
//       // getMySubmissionForAssignment already normalizes "no submission
//       // yet" (backend 200 + data:null) into a plain `null` — that is
//       // NOT an error, it's a legitimate cache value meaning "not
//       // submitted". Any exception here is a genuine fetch failure.
//       const sub = await getMySubmissionForAssignment(id);
//       setCached((p) => ({ ...p, [id]: sub }));
//       if (sub?.status) {
//         setAssignments((prev) =>
//           prev.map((x) =>
//             x._id === id ? { ...x, submissionStatus: sub.status } : x,
//           ),
//         );
//       }
//     } catch (err) {
//       // Genuine failure (network/500/auth) — surface it instead of
//       // silently pretending there's no submission.
//       const msg =
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to load submission details.";
//       setErrors((p) => ({ ...p, [id]: msg }));
//       setCached((p) => ({ ...p, [id]: undefined }));
//     }
//   };

//   // ── Answer handler ───────────────────────────────────────────────────────

//   const handleAnswer = useCallback((aId, qId, field, val) => {
//     setAnswers((p) => ({
//       ...p,
//       [aId]: {
//         ...p[aId],
//         [qId]: { ...p[aId]?.[qId], questionId: qId, [field]: val },
//       },
//     }));
//   }, []);

//   // ── Submit ───────────────────────────────────────────────────────────────

//   const handleSubmit = async (a) => {
//     const id = a._id;
//     setErrors((p) => ({ ...p, [id]: null }));

//     if (mode[id] === "file") {
//       if (!files[id]) {
//         setErrors((p) => ({ ...p, [id]: "Please select a file to upload." }));
//         return;
//       }
//     }

//     setSubmitting(id);
//     try {
//       let result;
//       if (mode[id] === "file") {
//         const fd = new FormData();
//         fd.append("file", files[id]);
//         result = await submitAssignment(id, fd);
//       } else {
//         const ans = Object.values(answers[id] || {});
//         result = await submitAssignment(id, { answers: ans });
//       }

//       // Update local state
//       setAssignments((prev) =>
//         prev.map((x) =>
//           x._id === id ? { ...x, submissionStatus: "submitted" } : x,
//         ),
//       );
//       setCached((p) => ({ ...p, [id]: result }));
//       setSuccessId(id);
//       setTimeout(() => setSuccessId(null), 4000);
//       setExpandedId(null);
//     } catch (e) {
//       const msg =
//         e?.response?.data?.message ||
//         e?.message ||
//         "Submission failed. Please try again.";
//       setErrors((p) => ({ ...p, [id]: msg }));
//     } finally {
//       setSubmitting(null);
//     }
//   };

//   // ── Resubmit handler ─────────────────────────────────────────────────────
//   // Called from <ReplaceSubmissionPanel> with the updated submission payload.

//   const handleResubmitDone = (assignmentId, updated) => {
//     setCached((p) => ({ ...p, [assignmentId]: updated }));
//     setAssignments((prev) =>
//       prev.map((x) =>
//         x._id === assignmentId ? { ...x, submissionStatus: "submitted" } : x,
//       ),
//     );
//     setSuccessId(assignmentId);
//     setTimeout(() => setSuccessId(null), 4000);
//   };

//   // ── Render ───────────────────────────────────────────────────────────────

//   return (
//     <MainLayout>
//       <div className="min-h-screen bg-slate-50">
//         <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
//                 Assignments
//               </h1>
//               <p className="text-sm text-slate-500 mt-0.5">
//                 {assignments.length > 0
//                   ? `${assignments.filter((a) => a.submissionStatus === "not_submitted").length} pending`
//                   : "Your coursework"}
//               </p>
//             </div>
//             <div className="flex items-center gap-2 text-xs text-slate-400">
//               <BookOpen size={14} />
//               <span>
//                 {assignments.length} assignment
//                 {assignments.length !== 1 ? "s" : ""}
//               </span>
//             </div>
//           </div>

//           {/* Global success toast */}
//           {successId && (
//             <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
//               <CheckCircle2 size={16} />
//               Submission saved successfully!
//             </div>
//           )}

//           {/* Global error */}
//           {globalError && (
//             <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
//               <AlertTriangle size={16} />
//               {globalError}
//             </div>
//           )}

//           {/* Loading */}
//           {loading && (
//             <div className="flex items-center justify-center py-20">
//               <div className="flex items-center gap-3 text-slate-400">
//                 <Loader2 size={20} className="animate-spin" />
//                 <span className="text-sm">Loading assignments…</span>
//               </div>
//             </div>
//           )}

//           {/* Empty */}
//           {!loading && assignments.length === 0 && (
//             <div className="text-center py-20 space-y-3">
//               <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
//                 <FileText size={24} className="text-slate-400" />
//               </div>
//               <p className="text-slate-500 text-sm">No assignments yet</p>
//             </div>
//           )}

//           {/* Assignment list */}
//           {assignments.map((a) => {
//             const id = a._id;
//             const due = getDueDateInfo(a.dueDate);
//             const isOpen = expandedId === id;
//             const sub = cached[id];
//             const hasSubmission = a.submissionStatus !== "not_submitted";
//             const isGraded = ["graded", "ai_reviewed", "approved"].includes(
//               a.submissionStatus,
//             );
//             const isPastDue = !!(a.dueDate && new Date() > new Date(a.dueDate));
//             const scoreData = isGraded
//               ? formatScore(sub?.totalScore, a.totalMarks)
//               : null;
//             const localMode = mode[id] || "text";
//             const localError = errors[id];
//             const annotationCount = sub?.annotations?.length || 0;

//             return (
//               <div
//                 key={id}
//                 className={`bg-white rounded-2xl border transition-all duration-200 ${
//                   isOpen
//                     ? "border-indigo-200 shadow-md"
//                     : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow"
//                 }`}
//               >
//                 {/* ── Card header ── */}
//                 <button
//                   className="w-full text-left p-5 flex items-start gap-4"
//                   onClick={() => toggleExpand(a)}
//                 >
//                   {/* Icon */}
//                   <div
//                     className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
//                       isGraded
//                         ? "bg-emerald-100"
//                         : hasSubmission
//                           ? "bg-indigo-100"
//                           : "bg-orange-100"
//                     }`}
//                   >
//                     {isGraded ? (
//                       <Trophy size={18} className="text-emerald-600" />
//                     ) : hasSubmission ? (
//                       <CheckCircle2 size={18} className="text-indigo-600" />
//                     ) : (
//                       <FileText size={18} className="text-orange-600" />
//                     )}
//                   </div>

//                   {/* Info */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <h2 className="font-semibold text-slate-800 text-sm leading-tight truncate">
//                           {a.title}
//                         </h2>
//                         {a.courseId?.title && (
//                           <p className="text-xs text-slate-400 mt-0.5">
//                             {a.courseId.title}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2 shrink-0">
//                         <StatusBadge
//                           status={a.submissionStatus}
//                           isLate={sub?.isLate}
//                         />
//                         {isOpen ? (
//                           <ChevronUp size={16} className="text-slate-400" />
//                         ) : (
//                           <ChevronDown size={16} className="text-slate-400" />
//                         )}
//                       </div>
//                     </div>

//                     {/* Meta row */}
//                     <div className="flex items-center gap-4 mt-2 flex-wrap">
//                       {due && (
//                         <span
//                           className={`flex items-center gap-1 text-xs ${
//                             due.isOverdue
//                               ? "text-red-500"
//                               : due.daysLeft <= 3
//                                 ? "text-orange-500"
//                                 : "text-slate-400"
//                           }`}
//                         >
//                           <Calendar size={11} />
//                           {due.isOverdue
//                             ? `Overdue · ${due.text}`
//                             : due.daysLeft === 0
//                               ? "Due today"
//                               : due.daysLeft === 1
//                                 ? "Due tomorrow"
//                                 : `Due ${due.text}`}
//                         </span>
//                       )}
//                       {a.totalMarks > 0 && (
//                         <span className="flex items-center gap-1 text-xs text-slate-400">
//                           <Star size={11} />
//                           {a.totalMarks} marks
//                         </span>
//                       )}
//                       {a.questions?.length > 0 && (
//                         <span className="flex items-center gap-1 text-xs text-slate-400">
//                           <MessageSquare size={11} />
//                           {a.questions.length} question
//                           {a.questions.length !== 1 ? "s" : ""}
//                         </span>
//                       )}
//                       {a.file?.url && (
//                         <span className="flex items-center gap-1 text-xs text-slate-400">
//                           <Paperclip size={11} />
//                           Attachment
//                         </span>
//                       )}
//                       {isGraded && scoreData && (
//                         <span
//                           className={`flex items-center gap-1 text-xs font-medium ${getScoreColor(scoreData.pct).text}`}
//                         >
//                           <Award size={11} />
//                           {scoreData.score}/{scoreData.total}
//                         </span>
//                       )}
//                       {isGraded && annotationCount > 0 && (
//                         <span className="flex items-center gap-1 text-xs font-medium text-indigo-600">
//                           <PencilLine size={11} />
//                           {annotationCount} annotation
//                           {annotationCount !== 1 ? "s" : ""}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </button>

//                 {/* ── Expanded body ── */}
//                 {isOpen && (
//                   <div className="border-t border-slate-100 p-5 space-y-5">
//                     {/* Description */}
//                     {a.description && (
//                       <p className="text-sm text-slate-600 leading-relaxed">
//                         {a.description}
//                       </p>
//                     )}

//                     {/* Download assignment file (DOCX/PDF) — blob-forced, original filename */}
//                     {a.file?.url && (
//                       <button
//                         type="button"
//                         onClick={() =>
//                           triggerDownload(
//                             a.file.url,
//                             a.file.originalName || "assignment.docx",
//                           )
//                         }
//                         className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
//                       >
//                         <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
//                           <Download
//                             size={16}
//                             className="text-slate-500 group-hover:text-indigo-600"
//                           />
//                         </div>
//                         <div className="min-w-0 flex-1">
//                           <p className="text-sm font-medium text-slate-700 truncate">
//                             Download Assignment ({a.file.originalName || "File"}
//                             )
//                           </p>
//                           <p className="text-xs text-indigo-500">
//                             Download & complete →
//                           </p>
//                         </div>
//                       </button>
//                     )}

//                     {/* ─── SUBMISSION VIEW (already submitted/graded) ─── */}
//                     {hasSubmission && (
//                       <>
//                         {/* Loading submission details */}
//                         {sub === undefined && !localError && (
//                           <div className="flex items-center gap-2 text-sm text-slate-400">
//                             <Loader2 size={14} className="animate-spin" />
//                             Loading submission…
//                           </div>
//                         )}

//                         {/* Genuine fetch failure — distinct from "no submission yet" */}
//                         {sub === undefined && localError && (
//                           <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
//                             <AlertTriangle size={14} />
//                             {localError}
//                           </div>
//                         )}

//                         {sub !== undefined && sub !== null && (
//                           <SubmissionResult sub={sub} assignment={a} />
//                         )}

//                         {sub === null && (
//                           <div className="text-sm text-slate-400 italic">
//                             Submission details unavailable.
//                           </div>
//                         )}

//                         {/* ─── REPLACE SUBMISSION (only file-based & not graded & before due) ─── */}
//                         {sub &&
//                           sub.submissionFile?.url &&
//                           !isGraded &&
//                           !isPastDue && (
//                             <ReplaceSubmissionPanel
//                               sub={sub}
//                               assignment={a}
//                               onResubmitDone={(updated) =>
//                                 handleResubmitDone(id, updated)
//                               }
//                               onError={(msg) =>
//                                 setErrors((p) => ({ ...p, [id]: msg }))
//                               }
//                             />
//                           )}

//                         {/* ─── DUE DATE PASSED, still ungraded ─── */}
//                         {sub &&
//                           sub.submissionFile?.url &&
//                           !isGraded &&
//                           isPastDue && (
//                             <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
//                               <Lock size={14} />
//                               Due date has passed — submission can no longer be
//                               replaced.
//                             </div>
//                           )}

//                         {/* ─── ALREADY GRADED ─── */}
//                         {sub && isGraded && sub.submissionFile?.url && (
//                           <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
//                             <Lock size={14} />
//                             Submission already graded.
//                           </div>
//                         )}

//                         {/* Local error display (resubmit errors — the initial-fetch
//                             error case is already handled above when sub === undefined) */}
//                         {localError && sub !== undefined && (
//                           <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
//                             <AlertTriangle size={14} />
//                             {localError}
//                           </div>
//                         )}
//                       </>
//                     )}

//                     {/* ─── SUBMISSION FORM (not yet submitted) ─── */}
//                     {!hasSubmission && (
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <p className="text-sm font-semibold text-slate-700">
//                             Your Submission
//                           </p>

//                           {/* Mode toggle */}
//                           <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs">
//                             <button
//                               onClick={() =>
//                                 setMode((p) => ({ ...p, [id]: "text" }))
//                               }
//                               className={`px-3 py-1.5 transition-colors ${
//                                 localMode !== "file"
//                                   ? "bg-indigo-600 text-white"
//                                   : "bg-white text-slate-500 hover:bg-slate-50"
//                               }`}
//                             >
//                               <span className="flex items-center gap-1.5">
//                                 <MessageSquare size={11} /> Text
//                               </span>
//                             </button>
//                             <button
//                               onClick={() =>
//                                 setMode((p) => ({ ...p, [id]: "file" }))
//                               }
//                               className={`px-3 py-1.5 transition-colors ${
//                                 localMode === "file"
//                                   ? "bg-indigo-600 text-white"
//                                   : "bg-white text-slate-500 hover:bg-slate-50"
//                               }`}
//                             >
//                               <span className="flex items-center gap-1.5">
//                                 <Upload size={11} /> File
//                               </span>
//                             </button>
//                           </div>
//                         </div>

//                         {/* Text mode — questions */}
//                         {localMode !== "file" && a.questions?.length > 0 && (
//                           <div className="space-y-4">
//                             {a.questions.map((q, i) => (
//                               <div key={q._id} className="space-y-1">
//                                 <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
//                                   Question {i + 1}
//                                 </p>
//                                 <QuestionInput
//                                   question={q}
//                                   answer={answers[id]?.[q._id]}
//                                   onChange={(field, val) =>
//                                     handleAnswer(id, q._id, field, val)
//                                   }
//                                 />
//                               </div>
//                             ))}
//                           </div>
//                         )}

//                         {/* Text mode — no questions */}
//                         {localMode !== "file" &&
//                           (!a.questions || a.questions.length === 0) && (
//                             <p className="text-xs text-slate-400 italic">
//                               No questions. Switch to File upload to submit your
//                               work.
//                             </p>
//                           )}

//                         {/* File mode */}
//                         {localMode === "file" && (
//                           <FileDropZone
//                             file={files[id]}
//                             onFile={(f) => setFiles((p) => ({ ...p, [id]: f }))}
//                             onClear={() =>
//                               setFiles((p) => ({ ...p, [id]: null }))
//                             }
//                             assignmentId={id}
//                           />
//                         )}

//                         {/* Error */}
//                         {localError && (
//                           <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
//                             <AlertTriangle size={14} />
//                             {localError}
//                           </div>
//                         )}

//                         {/* Submit button */}
//                         <button
//                           onClick={() => handleSubmit(a)}
//                           disabled={submitting === id}
//                           className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
//                         >
//                           {submitting === id ? (
//                             <>
//                               <Loader2 size={15} className="animate-spin" />
//                               Submitting…
//                             </>
//                           ) : (
//                             <>
//                               <Send size={15} />
//                               Submit Assignment
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     )}
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

import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Loader2,
  Award,
  BookOpen,
  MessageSquare,
  Upload,
  X,
  Download,
  File,
  Star,
  RotateCcw,
  Paperclip,
  CheckCheck,
  AlertTriangle,
  Trophy,
  Lock,
  RefreshCw,
  PencilLine,
} from "lucide-react";

import {
  getAssignments,
  submitAssignment,
  resubmitAssignment,
  getMySubmissionForAssignment,
} from "../../services/studentService";

import MainLayout from "../../components/layout/MainLayout";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const MAX_FILE_MB = 5;

// ─── HELPERS ────────────────────────────────────────────────────────────────

const getDueDateInfo = (dueDate) => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return {
    text: due.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    daysLeft: days,
    isOverdue: days < 0,
  };
};

const formatScore = (score, total) => {
  if (score == null) return null;
  const pct = total ? Math.round((score / total) * 100) : 0;
  return { score, total, pct };
};

const getScoreColor = (pct) => {
  if (pct >= 80)
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      bar: "bg-emerald-500",
    };
  if (pct >= 60)
    return { text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500" };
  return { text: "text-red-500", bg: "bg-red-50", bar: "bg-red-500" };
};

// Sanitize a string for use as a filename
const sanitizeForFilename = (s = "") =>
  s
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_")
    .trim() || "file";

// Blob-forced download — preserves the original filename instead of cloudinary hash
const triggerDownload = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error("Download failed:", err);
    window.open(url, "_blank");
  }
};

// A file passed through drag-and-drop never goes through the <input accept="">
// gate, so it needs the same check the file input relies on. This is what the
// dropzone uses to reject non-PDFs / oversized files before they ever reach
// component state — which is also what keeps the Submit button honestly
// disabled (state only ever holds a file that has already passed this check).
const validatePdf = (f) => {
  if (!f) return "No file selected.";
  const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name || "");
  if (!isPdf) return "Only PDF files are accepted.";
  if (f.size > MAX_FILE_MB * 1024 * 1024) {
    return `File is larger than ${MAX_FILE_MB}MB.`;
  }
  return "";
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status, isLate }) => {
  const safe = status || "not_submitted";
  const map = {
    graded: {
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      icon: <CheckCheck size={11} />,
      label: "Graded",
    },
    approved: {
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      icon: <CheckCheck size={11} />,
      label: "Approved",
    },
    ai_reviewed: {
      cls: "bg-violet-100 text-violet-700 border border-violet-200",
      icon: <Clock size={11} />,
      label: "AI Reviewed",
    },
    resubmission_required: {
      cls: "bg-orange-100 text-orange-700 border border-orange-200",
      icon: <RotateCcw size={11} />,
      label: "Resubmission Needed",
    },
    submitted: {
      cls: "bg-indigo-100 text-indigo-700 border border-indigo-200",
      icon: <Clock size={11} />,
      label: "Submitted",
    },
    not_submitted: {
      cls: "bg-slate-100 text-slate-500 border border-slate-200",
      icon: <AlertCircle size={11} />,
      label: "Pending",
    },
  };
  const { cls, icon, label } = map[safe] || map.not_submitted;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${cls}`}
    >
      {icon}
      {label}
      {isLate && safe !== "not_submitted" && (
        <span className="ml-1 text-orange-500 font-semibold">· Late</span>
      )}
    </span>
  );
};

// ─── SCORE RING ───────────────────────────────────────────────────────────────

const ScoreRing = ({ pct }) => {
  const c = getScoreColor(pct);
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div
      className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full ${c.bg}`}
    >
      <svg width="64" height="64" className="absolute top-0 left-0 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="4"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444"}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <span className={`text-sm font-bold ${c.text}`}>{pct}%</span>
    </div>
  );
};

// ─── FILE DROP ZONE (PDF ONLY) ─────────────────────────────────────────────

const FileDropZone = ({ file, onFile, onClear }) => {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  // Every path a file can enter through — click-to-browse or drag-and-drop —
  // funnels through here, so an invalid file never makes it into `files[id]`
  // and the Submit button never has to guess whether what it's holding is
  // actually valid.
  const handleIncomingFile = (f) => {
    if (!f) return;
    const err = validatePdf(f);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError("");
    onFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleIncomingFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`
          relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all
          ${dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}
          ${file ? "cursor-default" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,application/pdf"
          onChange={(e) => handleIncomingFile(e.target.files[0])}
        />

        {file ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <File size={18} className="text-indigo-600" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLocalError("");
                onClear();
              }}
              className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
              <Upload size={18} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-medium text-indigo-600">
                Click to upload
              </span>{" "}
              or drag & drop
            </p>
            <p className="text-xs text-slate-400">
              PDF only — up to {MAX_FILE_MB}MB
            </p>
          </div>
        )}
      </div>
      {localError && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
          <AlertTriangle size={12} /> {localError}
        </p>
      )}
    </div>
  );
};

// ─── QUESTION INPUT ───────────────────────────────────────────────────────────

const QuestionInput = ({ question, answer, onChange }) => {
  const q = question;

  if (q.type === "mcq" && q.options?.length > 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">{q.prompt}</p>
        <div className="space-y-1.5">
          {q.options.map((opt, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                answer?.selectedOption === opt
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name={`q-${q._id}`}
                value={opt}
                checked={answer?.selectedOption === opt}
                onChange={() => onChange("selectedOption", opt)}
                className="text-indigo-600"
              />
              <span className="text-sm text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
        {q.marks && (
          <p className="text-xs text-slate-400">
            {q.marks} mark{q.marks !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">{q.prompt}</p>
        {q.marks && (
          <span className="text-xs text-slate-400 shrink-0">
            {q.marks} mark{q.marks !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <textarea
        rows={3}
        placeholder="Type your answer here..."
        value={answer?.textAnswer || ""}
        onChange={(e) => onChange("textAnswer", e.target.value)}
        className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-y transition-all"
      />
    </div>
  );
};

// ─── SUBMISSION RESULT VIEW ───────────────────────────────────────────────────

const SubmissionResult = ({ sub, assignment }) => {
  if (!sub) return null;
  const scoreData = formatScore(sub.totalScore, assignment?.totalMarks);
  const annotationCount = sub.annotations?.length || 0;
  const isGradedLike = ["graded", "ai_reviewed", "approved"].includes(
    sub.status,
  );

  const reviewedFilename = () => {
    const student = sanitizeForFilename(sub.studentId?.name || "student");
    const title = sanitizeForFilename(assignment?.title || "assignment");
    return `${student}-${title}-reviewed.pdf`;
  };

  return (
    <div className="space-y-4">
      {["graded", "ai_reviewed", "approved"].includes(sub.status) &&
        assignment?._id && (
          <Link
            to={`/student/assignments/${assignment._id}/result`}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
          >
            View Full Result →
          </Link>
        )}

      {isGradedLike && scoreData && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
          <ScoreRing pct={scoreData.pct} />
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              Your Score
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {scoreData.score}
              <span className="text-slate-400 text-lg font-normal">
                {" "}
                / {scoreData.total}
              </span>
            </p>
          </div>
          {annotationCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              <PencilLine size={11} />
              {annotationCount} annotation{annotationCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {sub.feedback && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Tutor Feedback
            </p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {sub.feedback}
          </p>
        </div>
      )}

      {sub.submissionFile?.url && (
        <button
          type="button"
          onClick={() =>
            triggerDownload(
              sub.submissionFile.url,
              sub.submissionFile.originalName || "my-submission.pdf",
            )
          }
          className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
            <Download
              size={16}
              className="text-slate-500 group-hover:text-indigo-600"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-700 truncate">
              {sub.submissionFile.originalName || "Submitted File"}
            </p>
            <p className="text-xs text-indigo-500">Download my submission ↓</p>
          </div>
        </button>
      )}

      {isGradedLike && sub.submissionFile?.url && (
        <button
          type="button"
          onClick={() =>
            triggerDownload(sub.submissionFile.url, reviewedFilename())
          }
          className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
            <Award size={16} className="text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-emerald-800 truncate">
              Reviewed Submission
            </p>
            <p className="text-xs text-emerald-700">
              Download annotated copy ↓
            </p>
          </div>
        </button>
      )}

      {sub.answers?.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Your Answers
          </p>
          {sub.answers.map((ans, i) => {
            const q = ans.questionId;
            const isCorrect = ans.isCorrect;
            const awarded = ans.marksAwarded;
            return (
              <div
                key={ans._id}
                className={`rounded-xl border p-3 space-y-2 ${
                  isGradedLike
                    ? isCorrect === true
                      ? "border-emerald-200 bg-emerald-50"
                      : isCorrect === false
                        ? "border-red-200 bg-red-50"
                        : "border-slate-200 bg-white"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-slate-600">
                    Q{i + 1}. {q?.prompt}
                  </p>
                  {isGradedLike && awarded != null && (
                    <span className="text-xs font-semibold text-slate-500 shrink-0">
                      {awarded}/{q?.marks || "?"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700">
                  {ans.textAnswer || ans.selectedOption || (
                    <span className="italic text-slate-400">No answer</span>
                  )}
                </p>
                {isGradedLike && q?.correctAnswer && (
                  <p className="text-xs text-emerald-600">
                    ✓ Correct: {q.correctAnswer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sub.reviewAnnotations?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Review Notes
          </p>
          {sub.reviewAnnotations.map((ann, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-sm text-slate-600"
            >
              <span>{ann.icon || "📝"}</span>
              <span>{ann.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── REPLACE-SUBMISSION PANEL ────────────────────────────────────────────────

const ReplaceSubmissionPanel = ({
  sub,
  assignment,
  onResubmitDone,
  onError,
}) => {
  const [newFile, setNewFile] = useState(null);
  const [showReplace, setShowReplace] = useState(false);
  const [busy, setBusy] = useState(false);

  const resubmissionCount = sub?.resubmissionCount || 0;
  const maxResubmissions = Number(assignment?.maxResubmissions ?? 3);
  const allowResubmission = assignment?.allowResubmission !== false;

  const resubmissionBlocked =
    (!allowResubmission && resubmissionCount > 0) ||
    (maxResubmissions > 0 && resubmissionCount >= maxResubmissions);

  if (resubmissionBlocked) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
        <Lock size={14} />
        {!allowResubmission
          ? "Resubmission is not allowed for this assignment."
          : `Maximum number of resubmissions (${maxResubmissions}) reached.`}
      </div>
    );
  }

  const submitReplace = async () => {
    if (!newFile) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", newFile);
      const updated = await resubmitAssignment(assignment._id, fd);
      onResubmitDone(updated);
      setNewFile(null);
      setShowReplace(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to replace submission.";
      onError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (!showReplace) {
    return (
      <button
        type="button"
        onClick={() => setShowReplace(true)}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 py-2.5 rounded-xl transition-all"
      >
        <RefreshCw size={14} />
        Replace Submission
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
          Upload a new PDF
        </p>
        <button
          type="button"
          onClick={() => {
            setShowReplace(false);
            setNewFile(null);
          }}
          className="p-1 rounded-md hover:bg-white text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <FileDropZone
        file={newFile}
        onFile={(f) => setNewFile(f)}
        onClear={() => setNewFile(null)}
      />

      <button
        type="button"
        onClick={submitReplace}
        disabled={!newFile || busy}
        className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl transition-colors ${
          !newFile || busy
            ? "bg-indigo-200 text-indigo-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {busy ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Replacing…
          </>
        ) : (
          <>
            <Send size={15} />
            Confirm Replace
          </>
        )}
      </button>
      {!newFile && !busy && (
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Lock size={11} /> Select a PDF to enable replacing.
        </p>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [mode, setMode] = useState({}); // "text" | "file"
  const [submitting, setSubmitting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState({}); // submission cache by assignmentId
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [successId, setSuccessId] = useState(null);
  // Tracks assignments where the learner has tried to submit while
  // incomplete, so unanswered questions can be quietly highlighted instead
  // of just refusing the click with no explanation.
  const [attempted, setAttempted] = useState({});

  // ── Load assignments ─────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const data = await getAssignments();
        const normalized = (data?.assignments || data || []).map((a) => ({
          ...a,
          submissionStatus: a.submissionStatus || "not_submitted",
        }));
        setAssignments(normalized);
      } catch {
        setGlobalError("Failed to load assignments. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Mode helper ──────────────────────────────────────────────────────────
  // An assignment with no questions has no valid "text" path at all, so
  // defaulting every assignment to text mode (as the previous version did)
  // silently steered file-only assignments toward a dead end where Submit
  // would fire with an empty answers array. Default to whichever mode this
  // assignment can actually satisfy.
  const getMode = useCallback(
    (a) => mode[a._id] || (a.questions?.length > 0 ? "text" : "file"),
    [mode],
  );

  // ── Toggle expand + fetch submission ────────────────────────────────────

  const toggleExpand = async (a) => {
    const id = a._id;
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (cached[id] !== undefined) return; // already fetched

    try {
      const sub = await getMySubmissionForAssignment(id);
      setCached((p) => ({ ...p, [id]: sub }));
      if (sub?.status) {
        setAssignments((prev) =>
          prev.map((x) =>
            x._id === id ? { ...x, submissionStatus: sub.status } : x,
          ),
        );
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load submission details.";
      setErrors((p) => ({ ...p, [id]: msg }));
      setCached((p) => ({ ...p, [id]: undefined }));
    }
  };

  // ── Answer handler ───────────────────────────────────────────────────────

  const handleAnswer = useCallback((aId, qId, field, val) => {
    setAnswers((p) => ({
      ...p,
      [aId]: {
        ...p[aId],
        [qId]: { ...p[aId]?.[qId], questionId: qId, [field]: val },
      },
    }));
  }, []);

  // ── Submission readiness — the single source of truth ───────────────────
  // Both the Submit button's `disabled` state and handleSubmit's own guard
  // read from this, so there is exactly one definition of "blank" instead of
  // two that can drift apart. This is what actually closes the gap that let
  // learners submit an empty file-mode assignment (or an all-blank text
  // assignment) and then have no clean way to fix it.
  const getSubmissionReadiness = useCallback(
    (a) => {
      const id = a._id;
      const currentMode = getMode(a);

      if (currentMode === "file") {
        return files[id]
          ? { ready: true, reason: "" }
          : { ready: false, reason: "Select a PDF to enable submission." };
      }

      if (!a.questions || a.questions.length === 0) {
        return {
          ready: false,
          reason: "Switch to File upload — this assignment has no questions.",
        };
      }

      const unanswered = a.questions.filter((q) => {
        const ans = answers[id]?.[q._id];
        if (!ans) return true;
        return q.type === "mcq"
          ? !ans.selectedOption
          : !ans.textAnswer || !ans.textAnswer.trim();
      }).length;

      return {
        ready: unanswered === 0,
        reason:
          unanswered > 0
            ? `Answer all questions to submit — ${unanswered} remaining.`
            : "",
      };
    },
    [answers, files, getMode],
  );

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (a) => {
    const id = a._id;
    setErrors((p) => ({ ...p, [id]: null }));

    const { ready, reason } = getSubmissionReadiness(a);
    if (!ready) {
      // The button is disabled whenever this is false, so in normal use this
      // only fires defensively — but it still needs to fail loudly rather
      // than let an incomplete payload reach the server.
      setAttempted((p) => ({ ...p, [id]: true }));
      setErrors((p) => ({ ...p, [id]: reason }));
      return;
    }

    const currentMode = getMode(a);

    setSubmitting(id);
    try {
      let result;
      if (currentMode === "file") {
        const fd = new FormData();
        fd.append("file", files[id]);
        result = await submitAssignment(id, fd);
      } else {
        const ans = Object.values(answers[id] || {});
        result = await submitAssignment(id, { answers: ans });
      }

      setAssignments((prev) =>
        prev.map((x) =>
          x._id === id ? { ...x, submissionStatus: "submitted" } : x,
        ),
      );
      setCached((p) => ({ ...p, [id]: result }));
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 4000);
      setExpandedId(null);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Submission failed. Please try again.";
      setErrors((p) => ({ ...p, [id]: msg }));
    } finally {
      setSubmitting(null);
    }
  };

  // ── Resubmit handler ─────────────────────────────────────────────────────

  const handleResubmitDone = (assignmentId, updated) => {
    setCached((p) => ({ ...p, [assignmentId]: updated }));
    setAssignments((prev) =>
      prev.map((x) =>
        x._id === assignmentId ? { ...x, submissionStatus: "submitted" } : x,
      ),
    );
    setSuccessId(assignmentId);
    setTimeout(() => setSuccessId(null), 4000);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Assignments
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {assignments.length > 0
                  ? `${assignments.filter((a) => a.submissionStatus === "not_submitted").length} pending`
                  : "Your coursework"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <BookOpen size={14} />
              <span>
                {assignments.length} assignment
                {assignments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle
              size={18}
              className="text-amber-500 mt-0.5 shrink-0"
            />
            <p className="text-sm text-amber-800 leading-relaxed">
              <span className="font-semibold">Important:</span> Assignment PDFs
              must be filled and edited using{" "}
              <span className="font-semibold">Adobe Acrobat Reader</span>{" "}
              (Desktop or Mobile app). If you're completing your assignment on a
              phone, installing the{" "}
              <span className="font-semibold">
                Adobe Acrobat app is compulsory
              </span>{" "}
              — other apps and built-in phone viewers may not support editing
              this form correctly.
            </p>
          </div>

          {successId && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
              <CheckCircle2 size={16} />
              Submission saved successfully!
            </div>
          )}

          {globalError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              <AlertTriangle size={16} />
              {globalError}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Loading assignments…</span>
              </div>
            </div>
          )}

          {!loading && assignments.length === 0 && (
            <div className="text-center py-20 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                <FileText size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">No assignments yet</p>
            </div>
          )}

          {assignments.map((a) => {
            const id = a._id;
            const due = getDueDateInfo(a.dueDate);
            const isOpen = expandedId === id;
            const sub = cached[id];
            const hasSubmission = a.submissionStatus !== "not_submitted";
            const isGraded = ["graded", "ai_reviewed", "approved"].includes(
              a.submissionStatus,
            );
            const isPastDue = !!(a.dueDate && new Date() > new Date(a.dueDate));
            const scoreData = isGraded
              ? formatScore(sub?.totalScore, a.totalMarks)
              : null;
            const localMode = getMode(a);
            const localError = errors[id];
            const annotationCount = sub?.annotations?.length || 0;
            const { ready: canSubmit, reason: blockedReason } =
              getSubmissionReadiness(a);
            const answeredCount = (a.questions || []).filter((q) => {
              const ans = answers[id]?.[q._id];
              if (!ans) return false;
              return q.type === "mcq"
                ? !!ans.selectedOption
                : !!(ans.textAnswer && ans.textAnswer.trim());
            }).length;

            return (
              <div
                key={id}
                className={`bg-white rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-indigo-200 shadow-md"
                    : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow"
                }`}
              >
                {/* ── Card header ── */}
                <button
                  className="w-full text-left p-5 flex items-start gap-4"
                  onClick={() => toggleExpand(a)}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isGraded
                        ? "bg-emerald-100"
                        : hasSubmission
                          ? "bg-indigo-100"
                          : "bg-orange-100"
                    }`}
                  >
                    {isGraded ? (
                      <Trophy size={18} className="text-emerald-600" />
                    ) : hasSubmission ? (
                      <CheckCircle2 size={18} className="text-indigo-600" />
                    ) : (
                      <FileText size={18} className="text-orange-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-semibold text-slate-800 text-sm leading-tight truncate">
                          {a.title}
                        </h2>
                        {a.courseId?.title && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {a.courseId.title}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge
                          status={a.submissionStatus}
                          isLate={sub?.isLate}
                        />
                        {isOpen ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {due && (
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            due.isOverdue
                              ? "text-red-500"
                              : due.daysLeft <= 3
                                ? "text-orange-500"
                                : "text-slate-400"
                          }`}
                        >
                          <Calendar size={11} />
                          {due.isOverdue
                            ? `Overdue · ${due.text}`
                            : due.daysLeft === 0
                              ? "Due today"
                              : due.daysLeft === 1
                                ? "Due tomorrow"
                                : `Due ${due.text}`}
                        </span>
                      )}
                      {a.totalMarks > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Star size={11} />
                          {a.totalMarks} marks
                        </span>
                      )}
                      {a.questions?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MessageSquare size={11} />
                          {a.questions.length} question
                          {a.questions.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {a.file?.url && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Paperclip size={11} />
                          Attachment
                        </span>
                      )}
                      {isGraded && scoreData && (
                        <span
                          className={`flex items-center gap-1 text-xs font-medium ${getScoreColor(scoreData.pct).text}`}
                        >
                          <Award size={11} />
                          {scoreData.score}/{scoreData.total}
                        </span>
                      )}
                      {isGraded && annotationCount > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium text-indigo-600">
                          <PencilLine size={11} />
                          {annotationCount} annotation
                          {annotationCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* ── Expanded body ── */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-5 space-y-5">
                    {a.description && (
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {a.description}
                      </p>
                    )}

                    {a.file?.url && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerDownload(
                            a.file.url,
                            a.file.originalName || "assignment.docx",
                          )
                        }
                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                          <Download
                            size={16}
                            className="text-slate-500 group-hover:text-indigo-600"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            Download Assignment ({a.file.originalName || "File"}
                            )
                          </p>
                          <p className="text-xs text-indigo-500">
                            Download & complete →
                          </p>
                        </div>
                      </button>
                    )}

                    {/* ─── SUBMISSION VIEW (already submitted/graded) ─── */}
                    {hasSubmission && (
                      <>
                        {sub === undefined && !localError && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Loader2 size={14} className="animate-spin" />
                            Loading submission…
                          </div>
                        )}

                        {sub === undefined && localError && (
                          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                            <AlertTriangle size={14} />
                            {localError}
                          </div>
                        )}

                        {sub !== undefined && sub !== null && (
                          <SubmissionResult sub={sub} assignment={a} />
                        )}

                        {sub === null && (
                          <div className="text-sm text-slate-400 italic">
                            Submission details unavailable.
                          </div>
                        )}

                        {sub &&
                          sub.submissionFile?.url &&
                          !isGraded &&
                          !isPastDue && (
                            <ReplaceSubmissionPanel
                              sub={sub}
                              assignment={a}
                              onResubmitDone={(updated) =>
                                handleResubmitDone(id, updated)
                              }
                              onError={(msg) =>
                                setErrors((p) => ({ ...p, [id]: msg }))
                              }
                            />
                          )}

                        {sub &&
                          sub.submissionFile?.url &&
                          !isGraded &&
                          isPastDue && (
                            <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
                              <Lock size={14} />
                              Due date has passed — submission can no longer be
                              replaced.
                            </div>
                          )}

                        {sub && isGraded && sub.submissionFile?.url && (
                          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                            <Lock size={14} />
                            Submission already graded.
                          </div>
                        )}

                        {localError && sub !== undefined && (
                          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <AlertTriangle size={14} />
                            {localError}
                          </div>
                        )}
                      </>
                    )}

                    {/* ─── SUBMISSION FORM (not yet submitted) ─── */}
                    {!hasSubmission && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm font-semibold text-slate-700">
                            Your Submission
                          </p>

                          <div className="flex items-center gap-3">
                            {localMode !== "file" &&
                              a.questions?.length > 0 && (
                                <span
                                  className={`text-xs font-medium ${
                                    answeredCount === a.questions.length
                                      ? "text-emerald-600"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {answeredCount}/{a.questions.length} answered
                                </span>
                              )}

                            {a.questions?.length > 0 && (
                              <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs">
                                <button
                                  onClick={() =>
                                    setMode((p) => ({ ...p, [id]: "text" }))
                                  }
                                  className={`px-3 py-1.5 transition-colors ${
                                    localMode !== "file"
                                      ? "bg-indigo-600 text-white"
                                      : "bg-white text-slate-500 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <MessageSquare size={11} /> Text
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    setMode((p) => ({ ...p, [id]: "file" }))
                                  }
                                  className={`px-3 py-1.5 transition-colors ${
                                    localMode === "file"
                                      ? "bg-indigo-600 text-white"
                                      : "bg-white text-slate-500 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Upload size={11} /> File
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Text mode — questions */}
                        {localMode !== "file" && a.questions?.length > 0 && (
                          <div className="space-y-4">
                            {a.questions.map((q, i) => {
                              const ans = answers[id]?.[q._id];
                              const isAnswered =
                                q.type === "mcq"
                                  ? !!ans?.selectedOption
                                  : !!(
                                      ans?.textAnswer && ans.textAnswer.trim()
                                    );
                              const flagged = attempted[id] && !isAnswered;
                              return (
                                <div
                                  key={q._id}
                                  className={`space-y-1 rounded-xl p-2 -m-2 transition-colors ${
                                    flagged
                                      ? "ring-1 ring-red-200 bg-red-50/50"
                                      : ""
                                  }`}
                                >
                                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                    Question {i + 1}
                                    {flagged && (
                                      <span className="text-red-500 normal-case font-normal ml-1.5">
                                        · answer required
                                      </span>
                                    )}
                                  </p>
                                  <QuestionInput
                                    question={q}
                                    answer={ans}
                                    onChange={(field, val) =>
                                      handleAnswer(id, q._id, field, val)
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Text mode — no questions (assignment is file-only) */}
                        {localMode !== "file" &&
                          (!a.questions || a.questions.length === 0) && (
                            <p className="text-xs text-slate-400 italic">
                              No questions. Switch to File upload to submit your
                              work.
                            </p>
                          )}

                        {/* File mode */}
                        {localMode === "file" && (
                          <FileDropZone
                            file={files[id]}
                            onFile={(f) => setFiles((p) => ({ ...p, [id]: f }))}
                            onClear={() =>
                              setFiles((p) => ({ ...p, [id]: null }))
                            }
                          />
                        )}

                        {localError && (
                          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <AlertTriangle size={14} />
                            {localError}
                          </div>
                        )}

                        {/* Submit button — disabled until the current mode
                            actually has something to send. This is the fix:
                            no file selected (or no questions answered) means
                            no way to trigger a blank submission. */}
                        <button
                          onClick={() => handleSubmit(a)}
                          disabled={submitting === id || !canSubmit}
                          className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl transition-colors ${
                            submitting === id
                              ? "bg-indigo-400 text-white cursor-wait"
                              : !canSubmit
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          {submitting === id ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Submitting…
                            </>
                          ) : (
                            <>
                              <Send size={15} />
                              Submit Assignment
                            </>
                          )}
                        </button>
                        {!canSubmit && submitting !== id && (
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 justify-center">
                            <Lock size={11} /> {blockedReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
