
import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Loader2,
  AlertCircle,
  Trophy,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import {
  getCourseChapters,
  submitChapterQuiz,
  getChapterQuiz,
  getCourseById,
} from "../../services/studentService";
import DocumentModal from "./studentComponent/DocumentModal";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

/* ======================================================
   DocumentModal – secure PDF viewer, no download
====================================================== */
// function DocumentModal({ url, name, onClose }) {
//   const canvasRef = useRef(null);
//   const containerRef = useRef(null);
//   const [pdfDoc, setPdfDoc] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [scale, setScale] = useState(1.2);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isPdf, setIsPdf] = useState(false);
//   const renderTaskRef = useRef(null);

//   /* Determine file type */
//   useEffect(() => {
//     const lower = (url || "").toLowerCase();
//     const pdf = lower.endsWith(".pdf") || lower.includes(".pdf?");
//     setIsPdf(pdf);
//   }, [url]);

//   /* Load PDF.js for PDF files */
//   useEffect(() => {
//     if (!isPdf) return;
//     setLoading(true);
//     setError(null);

//     const loadPdfJs = async () => {
//       try {
//         if (!window.pdfjsLib) {
//           await new Promise((resolve, reject) => {
//             const script = document.createElement("script");
//             script.src =
//               "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
//             script.onload = resolve;
//             script.onerror = reject;
//             document.head.appendChild(script);
//           });
//           window.pdfjsLib.GlobalWorkerOptions.workerSrc =
//             "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
//         }

//         const loadingTask = window.pdfjsLib.getDocument({
//           url,
//           withCredentials: true,
//         });
//         const doc = await loadingTask.promise;
//         setPdfDoc(doc);
//         setTotalPages(doc.numPages);
//         setCurrentPage(1);
//       } catch (err) {
//         setError("Unable to load document. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadPdfJs();
//   }, [url, isPdf]);

//   /* Render page whenever page/scale/doc changes */
//   const renderPage = useCallback(
//     async (pageNum) => {
//       if (!pdfDoc || !canvasRef.current) return;

//       /* Cancel any in-flight render */
//       if (renderTaskRef.current) {
//         try {
//           renderTaskRef.current.cancel();
//         } catch (_) {}
//       }

//       const page = await pdfDoc.getPage(pageNum);
//       const viewport = page.getViewport({ scale });
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       const renderTask = page.render({ canvasContext: ctx, viewport });
//       renderTaskRef.current = renderTask;

//       try {
//         await renderTask.promise;
//       } catch (err) {
//         if (err?.name !== "RenderingCancelledException") {
//           console.error(err);
//         }
//       }
//     },
//     [pdfDoc, scale],
//   );

//   useEffect(() => {
//     if (pdfDoc) renderPage(currentPage);
//   }, [pdfDoc, currentPage, scale, renderPage]);

//   /* Keyboard navigation */
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowRight" || e.key === "ArrowDown")
//         setCurrentPage((p) => Math.min(p + 1, totalPages));
//       if (e.key === "ArrowLeft" || e.key === "ArrowUp")
//         setCurrentPage((p) => Math.max(p - 1, 1));
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [onClose, totalPages]);

//   /* Block right-click on the modal */
//   const blockContext = (e) => e.preventDefault();

//   const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
//   const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
//   const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
//   const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

//   /* Non-PDF: render via Google Docs Viewer embedded in a sandboxed iframe */
//   const renderNonPdf = () => {
//     const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
//     return (
//       <div className="flex flex-col h-full">
//         <div className="flex-1 relative">
//           <iframe
//             src={viewerUrl}
//             className="w-full h-full border-0"
//             sandbox="allow-scripts allow-same-origin"
//             title={name || "Document"}
//             onContextMenu={blockContext}
//           />
//           {/* Transparent overlay to prevent right-click on iframe content */}
//           <div
//             className="absolute inset-0 pointer-events-none select-none"
//             style={{ zIndex: 1 }}
//             onContextMenu={blockContext}
//           />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center"
//         style={{
//           backgroundColor: "rgba(0,0,0,0.75)",
//           backdropFilter: "blur(4px)",
//         }}
//         onClick={(e) => e.target === e.currentTarget && onClose()}
//         onContextMenu={blockContext}
//       >
//         <motion.div
//           initial={{ scale: 0.93, opacity: 0, y: 16 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           transition={{ type: "spring", damping: 25, stiffness: 300 }}
//           className="relative flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
//           style={{
//             width: "min(92vw, 900px)",
//             height: "min(92vh, 820px)",
//           }}
//           onContextMenu={blockContext}
//         >
//           {/* ── Header bar ── */}
//           <div className="flex items-center justify-between px-5 py-3 bg-gray-900 flex-shrink-0">
//             <div className="flex items-center gap-3 min-w-0">
//               <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
//               <p className="text-white text-sm font-medium truncate max-w-xs">
//                 {name || "Document Viewer"}
//               </p>
//               {isPdf && totalPages > 0 && (
//                 <span className="text-gray-400 text-xs ml-1 flex-shrink-0">
//                   · {totalPages} page{totalPages !== 1 ? "s" : ""}
//                 </span>
//               )}
//             </div>

//             <div className="flex items-center gap-1">
//               {/* Zoom controls – PDF only */}
//               {isPdf && (
//                 <>
//                   <button
//                     onClick={zoomOut}
//                     title="Zoom out"
//                     className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
//                   >
//                     <ZoomOut className="w-4 h-4" />
//                   </button>
//                   <span className="text-gray-400 text-xs min-w-[42px] text-center">
//                     {Math.round(scale * 100)}%
//                   </span>
//                   <button
//                     onClick={zoomIn}
//                     title="Zoom in"
//                     className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition"
//                   >
//                     <ZoomIn className="w-4 h-4" />
//                   </button>
//                   <div className="w-px h-5 bg-gray-600 mx-1" />
//                 </>
//               )}
//               <button
//                 onClick={onClose}
//                 className="p-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
//                 title="Close"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           </div>

//           {/* ── Document area ── */}
//           <div
//             ref={containerRef}
//             className="flex-1 overflow-auto bg-gray-100 relative"
//             style={{ userSelect: "none" }}
//             onContextMenu={blockContext}
//           >
//             {!isPdf ? (
//               renderNonPdf()
//             ) : loading ? (
//               <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
//                 <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
//                 <p className="text-gray-500 text-sm font-medium">
//                   Loading document…
//                 </p>
//               </div>
//             ) : error ? (
//               <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
//                 <AlertCircle className="w-10 h-10 text-red-400" />
//                 <p className="text-red-600 font-medium">{error}</p>
//                 <p className="text-gray-400 text-sm">
//                   Make sure the document is accessible and try again.
//                 </p>
//               </div>
//             ) : (
//               <div className="flex justify-center py-6 px-4">
//                 <div
//                   className="shadow-xl rounded-lg overflow-hidden bg-white"
//                   style={{ maxWidth: "100%" }}
//                   onContextMenu={blockContext}
//                 >
//                   <canvas
//                     ref={canvasRef}
//                     style={{
//                       display: "block",
//                       maxWidth: "100%",
//                       userSelect: "none",
//                       pointerEvents: "none",
//                     }}
//                     onContextMenu={blockContext}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ── Page navigation footer – PDF only ── */}
//           {isPdf && !loading && !error && totalPages > 0 && (
//             <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-gray-100 flex-shrink-0">
//               <button
//                 onClick={goPrev}
//                 disabled={currentPage <= 1}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//                 Previous
//               </button>

//               <div className="flex items-center gap-3">
//                 {/* Page dots / compact indicator */}
//                 <div className="flex items-center gap-1.5">
//                   {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
//                     const page =
//                       totalPages <= 7
//                         ? i + 1
//                         : currentPage <= 4
//                           ? i + 1
//                           : currentPage >= totalPages - 3
//                             ? totalPages - 6 + i
//                             : currentPage - 3 + i;
//                     return (
//                       <button
//                         key={page}
//                         onClick={() => setCurrentPage(page)}
//                         className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
//                           page === currentPage
//                             ? "bg-orange-500 text-white scale-110"
//                             : "bg-gray-100 text-gray-500 hover:bg-gray-200"
//                         }`}
//                       >
//                         {page}
//                       </button>
//                     );
//                   })}
//                   {totalPages > 7 && (
//                     <span className="text-gray-400 text-xs ml-1">
//                       …{totalPages}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <button
//                 onClick={goNext}
//                 disabled={currentPage >= totalPages}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//               >
//                 Next
//                 <ChevronRightIcon className="w-4 h-4" />
//               </button>
//             </div>
//           )}

//           {/* Anti-download watermark layer – sits over the canvas area */}
//           {isPdf && !loading && !error && (
//             <div
//               className="absolute inset-0 pointer-events-none select-none"
//               style={{
//                 zIndex: 10,
//                 /* Subtle watermark grid */
//                 backgroundImage: `repeating-linear-gradient(
//                   -45deg,
//                   transparent,
//                   transparent 80px,
//                   rgba(0,0,0,0.018) 80px,
//                   rgba(0,0,0,0.018) 82px
//                 )`,
//               }}
//             />
//           )}
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

/* ======================================================
   QuizPanel – renders inside an open chapter
====================================================== */
function QuizPanel({ chapterId, onComplete, onClose }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getChapterQuiz(chapterId)
      .then(({ quiz: q }) => setQuiz(q))
      .catch(() => setError("Failed to load quiz"))
      .finally(() => setLoading(false));
  }, [chapterId]);

  const handleSelect = (questionId, option) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    const formattedAnswers = (quiz.questions || []).map((q) => ({
      questionId: q._id,
      selectedOption: answers[q._id] || "",
    }));
    setSubmitting(true);
    try {
      const res = await submitChapterQuiz(chapterId, formattedAnswers);
      setResult(res);
      if (res.passed) onComplete();
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered =
    quiz?.questions?.length > 0 && quiz.questions.every((q) => answers[q._id]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );

  if (!quiz)
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No quiz for this chapter.</p>
        <p className="text-sm text-gray-400 mt-1">
          This chapter is already unlocked.
        </p>
        <button
          onClick={onComplete}
          className="mt-4 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600"
        >
          Mark as Complete
        </button>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-6">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 space-y-4"
      >
        {result.passed ? (
          <Trophy className="w-14 h-14 text-yellow-500 mx-auto" />
        ) : (
          <XCircle className="w-14 h-14 text-red-400 mx-auto" />
        )}
        <div>
          <p className="text-xl font-bold text-gray-800">
            {result.passed ? "Great work! 🎉" : "Keep trying!"}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            You scored{" "}
            <span className="font-bold text-gray-700">
              {result.score}/{result.totalMarks}
            </span>
          </p>
        </div>
        <div className="text-left space-y-3 mt-4">
          {quiz.questions.map((q, idx) => {
            const graded = result.gradedAnswers?.find(
              (a) => a.questionId === q._id,
            );
            const selectedOpt = answers[q._id];
            const isCorrect =
              graded?.correct ?? selectedOpt === q.correctAnswer;
            return (
              <div
                key={q._id}
                className={`p-3 rounded-xl border text-sm ${
                  isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p className="font-medium text-gray-700 mb-1">
                  {idx + 1}. {q.prompt}
                </p>
                <p className="text-xs text-gray-500">
                  Your answer:{" "}
                  <span
                    className={
                      isCorrect
                        ? "text-green-700 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {selectedOpt || "Not answered"}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Correct: {q.correctAnswer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {result.passed ? (
          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium text-sm hover:shadow-lg"
          >
            Continue to Next Chapter →
          </button>
        ) : (
          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
            className="w-full mt-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium text-sm hover:bg-orange-600"
          >
            Retry Quiz
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-orange-500" />
          {quiz.title || "Chapter Quiz"}
        </h4>
        <span className="text-xs text-gray-400">
          {quiz.questions?.length} question
          {quiz.questions?.length !== 1 ? "s" : ""}
          {quiz.totalMarks > 0 && ` · ${quiz.totalMarks} marks`}
        </span>
      </div>
      {quiz.questions?.map((q, idx) => (
        <div key={q._id} className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {idx + 1}. {q.prompt}
          </p>
          <div className="grid gap-2">
            {q.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(q._id, opt)}
                className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                  answers[q._id] === opt
                    ? "bg-orange-500 border-orange-500 text-white font-medium"
                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Quiz"
        )}
      </button>
    </div>
  );
}

/* ======================================================
   ChapterCard
====================================================== */
function ChapterCard({
  chapter,
  index,
  isCompleted,
  isLocked,
  isActive,
  onOpen,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border transition-all ${
        isActive
          ? "border-orange-300 shadow-md shadow-orange-100"
          : isCompleted
            ? "border-green-200 bg-green-50/40"
            : isLocked
              ? "border-gray-100 bg-gray-50 opacity-60"
              : "border-gray-200 bg-white hover:border-orange-200 hover:shadow-sm"
      }`}
    >
      <button
        onClick={() => !isLocked && onOpen(chapter)}
        disabled={isLocked}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
            isCompleted
              ? "bg-green-500 text-white"
              : isLocked
                ? "bg-gray-200 text-gray-400"
                : isActive
                  ? "bg-orange-500 text-white"
                  : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            index + 1
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold truncate ${isLocked ? "text-gray-400" : "text-gray-800"}`}
          >
            {chapter.title}
          </p>
          {chapter.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {chapter.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1">
            {chapter.documentUrl && (
              <span className="text-xs text-blue-500 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Document
              </span>
            )}
            {chapter.quizId && (
              <span className="text-xs text-orange-500 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Quiz
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {isLocked ? (
            <Lock className="w-4 h-4 text-gray-300" />
          ) : isActive ? (
            <ChevronDown className="w-4 h-4 text-orange-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-300" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ChapterContent chapter={chapter} isCompleted={isCompleted} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ======================================================
   ChapterContent – document viewer button + quiz
====================================================== */
function ChapterContent({ chapter, isCompleted }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [chapterDone, setChapterDone] = useState(isCompleted);
  const [docModal, setDocModal] = useState(false);

  // Cloudinary URL is already full
  const docUrl = chapter.documentUrl || null;

  const handleQuizComplete = () => {
    setChapterDone(true);
    setShowQuiz(false);
  };

  return (
    <>
      {docModal && docUrl && (
  <DocumentModal
    url={docUrl}
    name={chapter.documentName}
    onClose={() => setDocModal(false)}
  />
)}

      <div className="border-t border-gray-100 px-5 py-5 space-y-5">
        {docUrl ? (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <p className="font-semibold text-blue-800 text-sm">
                Chapter Material
              </p>
            </div>

            <p className="text-xs text-blue-600">
              {chapter.documentName || "Study document"}
            </p>

            <button
              onClick={() => setDocModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              View Document
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 text-center text-sm text-gray-400">
            No document uploaded for this chapter
          </div>
        )}
        {/* Quiz / Complete section */}
        {chapterDone ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Chapter completed! Next chapter is unlocked.
            </p>
          </div>
        ) : chapter.quizId ? (
          <div className="space-y-3">
            {!showQuiz ? (
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Take Chapter Quiz to Unlock Next
              </button>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <QuizPanel
                  chapterId={chapter._id}
                  onComplete={handleQuizComplete}
                  onClose={() => setShowQuiz(false)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-4 py-3 text-center text-sm text-gray-500">
            No quiz for this chapter — it is always accessible
          </div>
        )}
      </div>
    </>
  );
}

/* ======================================================
   Main: CoursePlayer
====================================================== */
export default function CoursePlayer() {
  const { id: courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = async () => {
    try {
      const [courseData, chapterData] = await Promise.all([
        getCourseById(courseId),
        getCourseChaptersWithProgress(courseId),
      ]);
      setCourse(courseData);
      setChapters(chapterData.chapters || []);
      setCompletedIds(new Set(chapterData.completedChapters || []));

      const firstIncomplete = (chapterData.chapters || []).find(
        (c) => !(chapterData.completedChapters || []).includes(c._id),
      );
      if (firstIncomplete) setActiveChapterId(firstIncomplete._id);
      else if (chapterData.chapters?.length > 0)
        setActiveChapterId(chapterData.chapters[0]._id);
    } catch (err) {
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [courseId]);

  const refreshProgress = async () => {
    try {
      const data = await getCourseChaptersWithProgress(courseId);
      setCompletedIds(new Set(data.completedChapters || []));
      setChapters(data.chapters || []);
    } catch {
      /* silent */
    }
  };

  const isChapterLocked = (index) => {
    if (index === 0) return false;
    const prev = chapters[index - 1];
    if (!prev || !prev.quizId) return false;
    return !completedIds.has(prev._id);
  };

  const handleOpenChapter = (chapter) => {
    setActiveChapterId((prev) => (prev === chapter._id ? null : chapter._id));
  };

  const completedCount = chapters.filter((c) => completedIds.has(c._id)).length;
  const progressPercent =
    chapters.length > 0
      ? Math.round((completedCount / chapters.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span className="font-medium">Loading course...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <Link
            to="/student/courses"
            className="mt-4 inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/student/courses"
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition text-sm flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">My Courses</span>
            </Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <h1 className="font-semibold text-gray-800 text-sm truncate">
                {course?.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6 }}
                  className={`h-full rounded-full ${
                    progressPercent >= 100 ? "bg-green-500" : "bg-orange-500"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600">
                {progressPercent}%
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {completedCount}/{chapters.length} done
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {course?.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {course.description}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Course Chapters
          </h2>
          <p className="text-sm text-gray-400">
            Complete each chapter's quiz to unlock the next
          </p>
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No chapters yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your instructor hasn't added any chapters to this course.
            </p>
          </div>
        )}

        {chapters.map((chapter, idx) => {
          const locked = isChapterLocked(idx);
          const completed = completedIds.has(chapter._id);
          const active = activeChapterId === chapter._id && !locked;
          return (
            <ChapterCard
              key={chapter._id}
              chapter={chapter}
              index={idx}
              isCompleted={completed}
              isLocked={locked}
              isActive={active}
              onOpen={handleOpenChapter}
            />
          );
        })}

        <AnimatePresence>
          {progressPercent >= 100 && chapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 text-center shadow-xl shadow-green-200"
            >
              <Trophy className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
              <p className="font-bold text-lg">Course Complete! 🎉</p>
              <p className="text-sm text-green-100 mt-1">
                You've finished all chapters.
              </p>
              <Link
                to="/student/certificates"
                className="mt-4 inline-block bg-white text-green-700 px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition"
              >
                View Certificates
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

async function getCourseChaptersWithProgress(courseId) {
  return getCourseChapters(courseId);
}
