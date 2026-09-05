// import React, { useRef, useState, useCallback, useMemo } from "react";
// const logo = "/hk_logo.png";

// /* ============================================================================
//    CONSTANTS & DEFAULTS
// ============================================================================ */

// const LABELS_PER_SHEET = 4;

// const DEFAULT_SENDER = {
//   name: "1A HK International — c/o Anurag Pandey",
//   line1: "Premashree House, New Colony, Kakarmatta, BLW",
//   line2: "Varanasi, Uttar Pradesh - 221004, India",
//   mobile: "+91-7991845638",
//   email: "info@hkinternational.uk",
//   website: "hkinternational.uk",
// };

// const DEFAULT_WARNING = {
//   bend: "DO NOT BEND",
//   subLine1: "Official Training Certificate Enclosed",
//   subLine2: "Handle With Care · Important Document",
// };

// /**
//  * Returns a blank "TO" address object.
//  * Simplified to just 3 fields — Name, Address (a single free-text block the
//  * receiver's full address can be pasted into in one go), and Mobile No —
//  * instead of 9 separate structured fields. Much faster to fill from a
//  * pasted order/courier address.
//  */
// const blankTo = () => ({
//   name: "",
//   address: "",
//   mobile: "",
// });

// /* ============================================================================
//    ID GENERATOR — module-level so it survives across renders
// ============================================================================ */

// let _id = 0;
// const nextId = () => `id-${++_id}`;

// /* ============================================================================
//    LABEL FACTORY
//    Creates a single label object with the given sender snapshot.
// ============================================================================ */

// const makeLabel = (senderSnap) => ({
//   id: nextId(),
//   to: blankTo(),
//   from: { ...senderSnap },
//   ...DEFAULT_WARNING,
// });

// /* ============================================================================
//    SHEET PAGINATION HELPER
//    Given a flat array of labels, returns them chunked into groups of 4.
//    Each chunk is a "virtual sheet" — no sheet state is stored separately;
//    sheets are always derived from the labels array.
// ============================================================================ */

// const chunkIntoSheets = (labels) => {
//   const sheets = [];
//   for (let i = 0; i < labels.length; i += LABELS_PER_SHEET) {
//     sheets.push(labels.slice(i, i + LABELS_PER_SHEET));
//   }
//   return sheets;
// };

// /* ============================================================================
//    UNDO / REDO HOOK
//    Wraps any state with a history stack.
//    Returns [currentState, setState, undo, redo, canUndo, canRedo].
// ============================================================================ */

// const MAX_HISTORY = 50;

// function useUndoable(initialState) {
//   const [history, setHistory] = useState({
//     past: [],
//     present: initialState,
//     future: [],
//   });

//   const setState = useCallback((updater) => {
//     setHistory((h) => {
//       const next = typeof updater === "function" ? updater(h.present) : updater;
//       return {
//         past: [...h.past.slice(-MAX_HISTORY + 1), h.present],
//         present: next,
//         future: [],
//       };
//     });
//   }, []);

//   const undo = useCallback(() => {
//     setHistory((h) => {
//       if (!h.past.length) return h;
//       const previous = h.past[h.past.length - 1];
//       return {
//         past: h.past.slice(0, -1),
//         present: previous,
//         future: [h.present, ...h.future],
//       };
//     });
//   }, []);

//   const redo = useCallback(() => {
//     setHistory((h) => {
//       if (!h.future.length) return h;
//       const next = h.future[0];
//       return {
//         past: [...h.past, h.present],
//         present: next,
//         future: h.future.slice(1),
//       };
//     });
//   }, []);

//   return [
//     history.present,
//     setState,
//     undo,
//     redo,
//     history.past.length > 0,
//     history.future.length > 0,
//   ];
// }

// /* ============================================================================
//    INLINE ICONS  (no icon-library dependency)
// ============================================================================ */

// const PinIcon = ({ className, color }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <path
//       d="M12 22s7-7.58 7-13A7 7 0 0 0 5 9c0 5.42 7 13 7 13Z"
//       stroke={color}
//       strokeWidth="1.8"
//       strokeLinejoin="round"
//     />
//     <circle cx="12" cy="9" r="2.4" stroke={color} strokeWidth="1.8" />
//   </svg>
// );

// const BuildingIcon = ({ className, color }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <path
//       d="M4 21V9.5L12 4l8 5.5V21"
//       stroke={color}
//       strokeWidth="1.8"
//       strokeLinejoin="round"
//       strokeLinecap="round"
//     />
//     <path
//       d="M9 21v-6h6v6"
//       stroke={color}
//       strokeWidth="1.8"
//       strokeLinejoin="round"
//     />
//     <path
//       d="M9 12h.01M15 12h.01M9 9h.01M15 9h.01"
//       stroke={color}
//       strokeWidth="1.8"
//       strokeLinecap="round"
//     />
//   </svg>
// );

// const ShieldIcon = ({ className, color }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <path
//       d="M12 2 2 7v6c0 5 4.2 8.6 10 9 5.8-.4 10-4 10-9V7L12 2Z"
//       stroke={color}
//       strokeWidth="1.7"
//       strokeLinejoin="round"
//     />
//     <path d="M12 8v5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
//     <circle cx="12" cy="16.3" r="1" fill={color} />
//   </svg>
// );

// const PlusIcon = ({ className }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <path
//       d="M12 5v14M5 12h14"
//       stroke="#fff"
//       strokeWidth="2.4"
//       strokeLinecap="round"
//     />
//   </svg>
// );

// const PrinterIcon = ({ className }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <path
//       d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z"
//       stroke="#fff"
//       strokeWidth="1.8"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// const TrashIcon = ({ className }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <path
//       d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6h14Z"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// const CopyIcon = ({ className }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <rect
//       x="9"
//       y="9"
//       width="12"
//       height="12"
//       rx="2"
//       stroke="currentColor"
//       strokeWidth="1.8"
//     />
//     <path
//       d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
//       stroke="currentColor"
//       strokeWidth="1.8"
//     />
//   </svg>
// );

// const UndoIcon = ({ className }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <path
//       d="M3 7h10a6 6 0 0 1 0 12H9"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//     <path
//       d="M3 7l4-4M3 7l4 4"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// const RedoIcon = ({ className }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <path
//       d="M21 7H11a6 6 0 0 0 0 12h4"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//     <path
//       d="M21 7l-4-4M21 7l-4 4"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// const DuplicateIcon = ({ className }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <rect
//       x="8"
//       y="8"
//       width="12"
//       height="12"
//       rx="2"
//       stroke="currentColor"
//       strokeWidth="1.8"
//     />
//     <path
//       d="M4 16V4a1 1 0 0 1 1-1h12"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//     />
//   </svg>
// );

// const ClipboardIcon = ({ className }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none">
//     <path
//       d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinejoin="round"
//     />
//     <rect
//       x="9"
//       y="3"
//       width="6"
//       height="4"
//       rx="1"
//       stroke="currentColor"
//       strokeWidth="1.8"
//     />
//   </svg>
// );

// /* ============================================================================
//    FIELD INPUT
//    One editable single-line field with a label caption and a dotted
//    underline. Memoised so it only re-renders when its own value changes.
//    Used for Name / Mobile No in the TO section, and reusable anywhere a
//    simple captioned line is needed.
// ============================================================================ */

// const FieldInput = React.memo(function FieldInput({ label, value, onChange, placeholder }) {
//   return (
//     <div className="flex items-baseline gap-[1.4mm] mb-[1.55mm] leading-none">
//       <span className="text-[6.1pt] font-bold tracking-[0.4px] text-slate-500 uppercase whitespace-nowrap">
//         {label}
//       </span>
//       <input
//         type="text"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className="flex-1 min-w-[6mm] h-[3.3mm] text-[7.4pt] font-medium text-[#1E2230] bg-transparent border-0
//                    border-b border-dotted border-[#A9AEBA] focus:border-solid focus:border-[#3C4CA0]
//                    focus:bg-[#3C4CA0]/5 outline-none px-0 py-0 rounded-none placeholder:text-slate-300"
//       />
//     </div>
//   );
// });

// /* ============================================================================
//    ADDRESS FIELD
//    A single free-text multi-line block for the recipient's full address —
//    lets you paste an entire address (house/street, area, city, state, PIN,
//    country) in one action instead of splitting it across separate fields.
//    Memoised for the same reason as FieldInput.
// ============================================================================ */

// const AddressField = React.memo(function AddressField({ value, onChange }) {
//   return (
//     <div className="flex flex-col gap-[0.6mm] mb-[1.55mm]">
//       <span className="text-[6.1pt] font-bold tracking-[0.4px] text-slate-500 uppercase whitespace-nowrap">
//         Address
//       </span>
//       <textarea
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={"Paste full address here — house/street,\narea, city, state, PIN, country"}
//         rows={5}
//         className="w-full h-[24mm] text-[7.4pt] font-medium text-[#1E2230] bg-transparent border-0
//                    border-b border-dotted border-[#A9AEBA] focus:border-solid focus:border-[#3C4CA0]
//                    focus:bg-[#3C4CA0]/5 outline-none px-0 py-0 rounded-none resize-none leading-[1.45]
//                    placeholder:text-slate-300 placeholder:leading-[1.45]"
//       />
//     </div>
//   );
// });

// /* ============================================================================
//    LABEL ACTION MENU
//    Small row of icon-buttons shown above each label on screen.
//    Separated out for clarity; completely hidden on print.
// ============================================================================ */

// const LabelActions = React.memo(function LabelActions({
//   onCopyFour,
//   onDuplicate,
//   onCopy,
//   onPaste,
//   onRemove,
//   canPaste,
//   isOnly,
// }) {
//   return (
//     <div className="print:hidden flex items-center gap-2 text-xs text-slate-600 h-1">
//       {/* Copy ×4 — original feature: fill other 3 slots on this sheet */}
//       <button
//         type="button"
//         onClick={onCopyFour}
//         title="Copy this label's details to the other 3 on this sheet"
//         className="flex items-center gap-0.5 hover:text-[#3C4CA0]"
//       >
//         <CopyIcon className="w-3 h-3" /> ×4
//       </button>

//       {/* Duplicate — insert a copy directly after this label */}
//       <button
//         type="button"
//         onClick={onDuplicate}
//         title="Duplicate this label (inserts after)"
//         className="flex items-center gap-0.5 hover:text-[#3C4CA0]"
//       >
//         <DuplicateIcon className="w-3 h-3" /> dup
//       </button>

//       {/* Copy — store in clipboard state */}
//       <button
//         type="button"
//         onClick={onCopy}
//         title="Copy this label to clipboard"
//         className="flex items-center gap-0.5 hover:text-[#7A2E8C]"
//       >
//         <ClipboardIcon className="w-3 h-3" /> copy
//       </button>

//       {/* Paste — available only when clipboard has content */}
//       {canPaste && (
//         <button
//           type="button"
//           onClick={onPaste}
//           title="Paste clipboard label here"
//           className="flex items-center gap-0.5 hover:text-[#7A2E8C]"
//         >
//           <ClipboardIcon className="w-3 h-3" /> paste
//         </button>
//       )}

//       {/* Remove — disabled when only 1 label exists */}
//       {!isOnly && (
//         <button
//           type="button"
//           onClick={onRemove}
//           title="Remove this label"
//           className="flex items-center gap-0.5 hover:text-red-600 ml-1"
//         >
//           <TrashIcon className="w-3 h-3" /> del
//         </button>
//       )}
//     </div>
//   );
// });

// /* ============================================================================
//    ADDRESS LABEL
//    Renders a single 105 × 148.5 mm label with TO / FROM / warning sections.
//    The TO section is just 3 fields: Name, Address (free-text paste target),
//    Mobile No. All field callbacks are memoised at the parent level.
// ============================================================================ */

// const AddressLabel = React.memo(function AddressLabel({
//   label,
//   onToChange,
//   onFromChange,
//   onWarnChange,
//   onCopyFour,
//   onDuplicate,
//   onCopy,
//   onPaste,
//   onRemove,
//   canPaste,
//   isOnly,
// }) {
//   return (
//     <div className="p-[5mm] flex items-center justify-center relative">
//       <div
//         className="relative w-full h-full border-[0.5pt] border-[#D7D2C4] rounded-[4mm]
//                    p-[4.5mm_5.5mm_4mm_5.5mm] flex flex-col bg-white overflow-hidden break-inside-avoid"
//       >
//         <LabelActions
//           onCopyFour={onCopyFour}
//           onDuplicate={onDuplicate}
//           onCopy={onCopy}
//           onPaste={onPaste}
//           onRemove={onRemove}
//           canPaste={canPaste}
//           isOnly={isOnly}
//         />
//         {/* Top gradient accent bar */}
//         <div
//           className="absolute top-0 left-0 right-0 h-[1.1mm]"
//           style={{
//             background:
//               "linear-gradient(90deg,#3C4CA0 0%,#7A2E8C 33%,#B5306E 60%,#E15A2E 100%)",
//           }}
//         />

//         {/* Logo */}
//         <div className="flex justify-center items-center pt-[2.6mm] pb-[1.6mm]">
//           <img
//             src={logo}
//             alt="1A HK International"
//             className="h-[15mm] w-auto block"
//           />
//         </div>

//         {/* Gold divider */}
//         <div
//           className="h-[0.5pt] mb-[2.6mm]"
//           style={{
//             background:
//               "linear-gradient(90deg,rgba(199,154,70,0) 0%,#C79A46 20%,#C79A46 80%,rgba(199,154,70,0) 100%)",
//           }}
//         />

//         {/* TO header + action buttons */}
//         <div className="flex items-center gap-[1.6mm] mb-[1.6mm]">
//           <PinIcon className="w-[4.2mm] h-[4.2mm]" color="#3C4CA0" />
//           <span className="text-[8.4pt] font-extrabold tracking-[1.6px] text-[#3C4CA0]">
//             TO
//           </span>
//           <span className="flex-1 border-t border-[#C9CDD6] ml-[1.2mm]" />
//         </div>

//         {/* TO fields — Name / Address (paste-friendly) / Mobile No */}
//         <div className="mb-[2.4mm]">
//           <FieldInput
//             label="Name"
//             value={label.to.name}
//             onChange={(v) => onToChange("name", v)}
//             placeholder="Recipient's full name"
//           />
//           <AddressField
//             value={label.to.address}
//             onChange={(v) => onToChange("address", v)}
//           />
//           <FieldInput
//             label="Mobile No."
//             value={label.to.mobile}
//             onChange={(v) => onToChange("mobile", v)}
//             placeholder="10-digit mobile number"
//           />
//         </div>

//         {/* FROM header */}
//         <div className="flex items-center gap-[1.6mm]">
//           <BuildingIcon className="w-[4.2mm] h-[4.2mm]" color="#7A2E8C" />
//           <span className="text-[8.4pt] font-extrabold tracking-[1.6px] text-[#7A2E8C]">
//             FROM
//           </span>
//           <span className="flex-1 border-t border-[#C9CDD6] ml-[1.2mm]" />
//         </div>

//         {/* FROM block */}
//         <div className="bg-[#FAF9F6] border-[0.5pt] border-[#ECE7DA] rounded-[2mm] p-[2mm_3mm_2mm_3mm] mb-[2.4mm]">
//           <input
//             value={label.from.name}
//             onChange={(e) => onFromChange("name", e.target.value)}
//             className="w-full text-[8.6pt] font-extrabold text-[#1E2230] bg-transparent outline-none border-0 focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//           />
//           <input
//             value={label.from.line1}
//             onChange={(e) => onFromChange("line1", e.target.value)}
//             className="w-full text-[7.1pt] text-[#333844] bg-transparent outline-none border-0 leading-[1.42] focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//           />
//           <input
//             value={label.from.line2}
//             onChange={(e) => onFromChange("line2", e.target.value)}
//             className="w-full text-[7.1pt] text-[#333844] bg-transparent outline-none border-0 leading-[1.42] focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//           />
//           <div className="flex items-center gap-[1mm] text-[7.1pt] text-[#333844]">
//             <span className="text-slate-500 font-bold whitespace-nowrap">
//               Mob:
//             </span>
//             <input
//               value={label.from.mobile}
//               onChange={(e) => onFromChange("mobile", e.target.value)}
//               className="flex-1 min-w-0 bg-transparent outline-none border-0 focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//             />
//             <span className="text-slate-500 font-bold whitespace-nowrap ml-[2mm]">
//               Email:
//             </span>
//             <input
//               value={label.from.email}
//               onChange={(e) => onFromChange("email", e.target.value)}
//               className="flex-1 min-w-0 bg-transparent outline-none border-0 focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//             />
//           </div>
//           <div className="flex items-center gap-[1mm] text-[7.1pt]">
//             <span className="text-slate-500 font-bold whitespace-nowrap">
//               Web:
//             </span>
//             <input
//               value={label.from.website}
//               onChange={(e) => onFromChange("website", e.target.value)}
//               className="flex-1 min-w-0 bg-transparent outline-none border-0 text-[#3C4CA0] font-bold focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//             />
//           </div>
//         </div>

//         {/* Warning banner */}
//         <div className="mt-auto border border-[#C81E2C] rounded-[2mm] bg-[#FFF6F6] p-[2mm_2.6mm_2mm_2.6mm] flex items-center gap-[2mm]">
//           <ShieldIcon className="w-[8mm] h-[8mm] shrink-0" color="#C81E2C" />
//           <div className="flex-1 min-w-0">
//             <input
//               value={label.bend}
//               onChange={(e) => onWarnChange("bend", e.target.value)}
//               className="w-full text-[12.5pt] font-black tracking-[1px] text-[#C81E2C] bg-transparent outline-none border-0 leading-tight mb-[0.8mm] focus:bg-[#C81E2C]/5 rounded-[1mm]"
//             />
//             <input
//               value={label.subLine1}
//               onChange={(e) => onWarnChange("subLine1", e.target.value)}
//               className="w-full text-[6.4pt] font-bold tracking-[0.3px] text-[#7A2129] uppercase bg-transparent outline-none border-0 leading-[1.42] focus:bg-[#C81E2C]/5 rounded-[1mm]"
//             />
//             <input
//               value={label.subLine2}
//               onChange={(e) => onWarnChange("subLine2", e.target.value)}
//               className="w-full text-[6.4pt] font-bold tracking-[0.3px] text-[#7A2129] uppercase bg-transparent outline-none border-0 leading-[1.42] focus:bg-[#C81E2C]/5 rounded-[1mm]"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// });

// /* ============================================================================
//    SHEET
//    One A4 page containing up to LABELS_PER_SHEET (4) labels.
//    Receives a flat slice of the labels array and the absolute start index.
// ============================================================================ */

// const Sheet = React.memo(function Sheet({
//   labels,
//   sheetIndex,
//   totalSheets,
//   startIndex,
//   onUpdate,
//   onRemoveSheet,
//   onCopyFour,
//   onDuplicate,
//   onCopy,
//   onPaste,
//   onRemoveLabel,
//   canPaste,
//   totalLabels,
// }) {
//   const isLast = sheetIndex === totalSheets - 1;

//   return (
//     <div className="max-w-[210mm] mx-auto my-4 print:my-0 print:max-w-none">
//       {/* Screen-only sheet header */}
//       <div className="flex items-center justify-between max-w-[210mm] mx-auto mb-1.5 px-1 print:hidden">
//         <div className="text-[11.5px] font-extrabold text-slate-500 tracking-wide">
//           Sheet <span className="text-[#3C4CA0]">{sheetIndex + 1}</span>{" "}
//           <span className="text-slate-400 font-medium">
//             · A4 · {labels.length} label{labels.length !== 1 ? "s" : ""}
//           </span>
//         </div>
//         {totalSheets > 1 && (
//           <button
//             type="button"
//             onClick={onRemoveSheet}
//             title="Remove all labels on this sheet"
//             className="w-6.5 h-6.5 inline-flex items-center justify-center rounded-md border border-slate-200
//                        text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
//           >
//             <TrashIcon className="w-3.5 h-3.5" />
//           </button>
//         )}
//       </div>

//       {/* Physical A4 sheet — exact 210mm × 297mm, 2×2 grid */}
//       <div
//         className="relative bg-white shadow-lg print:shadow-none"
//         style={{
//           width: "210mm",
//           height: "297mm",
//           display: "grid",
//           gridTemplateColumns: "105mm 105mm",
//           gridTemplateRows: "148.5mm 148.5mm",
//           breakInside: "avoid",
//           pageBreakInside: "avoid",
//           breakAfter: isLast ? "auto" : "page",
//           pageBreakAfter: isLast ? "auto" : "always",
//         }}
//       >
//         {/* Dotted cut guides */}
//         <div className="absolute inset-y-0 left-1/2 border-l-[0.35mm] border-dotted border-[#A9AEBA] pointer-events-none z-[5]" />
//         <div className="absolute inset-x-0 top-1/2 border-t-[0.35mm] border-dotted border-[#A9AEBA] pointer-events-none z-[5]" />

//         {labels.map((label, localIndex) => {
//           const globalIndex = startIndex + localIndex;
//           return (
//             <AddressLabel
//               key={label.id}
//               label={label}
//               onToChange={(k, v) => onUpdate(globalIndex, "to", k, v)}
//               onFromChange={(k, v) => onUpdate(globalIndex, "from", k, v)}
//               onWarnChange={(k, v) => onUpdate(globalIndex, "warn", k, v)}
//               onCopyFour={() => onCopyFour(sheetIndex, localIndex)}
//               onDuplicate={() => onDuplicate(globalIndex)}
//               onCopy={() => onCopy(globalIndex)}
//               onPaste={() => onPaste(globalIndex)}
//               onRemove={() => onRemoveLabel(globalIndex)}
//               canPaste={canPaste}
//               isOnly={totalLabels === 1}
//             />
//           );
//         })}

//         {/* Empty placeholder cells (when a sheet has fewer than 4 labels) */}
//         {Array.from({ length: LABELS_PER_SHEET - labels.length }).map(
//           (_, i) => (
//             <div key={`empty-${i}`} className="p-[5mm]">
//               <div className="w-full h-full border-[0.5pt] border-dashed border-[#D7D2C4] rounded-[4mm] bg-[#FAFAFA] flex items-center justify-center print:border-transparent print:bg-white">
//                 <span className="text-[9px] text-slate-300 print:hidden">
//                   empty slot
//                 </span>
//               </div>
//             </div>
//           ),
//         )}
//       </div>
//     </div>
//   );
// });

// /* ============================================================================
//    DEFAULT SENDER PANEL
//    Lets the user set sender details once and push them to all labels.
// ============================================================================ */

// const SenderPanel = React.memo(function SenderPanel({
//   sender,
//   onChange,
//   onApplyAll,
// }) {
//   const field = (key, placeholder, colSpan = "") => (
//     <input
//       value={sender[key]}
//       onChange={(e) => onChange(key, e.target.value)}
//       placeholder={placeholder}
//       className={`${colSpan} text-[12px] border border-slate-200 rounded px-2 py-1 outline-none focus:border-[#7A2E8C]`}
//     />
//   );

//   return (
//     <div className="max-w-[200mm] h-60 mx-auto mt-3 px-3.5 py-3 bg-linear-to-r from-indigo-400 to-orange-300 border border-slate-200 rounded-lg print:hidden">
//       <div className="flex items-center justify-between mb-2">
//         <span className="text-[12px] font-extrabold text-[#7A2E8C]">
//           Default Sender (used for new labels &amp; sheets)
//         </span>
//         <button
//           type="button"
//           onClick={onApplyAll}
//           className="text-[11px] font-bold text-[#7A2E8C] hover:underline"
//         >
//           Apply to all existing labels →
//         </button>
//       </div>
//       <div className="grid grid-cols-2 gap-2">
//         {field("name", "Sender name", "col-span-2")}
//         {field("line1", "Address line 1", "col-span-2")}
//         {field("line2", "Address line 2 / City / State / PIN", "col-span-2")}
//         {field("mobile", "Mobile")}
//         {field("email", "Email")}
//         {field("website", "Website", "col-span-2")}
//       </div>
//     </div>
//   );
// });

// /* ============================================================================
//    TOOLBAR
//    Sticky top bar with all global actions.
// ============================================================================ */

// const Toolbar = React.memo(function Toolbar({
//   onAddLabel,
//   onAddSheet,
//   onPrint,
//   onClearAll,
//   onUndo,
//   onRedo,
//   canUndo,
//   canRedo,
//   labelCount,
//   sheetCount,
// }) {
//   return (
//     <div className="sticky top-0 z-[100] flex flex-wrap items-center justify-center gap-2 px-3.5 py-2.5 bg-white border-b border-slate-200 shadow-sm print:hidden">
//       <div className="text-[13px] font-extrabold text-[#1E2230] mr-2.5">
//         1A HK International
//         <small className="block font-medium text-slate-500 text-[10.5px]">
//           {labelCount} label{labelCount !== 1 ? "s" : ""} · {sheetCount} sheet
//           {sheetCount !== 1 ? "s" : ""}
//         </small>
//       </div>

//       {/* Add single label */}
//       <button
//         type="button"
//         onClick={onAddLabel}
//         className="inline-flex items-center gap-1.5 rounded-md bg-[#3C4CA0] hover:bg-[#33408C] text-white text-[12.5px] font-bold px-3.5 py-2"
//       >
//         <PlusIcon className="w-3.5 h-3.5" /> Add Label
//       </button>

//       {/* Add full sheet (4 blank labels) */}
//       <button
//         type="button"
//         onClick={onAddSheet}
//         className="inline-flex items-center gap-1.5 rounded-md bg-[#3C4CA0] hover:bg-[#33408C] text-white text-[12.5px] font-bold px-3.5 py-2"
//       >
//         <PlusIcon className="w-3.5 h-3.5" /> Add Sheet (4)
//       </button>

//       {/* Print */}
//       <button
//         type="button"
//         onClick={onPrint}
//         className="inline-flex items-center gap-1.5 rounded-md bg-[#C81E2C] hover:bg-[#A9101D] text-white text-[12.5px] font-bold px-3.5 py-2"
//       >
//         <PrinterIcon className="w-3.5 h-3.5" /> Print All
//       </button>

//       {/* Undo */}
//       <button
//         type="button"
//         onClick={onUndo}
//         disabled={!canUndo}
//         title="Undo (Ctrl+Z)"
//         className="inline-flex items-center gap-1 rounded-md text-[12.5px] font-bold px-3 py-2
//                    text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
//       >
//         <UndoIcon className="w-4 h-4" />
//       </button>

//       {/* Redo */}
//       <button
//         type="button"
//         onClick={onRedo}
//         disabled={!canRedo}
//         title="Redo (Ctrl+Y)"
//         className="inline-flex items-center gap-1 rounded-md text-[12.5px] font-bold px-3 py-2
//                    text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
//       >
//         <RedoIcon className="w-4 h-4" />
//       </button>

//       {/* Clear all TO fields */}
//       <button
//         type="button"
//         onClick={onClearAll}
//         className="rounded-md text-[12.5px] font-bold px-3.5 py-2 text-slate-500 hover:bg-slate-100 hover:text-[#1E2230]"
//       >
//         Clear All Fields
//       </button>
//     </div>
//   );
// });

// /* ============================================================================
//    ROOT COMPONENT — AddressLabelSheet
   
//    State model:
//      labels  — flat array of all label objects (single source of truth)
//      sender  — default sender details for new labels
//      clipboard — a single copied label object (null if empty)

//    Sheets are always *derived* from `labels` via chunkIntoSheets().
//    Add/remove/duplicate operations mutate `labels`; sheets auto-adjust.
// ============================================================================ */

// export default function AddressLabelSheet() {
//   /* ── Sender state (not part of undo history) ─────────────────────────── */
//   const [sender, setSender] = useState({ ...DEFAULT_SENDER });

//   /* ── Clipboard state (not undoable — intentional) ────────────────────── */
//   const [clipboard, setClipboard] = useState(null);

//   /* ── Labels — undoable source of truth ───────────────────────────────── */
//   const [labels, setLabels, undo, redo, canUndo, canRedo] = useUndoable([
//     makeLabel(DEFAULT_SENDER),
//     makeLabel(DEFAULT_SENDER),
//     makeLabel(DEFAULT_SENDER),
//     makeLabel(DEFAULT_SENDER),
//   ]);

//   /* ── Derived: sheets (memoised, recomputed only when labels changes) ─── */
//   const sheets = useMemo(() => chunkIntoSheets(labels), [labels]);

//   /* ── Keyboard shortcuts for undo/redo ────────────────────────────────── */
//   React.useEffect(() => {
//     const handler = (e) => {
//       if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
//         e.preventDefault();
//         undo();
//       }
//       if (
//         (e.ctrlKey || e.metaKey) &&
//         (e.key === "y" || (e.key === "z" && e.shiftKey))
//       ) {
//         e.preventDefault();
//         redo();
//       }
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [undo, redo]);

//   /* ── Label mutations ─────────────────────────────────────────────────── */

//   /** Add a single blank label at the end */
//   const handleAddLabel = useCallback(() => {
//     setLabels((prev) => [...prev, makeLabel(sender)]);
//   }, [setLabels, sender]);

//   /** Add 4 blank labels (a full sheet's worth) */
//   const handleAddSheet = useCallback(() => {
//     setLabels((prev) => [
//       ...prev,
//       makeLabel(sender),
//       makeLabel(sender),
//       makeLabel(sender),
//       makeLabel(sender),
//     ]);
//   }, [setLabels, sender]);

//   /** Remove a single label by its global index */
//   const handleRemoveLabel = useCallback(
//     (globalIndex) => {
//       setLabels((prev) => {
//         if (prev.length <= 1) return prev; // always keep at least 1
//         return prev.filter((_, i) => i !== globalIndex);
//       });
//     },
//     [setLabels],
//   );

//   /** Remove all labels that belong to a given sheet */
//   const handleRemoveSheet = useCallback(
//     (sheetIndex) => {
//       setLabels((prev) => {
//         const start = sheetIndex * LABELS_PER_SHEET;
//         const end = start + LABELS_PER_SHEET;
//         const next = prev.filter((_, i) => i < start || i >= end);
//         return next.length ? next : prev; // don't allow zero labels
//       });
//     },
//     [setLabels],
//   );

//   /** Duplicate a label — insert a copy immediately after the original */
//   const handleDuplicate = useCallback(
//     (globalIndex) => {
//       setLabels((prev) => {
//         const source = prev[globalIndex];
//         const copy = {
//           ...source,
//           id: nextId(),
//           to: { ...source.to },
//           from: { ...source.from },
//         };
//         const next = [...prev];
//         next.splice(globalIndex + 1, 0, copy);
//         return next;
//       });
//     },
//     [setLabels],
//   );

//   /** Copy ×4 — fill the other 3 slots on the same sheet from one source */
//   const handleCopyFour = useCallback(
//     (sheetIndex, localIndex) => {
//       setLabels((prev) => {
//         const start = sheetIndex * LABELS_PER_SHEET;
//         const source = prev[start + localIndex];
//         return prev.map((lab, i) => {
//           const isOnThisSheet = i >= start && i < start + LABELS_PER_SHEET;
//           const isSelf = i === start + localIndex;
//           if (!isOnThisSheet || isSelf) return lab;
//           return {
//             ...source,
//             id: nextId(),
//             to: { ...source.to },
//             from: { ...source.from },
//           };
//         });
//       });
//     },
//     [setLabels],
//   );

//   /** Store a label in the clipboard (does not remove the original) */
//   const handleCopy = useCallback(
//     (globalIndex) => {
//       setClipboard((prev) => {
//         const source = labels[globalIndex];
//         return { ...source, to: { ...source.to }, from: { ...source.from } };
//       });
//     },
//     [labels],
//   );

//   /** Paste clipboard label at a position (replaces the target label's content) */
//   const handlePaste = useCallback(
//     (globalIndex) => {
//       if (!clipboard) return;
//       setLabels((prev) =>
//         prev.map((lab, i) =>
//           i === globalIndex
//             ? { ...clipboard, id: lab.id } // keep original id, replace all content
//             : lab,
//         ),
//       );
//     },
//     [setLabels, clipboard],
//   );

//   /** Update a single field on a single label */
//   const handleUpdateField = useCallback(
//     (globalIndex, section, key, value) => {
//       setLabels((prev) =>
//         prev.map((lab, i) => {
//           if (i !== globalIndex) return lab;
//           if (section === "to")
//             return { ...lab, to: { ...lab.to, [key]: value } };
//           if (section === "from")
//             return { ...lab, from: { ...lab.from, [key]: value } };
//           if (section === "warn") return { ...lab, [key]: value };
//           return lab;
//         }),
//       );
//     },
//     [setLabels],
//   );

//   /* ── Sender panel handlers ───────────────────────────────────────────── */

//   const handleSenderChange = useCallback((key, value) => {
//     setSender((prev) => ({ ...prev, [key]: value }));
//   }, []);

//   /** Push current sender details to every label's FROM section */
//   const handleApplySenderToAll = useCallback(() => {
//     setLabels((prev) => prev.map((lab) => ({ ...lab, from: { ...sender } })));
//   }, [setLabels, sender]);

//   /* ── Global bulk actions ─────────────────────────────────────────────── */

//   const handleClearAll = useCallback(() => {
//     if (
//       !window.confirm(
//         'Clear all "TO" address fields? Sender details will be kept.',
//       )
//     )
//       return;
//     setLabels((prev) => prev.map((l) => ({ ...l, to: blankTo() })));
//   }, [setLabels]);

//   const handlePrint = useCallback(() => window.print(), []);

//   /* ── Render ──────────────────────────────────────────────────────────── */

//   return (
//     <div className="min-h-screen print:min-h-0 bg-[#EDEEF1] print:bg-white">
//       {/* @page rule — ensures correct A4 sizing on print */}
//       <style>{`
//         @page { size: 210mm 297mm; margin: 0; }
//         @media print {
//           html, body, #root {
//             margin: 0 !important;
//             padding: 0 !important;
//             width: auto !important;
//             height: auto !important;
//             min-height: 0 !important;
//             overflow: visible !important;
//             background: #fff !important;
//           }
//         }
//       `}</style>

//       {/* Sticky toolbar */}
//       <Toolbar
//         onAddLabel={handleAddLabel}
//         onAddSheet={handleAddSheet}
//         onPrint={handlePrint}
//         onClearAll={handleClearAll}
//         onUndo={undo}
//         onRedo={redo}
//         canUndo={canUndo}
//         canRedo={canRedo}
//         labelCount={labels.length}
//         sheetCount={sheets.length}
//       />

//       {/* Default sender panel */}
//       <SenderPanel
//         sender={sender}
//         onChange={handleSenderChange}
//         onApplyAll={handleApplySenderToAll}
//       />

//       {/* Hint bar */}
//       <div className="max-w-[210mm] mx-auto mt-2 px-3.5 py-2 bg-[#FFF7E8] border border-[#F0DDAE] rounded-lg text-[11.5px] text-[#7A5A16] text-center print:hidden">
//         <b className="text-[#5C4310]">Click any field to type directly.</b> The{" "}
//         <b>Address</b> field accepts a full pasted address in one go. Use{" "}
//         <b>Add Label</b> for a single label or <b>Add Sheet</b> for 4 at once.
//         Labels auto-paginate into A4 sheets (4 per page). <b>Ctrl+Z</b> /{" "}
//         <b>Ctrl+Y</b> to undo/redo.
//       </div>

//       {/* Auto-paginated sheets */}
//       <div className="pt-3.5 pb-14 print:p-0">
//         {sheets.map((sheetLabels, sheetIndex) => (
//           <Sheet
//             key={sheetIndex}
//             labels={sheetLabels}
//             sheetIndex={sheetIndex}
//             totalSheets={sheets.length}
//             startIndex={sheetIndex * LABELS_PER_SHEET}
//             onUpdate={handleUpdateField}
//             onRemoveSheet={() => handleRemoveSheet(sheetIndex)}
//             onCopyFour={handleCopyFour}
//             onDuplicate={handleDuplicate}
//             onCopy={handleCopy}
//             onPaste={handlePaste}
//             onRemoveLabel={handleRemoveLabel}
//             canPaste={!!clipboard}
//             totalLabels={labels.length}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }






import React, { useRef, useState, useCallback, useMemo } from "react";
const logo = "/hk_logo.png";

/* ============================================================================
   CONSTANTS & DEFAULTS
============================================================================ */

const LABELS_PER_SHEET = 4;

const DEFAULT_SENDER = {
  name: "1A HK International — c/o Anurag Pandey",
  line1: "BN House, New Colony, Kakarmatta, BLW",
  line2: "Varanasi, Uttar Pradesh - 221004, India",
  mobile: "+91-7991845638",
  email: "info@hkinternational.uk",
  website: "hkinternational.uk",
};

const DEFAULT_WARNING = {
  bend: "DO NOT BEND",
  subLine1: "Official Training Certificate Enclosed",
  subLine2: "Handle With Care · Important Document",
};

/**
 * Returns a blank "TO" address object.
 * Postal format: Name, Address Line 1, Address Line 2, PIN Code, Mobile No —
 * instead of a single free-text address blob. Matches standard courier /
 * postal address layout and keeps each part easy to read at a glance.
 */
const blankTo = () => ({
  name: "",
  addressLine1: "",
  addressLine2: "",
  pincode: "",
  mobile: "",
});

/* ============================================================================
   ID GENERATOR — module-level so it survives across renders
============================================================================ */

let _id = 0;
const nextId = () => `id-${++_id}`;

/* ============================================================================
   LABEL FACTORY
   Creates a single label object with the given sender snapshot.
============================================================================ */

const makeLabel = (senderSnap) => ({
  id: nextId(),
  to: blankTo(),
  from: { ...senderSnap },
  ...DEFAULT_WARNING,
});

/* ============================================================================
   SHEET PAGINATION HELPER
   Given a flat array of labels, returns them chunked into groups of 4.
   Each chunk is a "virtual sheet" — no sheet state is stored separately;
   sheets are always derived from the labels array.
============================================================================ */

const chunkIntoSheets = (labels) => {
  const sheets = [];
  for (let i = 0; i < labels.length; i += LABELS_PER_SHEET) {
    sheets.push(labels.slice(i, i + LABELS_PER_SHEET));
  }
  return sheets;
};

/* ============================================================================
   UNDO / REDO HOOK
   Wraps any state with a history stack.
   Returns [currentState, setState, undo, redo, canUndo, canRedo].
============================================================================ */

const MAX_HISTORY = 50;

function useUndoable(initialState) {
  const [history, setHistory] = useState({
    past: [],
    present: initialState,
    future: [],
  });

  const setState = useCallback((updater) => {
    setHistory((h) => {
      const next = typeof updater === "function" ? updater(h.present) : updater;
      return {
        past: [...h.past.slice(-MAX_HISTORY + 1), h.present],
        present: next,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.past.length) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (!h.future.length) return h;
      const next = h.future[0];
      return {
        past: [...h.past, h.present],
        present: next,
        future: h.future.slice(1),
      };
    });
  }, []);

  return [
    history.present,
    setState,
    undo,
    redo,
    history.past.length > 0,
    history.future.length > 0,
  ];
}

/* ============================================================================
   INLINE ICONS  (no icon-library dependency)
============================================================================ */

const PinIcon = ({ className, color }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 22s7-7.58 7-13A7 7 0 0 0 5 9c0 5.42 7 13 7 13Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9" r="2.4" stroke={color} strokeWidth="1.8" />
  </svg>
);

const BuildingIcon = ({ className, color }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 21V9.5L12 4l8 5.5V21"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M9 21v-6h6v6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 12h.01M15 12h.01M9 9h.01M15 9h.01"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const ShieldIcon = ({ className, color }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2 2 7v6c0 5 4.2 8.6 10 9 5.8-.4 10-4 10-9V7L12 2Z"
      stroke={color}
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M12 8v5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    <circle cx="12" cy="16.3" r="1" fill={color} />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 5v14M5 12h14"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

const PrinterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z"
      stroke="#fff"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6h14Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const CopyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect
      x="9"
      y="9"
      width="12"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);

const UndoIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 7h10a6 6 0 0 1 0 12H9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 7l4-4M3 7l4 4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RedoIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M21 7H11a6 6 0 0 0 0 12h4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 7l-4-4M21 7l-4 4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DuplicateIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect
      x="8"
      y="8"
      width="12"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M4 16V4a1 1 0 0 1 1-1h12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const ClipboardIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <rect
      x="9"
      y="3"
      width="6"
      height="4"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);

/* ============================================================================
   FIELD INPUT
   One editable single-line field with a label caption and a dotted
   underline. Memoised so it only re-renders when its own value changes.
   Used for every TO field (Name / Address Line 1 / Address Line 2 /
   PIN Code / Mobile No). Text size bumped up for readability.
============================================================================ */

const FieldInput = React.memo(function FieldInput({ label, value, onChange, placeholder }) {
  return (
    <div className="flex items-baseline gap-[1.4mm] mb-[1.25mm] leading-none">
      <span className="text-[6.4pt] font-bold tracking-[0.4px] text-slate-500 uppercase whitespace-nowrap">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-[6mm] h-[4mm] text-[9.2pt] font-medium text-[#1E2230] bg-transparent border-0
                   border-b border-dotted border-[#A9AEBA] focus:border-solid focus:border-[#3C4CA0]
                   focus:bg-[#3C4CA0]/5 outline-none px-0 py-0 rounded-none placeholder:text-slate-300"
      />
    </div>
  );
});

/* ============================================================================
   LABEL ACTION MENU
   Small row of icon-buttons shown above each label on screen.
   Separated out for clarity; completely hidden on print.
============================================================================ */

const LabelActions = React.memo(function LabelActions({
  onCopyFour,
  onDuplicate,
  onCopy,
  onPaste,
  onRemove,
  canPaste,
  isOnly,
}) {
  return (
    <div className="print:hidden flex items-center gap-2 text-xs text-slate-600 h-1">
      {/* Copy ×4 — original feature: fill other 3 slots on this sheet */}
      <button
        type="button"
        onClick={onCopyFour}
        title="Copy this label's details to the other 3 on this sheet"
        className="flex items-center gap-0.5 hover:text-[#3C4CA0]"
      >
        <CopyIcon className="w-3 h-3" /> ×4
      </button>

      {/* Duplicate — insert a copy directly after this label */}
      <button
        type="button"
        onClick={onDuplicate}
        title="Duplicate this label (inserts after)"
        className="flex items-center gap-0.5 hover:text-[#3C4CA0]"
      >
        <DuplicateIcon className="w-3 h-3" /> dup
      </button>

      {/* Copy — store in clipboard state */}
      <button
        type="button"
        onClick={onCopy}
        title="Copy this label to clipboard"
        className="flex items-center gap-0.5 hover:text-[#7A2E8C]"
      >
        <ClipboardIcon className="w-3 h-3" /> copy
      </button>

      {/* Paste — available only when clipboard has content */}
      {canPaste && (
        <button
          type="button"
          onClick={onPaste}
          title="Paste clipboard label here"
          className="flex items-center gap-0.5 hover:text-[#7A2E8C]"
        >
          <ClipboardIcon className="w-3 h-3" /> paste
        </button>
      )}

      {/* Remove — disabled when only 1 label exists */}
      {!isOnly && (
        <button
          type="button"
          onClick={onRemove}
          title="Remove this label"
          className="flex items-center gap-0.5 hover:text-red-600 ml-1"
        >
          <TrashIcon className="w-3 h-3" /> del
        </button>
      )}
    </div>
  );
});

/* ============================================================================
   ADDRESS LABEL
   Renders a single 105 × 148.5 mm label with TO / FROM / warning sections.
   TO section is postal format: Name, Address Line 1, Address Line 2,
   PIN Code, Mobile No. All field callbacks are memoised at the parent level.
   Logo and the "DO NOT BEND" banner have been trimmed down so the larger
   address/phone text still fits cleanly on the label.
============================================================================ */

const AddressLabel = React.memo(function AddressLabel({
  label,
  onToChange,
  onFromChange,
  onWarnChange,
  onCopyFour,
  onDuplicate,
  onCopy,
  onPaste,
  onRemove,
  canPaste,
  isOnly,
}) {
  return (
    <div className="p-[5mm] flex items-center justify-center relative">
      <div
        className="relative w-full h-full border-[0.5pt] border-[#D7D2C4] rounded-[4mm]
                   p-[4mm_5.5mm_3.5mm_5.5mm] flex flex-col bg-white overflow-hidden break-inside-avoid"
      >
        <LabelActions
          onCopyFour={onCopyFour}
          onDuplicate={onDuplicate}
          onCopy={onCopy}
          onPaste={onPaste}
          onRemove={onRemove}
          canPaste={canPaste}
          isOnly={isOnly}
        />
        {/* Top gradient accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.1mm]"
          style={{
            background:
              "linear-gradient(90deg,#3C4CA0 0%,#7A2E8C 33%,#B5306E 60%,#E15A2E 100%)",
          }}
        />

        {/* Logo — trimmed down to make room for larger address text */}
        <div className="flex justify-center items-center pt-[1.8mm] pb-[1mm]">
          <img
            src={logo}
            alt="1A HK International"
            className="h-[18mm] w-auto block"
          />
        </div>

        {/* Gold divider */}
        <div
          className="h-[0.5pt] mb-[1.8mm]"
          style={{
            background:
              "linear-gradient(90deg,rgba(199,154,70,0) 0%,#C79A46 20%,#C79A46 80%,rgba(199,154,70,0) 100%)",
          }}
        />

        {/* TO header + action buttons */}
        <div className="flex items-center gap-[1.6mm] mb-[1.3mm]">
          <PinIcon className="w-[4.2mm] h-[4.2mm]" color="#3C4CA0" />
          <span className="text-[8.4pt] font-extrabold tracking-[1.6px] text-[#3C4CA0]">
            TO
          </span>
          <span className="flex-1 border-t border-[#C9CDD6] ml-[1.2mm]" />
        </div>

        {/* TO fields — postal format: Name / Address Line 1 / Address
            Line 2 / PIN Code / Mobile No, all in larger, easy-to-read type */}
        <div className="mb-[1.8mm]">
          <FieldInput
            label="Name"
            value={label.to.name}
            onChange={(v) => onToChange("name", v)}
            placeholder="Recipient's full name"
          />
          <FieldInput
            label="Address Line 1"
            value={label.to.addressLine1}
            onChange={(v) => onToChange("addressLine1", v)}
            placeholder="House no. / Street / Area"
          />
          <FieldInput
            label="Address Line 2"
            value={label.to.addressLine2}
            onChange={(v) => onToChange("addressLine2", v)}
            placeholder="City / State / Country"
          />
          <FieldInput
            label="PIN Code"
            value={label.to.pincode}
            onChange={(v) => onToChange("pincode", v)}
            placeholder="6-digit PIN code"
          />
          <FieldInput
            label="Mobile No."
            value={label.to.mobile}
            onChange={(v) => onToChange("mobile", v)}
            placeholder="10-digit mobile number"
          />
        </div>

        {/* FROM header */}
        <div className="flex items-center gap-[1.6mm]">
          <BuildingIcon className="w-[4.2mm] h-[4.2mm]" color="#7A2E8C" />
          <span className="text-[8.4pt] font-extrabold tracking-[1.6px] text-[#7A2E8C]">
            FROM
          </span>
          <span className="flex-1 border-t border-[#C9CDD6] ml-[1.2mm]" />
        </div>

        {/* FROM block — sender name/address/mobile in larger, easy-to-read type */}
        <div className="bg-[#FAF9F6] border-[0.5pt] border-[#ECE7DA] rounded-[2mm] p-[2mm_3mm_2mm_3mm] mb-[1.8mm]">
          <input
            value={label.from.name}
            onChange={(e) => onFromChange("name", e.target.value)}
            className="w-full text-[9.6pt] font-extrabold text-[#1E2230] bg-transparent outline-none border-0 focus:bg-[#7A2E8C]/5 rounded-[1mm]"
          />
          <input
            value={label.from.line1}
            onChange={(e) => onFromChange("line1", e.target.value)}
            className="w-full text-[8.8pt] text-[#333844] bg-transparent outline-none border-0 leading-[1.4] focus:bg-[#7A2E8C]/5 rounded-[1mm]"
          />
          <input
            value={label.from.line2}
            onChange={(e) => onFromChange("line2", e.target.value)}
            className="w-full text-[8.8pt] text-[#333844] bg-transparent outline-none border-0 leading-[1.4] focus:bg-[#7A2E8C]/5 rounded-[1mm]"
          />
          <div className="flex items-center gap-[1mm] text-[8.6pt] text-[#333844]">
            <span className="text-slate-500 font-bold whitespace-nowrap">
              Mob:
            </span>
            <input
              value={label.from.mobile}
              onChange={(e) => onFromChange("mobile", e.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none border-0 focus:bg-[#7A2E8C]/5 rounded-[1mm]"
            />
          </div>
          <div className="flex items-center gap-[1mm] text-[8.6pt] text-[#333844]">
            <span className="text-slate-500 font-bold whitespace-nowrap">
              Email:
            </span>
            <input
              value={label.from.email}
              onChange={(e) => onFromChange("email", e.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none border-0 focus:bg-[#7A2E8C]/5 rounded-[1mm]"
            />
          </div>
          <div className="flex items-center gap-[1mm] text-[8.6pt]">
            <span className="text-slate-500 font-bold whitespace-nowrap">
              Web:
            </span>
            <input
              value={label.from.website}
              onChange={(e) => onFromChange("website", e.target.value)}
              className="flex-1 min-w-0 bg-transparent outline-none border-0 text-[#3C4CA0] font-bold focus:bg-[#7A2E8C]/5 rounded-[1mm]"
            />
          </div>
        </div>

        {/* Warning banner — trimmed down (smaller icon/type/padding) to
            offset the extra space used by the larger address text above */}
        <div className="mt-auto border border-[#C81E2C] rounded-[2mm] bg-[#FFF6F6] p-[1.6mm_2.2mm_1.6mm_2.2mm] flex items-center gap-[1.6mm]">
          <ShieldIcon className="w-[6mm] h-[6mm] shrink-0" color="#C81E2C" />
          <div className="flex-1 min-w-0">
            <input
              value={label.bend}
              onChange={(e) => onWarnChange("bend", e.target.value)}
              className="w-full text-[10pt] font-black tracking-[0.6px] text-[#C81E2C] bg-transparent outline-none border-0 leading-tight mb-[0.5mm] focus:bg-[#C81E2C]/5 rounded-[1mm]"
            />
            <input
              value={label.subLine1}
              onChange={(e) => onWarnChange("subLine1", e.target.value)}
              className="w-full text-[5.6pt] font-bold tracking-[0.3px] text-[#7A2129] uppercase bg-transparent outline-none border-0 leading-[1.35] focus:bg-[#C81E2C]/5 rounded-[1mm]"
            />
            <input
              value={label.subLine2}
              onChange={(e) => onWarnChange("subLine2", e.target.value)}
              className="w-full text-[5.6pt] font-bold tracking-[0.3px] text-[#7A2129] uppercase bg-transparent outline-none border-0 leading-[1.35] focus:bg-[#C81E2C]/5 rounded-[1mm]"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

/* ============================================================================
   SHEET
   One A4 page containing up to LABELS_PER_SHEET (4) labels.
   Receives a flat slice of the labels array and the absolute start index.
============================================================================ */

const Sheet = React.memo(function Sheet({
  labels,
  sheetIndex,
  totalSheets,
  startIndex,
  onUpdate,
  onRemoveSheet,
  onCopyFour,
  onDuplicate,
  onCopy,
  onPaste,
  onRemoveLabel,
  canPaste,
  totalLabels,
}) {
  const isLast = sheetIndex === totalSheets - 1;

  return (
    <div className="max-w-[210mm] mx-auto my-4 print:my-0 print:max-w-none">
      {/* Screen-only sheet header */}
      <div className="flex items-center justify-between max-w-[210mm] mx-auto mb-1.5 px-1 print:hidden">
        <div className="text-[11.5px] font-extrabold text-slate-500 tracking-wide">
          Sheet <span className="text-[#3C4CA0]">{sheetIndex + 1}</span>{" "}
          <span className="text-slate-400 font-medium">
            · A4 · {labels.length} label{labels.length !== 1 ? "s" : ""}
          </span>
        </div>
        {totalSheets > 1 && (
          <button
            type="button"
            onClick={onRemoveSheet}
            title="Remove all labels on this sheet"
            className="w-6.5 h-6.5 inline-flex items-center justify-center rounded-md border border-slate-200
                       text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Physical A4 sheet — exact 210mm × 297mm, 2×2 grid */}
      <div
        className="relative bg-white shadow-lg print:shadow-none"
        style={{
          width: "210mm",
          height: "297mm",
          display: "grid",
          gridTemplateColumns: "105mm 105mm",
          gridTemplateRows: "148.5mm 148.5mm",
          breakInside: "avoid",
          pageBreakInside: "avoid",
          breakAfter: isLast ? "auto" : "page",
          pageBreakAfter: isLast ? "auto" : "always",
        }}
      >
        {/* Dotted cut guides */}
        <div className="absolute inset-y-0 left-1/2 border-l-[0.35mm] border-dotted border-[#A9AEBA] pointer-events-none z-[5]" />
        <div className="absolute inset-x-0 top-1/2 border-t-[0.35mm] border-dotted border-[#A9AEBA] pointer-events-none z-[5]" />

        {labels.map((label, localIndex) => {
          const globalIndex = startIndex + localIndex;
          return (
            <AddressLabel
              key={label.id}
              label={label}
              onToChange={(k, v) => onUpdate(globalIndex, "to", k, v)}
              onFromChange={(k, v) => onUpdate(globalIndex, "from", k, v)}
              onWarnChange={(k, v) => onUpdate(globalIndex, "warn", k, v)}
              onCopyFour={() => onCopyFour(sheetIndex, localIndex)}
              onDuplicate={() => onDuplicate(globalIndex)}
              onCopy={() => onCopy(globalIndex)}
              onPaste={() => onPaste(globalIndex)}
              onRemove={() => onRemoveLabel(globalIndex)}
              canPaste={canPaste}
              isOnly={totalLabels === 1}
            />
          );
        })}

        {/* Empty placeholder cells (when a sheet has fewer than 4 labels) */}
        {Array.from({ length: LABELS_PER_SHEET - labels.length }).map(
          (_, i) => (
            <div key={`empty-${i}`} className="p-[5mm]">
              <div className="w-full h-full border-[0.5pt] border-dashed border-[#D7D2C4] rounded-[4mm] bg-[#FAFAFA] flex items-center justify-center print:border-transparent print:bg-white">
                <span className="text-[9px] text-slate-300 print:hidden">
                  empty slot
                </span>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
});

/* ============================================================================
   DEFAULT SENDER PANEL
   Lets the user set sender details once and push them to all labels.
============================================================================ */

const SenderPanel = React.memo(function SenderPanel({
  sender,
  onChange,
  onApplyAll,
}) {
  const field = (key, placeholder, colSpan = "") => (
    <input
      value={sender[key]}
      onChange={(e) => onChange(key, e.target.value)}
      placeholder={placeholder}
      className={`${colSpan} text-[12px] border border-slate-200 rounded px-2 py-1 outline-none focus:border-[#7A2E8C]`}
    />
  );

  return (
    <div className="max-w-[200mm] h-60 mx-auto mt-3 px-3.5 py-3 bg-linear-to-r from-indigo-400 to-orange-300 border border-slate-200 rounded-lg print:hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-extrabold text-[#7A2E8C]">
          Default Sender (used for new labels &amp; sheets)
        </span>
        <button
          type="button"
          onClick={onApplyAll}
          className="text-[11px] font-bold text-[#7A2E8C] hover:underline"
        >
          Apply to all existing labels →
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {field("name", "Sender name", "col-span-2")}
        {field("line1", "Address line 1", "col-span-2")}
        {field("line2", "Address line 2 / City / State / PIN", "col-span-2")}
        {field("mobile", "Mobile")}
        {field("email", "Email")}
        {field("website", "Website", "col-span-2")}
      </div>
    </div>
  );
});

/* ============================================================================
   TOOLBAR
   Sticky top bar with all global actions.
============================================================================ */

const Toolbar = React.memo(function Toolbar({
  onAddLabel,
  onAddSheet,
  onPrint,
  onClearAll,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  labelCount,
  sheetCount,
}) {
  return (
    <div className="sticky top-0 z-[100] flex flex-wrap items-center justify-center gap-2 px-3.5 py-2.5 bg-white border-b border-slate-200 shadow-sm print:hidden">
      <div className="text-[13px] font-extrabold text-[#1E2230] mr-2.5">
        1A HK International
        <small className="block font-medium text-slate-500 text-[10.5px]">
          {labelCount} label{labelCount !== 1 ? "s" : ""} · {sheetCount} sheet
          {sheetCount !== 1 ? "s" : ""}
        </small>
      </div>

      {/* Add single label */}
      <button
        type="button"
        onClick={onAddLabel}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#3C4CA0] hover:bg-[#33408C] text-white text-[12.5px] font-bold px-3.5 py-2"
      >
        <PlusIcon className="w-3.5 h-3.5" /> Add Label
      </button>

      {/* Add full sheet (4 blank labels) */}
      <button
        type="button"
        onClick={onAddSheet}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#3C4CA0] hover:bg-[#33408C] text-white text-[12.5px] font-bold px-3.5 py-2"
      >
        <PlusIcon className="w-3.5 h-3.5" /> Add Sheet (4)
      </button>

      {/* Print */}
      <button
        type="button"
        onClick={onPrint}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#C81E2C] hover:bg-[#A9101D] text-white text-[12.5px] font-bold px-3.5 py-2"
      >
        <PrinterIcon className="w-3.5 h-3.5" /> Print All
      </button>

      {/* Undo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="inline-flex items-center gap-1 rounded-md text-[12.5px] font-bold px-3 py-2
                   text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <UndoIcon className="w-4 h-4" />
      </button>

      {/* Redo */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="inline-flex items-center gap-1 rounded-md text-[12.5px] font-bold px-3 py-2
                   text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <RedoIcon className="w-4 h-4" />
      </button>

      {/* Clear all TO fields */}
      <button
        type="button"
        onClick={onClearAll}
        className="rounded-md text-[12.5px] font-bold px-3.5 py-2 text-slate-500 hover:bg-slate-100 hover:text-[#1E2230]"
      >
        Clear All Fields
      </button>
    </div>
  );
});

/* ============================================================================
   ROOT COMPONENT — AddressLabelSheet
   
   State model:
     labels  — flat array of all label objects (single source of truth)
     sender  — default sender details for new labels
     clipboard — a single copied label object (null if empty)

   Sheets are always *derived* from `labels` via chunkIntoSheets().
   Add/remove/duplicate operations mutate `labels`; sheets auto-adjust.
============================================================================ */

export default function AddressLabelSheet() {
  /* ── Sender state (not part of undo history) ─────────────────────────── */
  const [sender, setSender] = useState({ ...DEFAULT_SENDER });

  /* ── Clipboard state (not undoable — intentional) ────────────────────── */
  const [clipboard, setClipboard] = useState(null);

  /* ── Labels — undoable source of truth ───────────────────────────────── */
  const [labels, setLabels, undo, redo, canUndo, canRedo] = useUndoable([
    makeLabel(DEFAULT_SENDER),
    makeLabel(DEFAULT_SENDER),
    makeLabel(DEFAULT_SENDER),
    makeLabel(DEFAULT_SENDER),
  ]);

  /* ── Derived: sheets (memoised, recomputed only when labels changes) ─── */
  const sheets = useMemo(() => chunkIntoSheets(labels), [labels]);

  /* ── Keyboard shortcuts for undo/redo ────────────────────────────────── */
  React.useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  /* ── Label mutations ─────────────────────────────────────────────────── */

  /** Add a single blank label at the end */
  const handleAddLabel = useCallback(() => {
    setLabels((prev) => [...prev, makeLabel(sender)]);
  }, [setLabels, sender]);

  /** Add 4 blank labels (a full sheet's worth) */
  const handleAddSheet = useCallback(() => {
    setLabels((prev) => [
      ...prev,
      makeLabel(sender),
      makeLabel(sender),
      makeLabel(sender),
      makeLabel(sender),
    ]);
  }, [setLabels, sender]);

  /** Remove a single label by its global index */
  const handleRemoveLabel = useCallback(
    (globalIndex) => {
      setLabels((prev) => {
        if (prev.length <= 1) return prev; // always keep at least 1
        return prev.filter((_, i) => i !== globalIndex);
      });
    },
    [setLabels],
  );

  /** Remove all labels that belong to a given sheet */
  const handleRemoveSheet = useCallback(
    (sheetIndex) => {
      setLabels((prev) => {
        const start = sheetIndex * LABELS_PER_SHEET;
        const end = start + LABELS_PER_SHEET;
        const next = prev.filter((_, i) => i < start || i >= end);
        return next.length ? next : prev; // don't allow zero labels
      });
    },
    [setLabels],
  );

  /** Duplicate a label — insert a copy immediately after the original */
  const handleDuplicate = useCallback(
    (globalIndex) => {
      setLabels((prev) => {
        const source = prev[globalIndex];
        const copy = {
          ...source,
          id: nextId(),
          to: { ...source.to },
          from: { ...source.from },
        };
        const next = [...prev];
        next.splice(globalIndex + 1, 0, copy);
        return next;
      });
    },
    [setLabels],
  );

  /** Copy ×4 — fill the other 3 slots on the same sheet from one source */
  const handleCopyFour = useCallback(
    (sheetIndex, localIndex) => {
      setLabels((prev) => {
        const start = sheetIndex * LABELS_PER_SHEET;
        const source = prev[start + localIndex];
        return prev.map((lab, i) => {
          const isOnThisSheet = i >= start && i < start + LABELS_PER_SHEET;
          const isSelf = i === start + localIndex;
          if (!isOnThisSheet || isSelf) return lab;
          return {
            ...source,
            id: nextId(),
            to: { ...source.to },
            from: { ...source.from },
          };
        });
      });
    },
    [setLabels],
  );

  /** Store a label in the clipboard (does not remove the original) */
  const handleCopy = useCallback(
    (globalIndex) => {
      setClipboard((prev) => {
        const source = labels[globalIndex];
        return { ...source, to: { ...source.to }, from: { ...source.from } };
      });
    },
    [labels],
  );

  /** Paste clipboard label at a position (replaces the target label's content) */
  const handlePaste = useCallback(
    (globalIndex) => {
      if (!clipboard) return;
      setLabels((prev) =>
        prev.map((lab, i) =>
          i === globalIndex
            ? { ...clipboard, id: lab.id } // keep original id, replace all content
            : lab,
        ),
      );
    },
    [setLabels, clipboard],
  );

  /** Update a single field on a single label */
  const handleUpdateField = useCallback(
    (globalIndex, section, key, value) => {
      setLabels((prev) =>
        prev.map((lab, i) => {
          if (i !== globalIndex) return lab;
          if (section === "to")
            return { ...lab, to: { ...lab.to, [key]: value } };
          if (section === "from")
            return { ...lab, from: { ...lab.from, [key]: value } };
          if (section === "warn") return { ...lab, [key]: value };
          return lab;
        }),
      );
    },
    [setLabels],
  );

  /* ── Sender panel handlers ───────────────────────────────────────────── */

  const handleSenderChange = useCallback((key, value) => {
    setSender((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Push current sender details to every label's FROM section */
  const handleApplySenderToAll = useCallback(() => {
    setLabels((prev) => prev.map((lab) => ({ ...lab, from: { ...sender } })));
  }, [setLabels, sender]);

  /* ── Global bulk actions ─────────────────────────────────────────────── */

  const handleClearAll = useCallback(() => {
    if (
      !window.confirm(
        'Clear all "TO" address fields? Sender details will be kept.',
      )
    )
      return;
    setLabels((prev) => prev.map((l) => ({ ...l, to: blankTo() })));
  }, [setLabels]);

  const handlePrint = useCallback(() => window.print(), []);

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen print:min-h-0 bg-[#EDEEF1] print:bg-white">
      {/* @page rule — ensures correct A4 sizing on print */}
      <style>{`
        @page { size: 210mm 297mm; margin: 0; }
        @media print {
          html, body, #root {
            margin: 0 !important;
            padding: 0 !important;
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }
        }
      `}</style>

      {/* Sticky toolbar */}
      <Toolbar
        onAddLabel={handleAddLabel}
        onAddSheet={handleAddSheet}
        onPrint={handlePrint}
        onClearAll={handleClearAll}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        labelCount={labels.length}
        sheetCount={sheets.length}
      />

      {/* Default sender panel */}
      <SenderPanel
        sender={sender}
        onChange={handleSenderChange}
        onApplyAll={handleApplySenderToAll}
      />

      {/* Hint bar */}
      <div className="max-w-[210mm] mx-auto mt-2 px-3.5 py-2 bg-[#FFF7E8] border border-[#F0DDAE] rounded-lg text-[11.5px] text-[#7A5A16] text-center print:hidden">
        <b className="text-[#5C4310]">Click any field to type directly.</b>{" "}
        The recipient address now follows a postal format —{" "}
        <b>Address Line 1</b>, <b>Address Line 2</b>, and a separate{" "}
        <b>PIN Code</b>. Use <b>Add Label</b> for a single label or{" "}
        <b>Add Sheet</b> for 4 at once. Labels auto-paginate into A4 sheets
        (4 per page). <b>Ctrl+Z</b> / <b>Ctrl+Y</b> to undo/redo.
      </div>

      {/* Auto-paginated sheets */}
      <div className="pt-3.5 pb-14 print:p-0">
        {sheets.map((sheetLabels, sheetIndex) => (
          <Sheet
            key={sheetIndex}
            labels={sheetLabels}
            sheetIndex={sheetIndex}
            totalSheets={sheets.length}
            startIndex={sheetIndex * LABELS_PER_SHEET}
            onUpdate={handleUpdateField}
            onRemoveSheet={() => handleRemoveSheet(sheetIndex)}
            onCopyFour={handleCopyFour}
            onDuplicate={handleDuplicate}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onRemoveLabel={handleRemoveLabel}
            canPaste={!!clipboard}
            totalLabels={labels.length}
          />
        ))}
      </div>
    </div>
  );
}