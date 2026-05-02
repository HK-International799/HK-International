
// import { useEffect } from "react";
// import DocumentAnnotator from "./DocumentAnnotator";
// import { saveAnnotations } from "../../services/assignmentService";

// export default function DocumentAnnotatorModal({
//   open,
//   onClose,
//   fileUrl,
//   fileName,
//   fileType,
//   submissionId,
//   annotations = [],
//   onChange,
//   readOnly = false,
// }) {
//   // Lock body scroll when open
//   useEffect(() => {
//     if (open) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [open]);

//   // Close on Escape
//   useEffect(() => {
//     if (!open) return;
//     const handler = (e) => {
//       if (e.key === "Escape") onClose?.();
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [open, onClose]);

//   if (!open) return null;

//   return (
//     <div
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 9999,
//         display: "flex",
//         alignItems: "stretch",
//         background: "rgba(15,23,42,0.6)",
//         backdropFilter: "blur(6px)",
//         animation: "fadeIn 0.15s ease",
//       }}
//       onClick={(e) => {
//         // Close on backdrop click
//         if (e.target === e.currentTarget) onClose?.();
//       }}
//     >
//       <div
//         style={{
//           flex: 1,
//           height: "100%", // ✅ ADD
//           margin: 20,
//           borderRadius: 20,
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//           background: "#fff", // ✅ ADD (critical for text visibility)
//           boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
//           animation: "slideUp 0.2s ease",
//         }}
//       >
//         <DocumentAnnotator
//           fileUrl={fileUrl}
//           fileName={fileName}
//           fileType={fileType}
//           annotations={annotations}
//           onChange={onChange}
//           readOnly={readOnly}
//           onClose={onClose}
//           onSave={async (updatedAnnotations) => {
//             if (!submissionId) return;

//             await saveAnnotations(submissionId, updatedAnnotations);
//           }}
//         />
//       </div>

//       <style>{`
//         @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
//         @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
//       `}</style>
//     </div>
//   );
// }





/**
 * DocumentAnnotatorModal.jsx
 *
 * Full-screen modal wrapping <DocumentAnnotator>.
 *
 * FIX: Now passes feedback, totalScore, and maxMarks props down to
 *      DocumentAnnotator so the "Download Reviewed Assignment" button
 *      can include them in the final PDF.
 */

import { useEffect } from "react";
import DocumentAnnotator from "./DocumentAnnotator";
import { saveAnnotations } from "../../services/assignmentService";

export default function DocumentAnnotatorModal({
  open,
  onClose,
  fileUrl,
  fileName,
  fileType,
  submissionId,
  annotations = [],
  onChange,
  readOnly = false,
  // FIX: New props needed for "Download Reviewed" feature
  feedback = "",
  totalScore = null,
  maxMarks = null,
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape — but DocumentAnnotator also listens for Escape
  // to cancel active annotation type, so we only close if no active type
  // This is handled inside DocumentAnnotator; modal just provides the backdrop.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      // Only close modal on Escape if no annotator toolbar is active
      // (DocumentAnnotator's own Escape handler runs first and stops propagation
      //  if an annotation type is active)
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !fileUrl) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "stretch",
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.15s ease",
      }}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          flex: 1,
          height: "100%",
          margin: 20,
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          animation: "slideUp 0.2s ease",
        }}
      >
        <DocumentAnnotator
          fileUrl={fileUrl}
          fileName={fileName}
          fileType={fileType}
          annotations={annotations}
          onChange={onChange}
          readOnly={readOnly}
          onClose={onClose}
          // FIX: Pass review context for "Download Reviewed" button
          feedback={feedback}
          totalScore={totalScore}
          maxMarks={maxMarks}
          onSave={async (updatedAnnotations) => {
            if (!submissionId) return;
            await saveAnnotations(submissionId, updatedAnnotations);
          }}
        />
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 }               to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
