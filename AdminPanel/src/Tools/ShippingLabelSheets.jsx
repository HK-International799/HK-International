

// import React, { useRef, useState, useCallback, useMemo } from "react";
// const logo = "/hk_logo.png";

// /* ============================================================================
//    CONSTANTS & DEFAULTS
// ============================================================================ */

// const LABELS_PER_SHEET = 4;

// const DEFAULT_SENDER = {
//   name: "1A HK International — c/o Anurag Pandey",
//   line1: "BN House, New Colony, Kakarmatta, BLW",
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
//  * Postal format: Name, Address Line 1, Address Line 2, PIN Code, Mobile No —
//  * instead of a single free-text address blob. Matches standard courier /
//  * postal address layout and keeps each part easy to read at a glance.
//  */
// const blankTo = () => ({
//   name: "",
//   addressLine1: "",
//   addressLine2: "",
//   pincode: "",
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
//    Used for every TO field (Name / Address Line 1 / Address Line 2 /
//    PIN Code / Mobile No). Text size bumped up for readability.
// ============================================================================ */

// const FieldInput = React.memo(function FieldInput({ label, value, onChange, placeholder }) {
//   return (
//     <div className="flex items-baseline gap-[1.4mm] mb-[1.25mm] leading-none">
//       <span className="text-[6.4pt] font-bold tracking-[0.4px] text-slate-500 uppercase whitespace-nowrap">
//         {label}
//       </span>
//       <input
//         type="text"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className="flex-1 min-w-[6mm] h-[4mm] text-[9.2pt] font-medium text-[#1E2230] bg-transparent border-0
//                    border-b border-dotted border-[#A9AEBA] focus:border-solid focus:border-[#3C4CA0]
//                    focus:bg-[#3C4CA0]/5 outline-none px-0 py-0 rounded-none placeholder:text-slate-300"
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
//    TO section is postal format: Name, Address Line 1, Address Line 2,
//    PIN Code, Mobile No. All field callbacks are memoised at the parent level.
//    Logo and the "DO NOT BEND" banner have been trimmed down so the larger
//    address/phone text still fits cleanly on the label.
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
//                    p-[4mm_5.5mm_3.5mm_5.5mm] flex flex-col bg-white overflow-hidden break-inside-avoid"
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

//         {/* Logo — trimmed down to make room for larger address text */}
//         <div className="flex justify-center items-center pt-[1.8mm] pb-[1mm]">
//           <img
//             src={logo}
//             alt="1A HK International"
//             className="h-[18mm] w-auto block"
//           />
//         </div>

//         {/* Gold divider */}
//         <div
//           className="h-[0.5pt] mb-[1.8mm]"
//           style={{
//             background:
//               "linear-gradient(90deg,rgba(199,154,70,0) 0%,#C79A46 20%,#C79A46 80%,rgba(199,154,70,0) 100%)",
//           }}
//         />

//         {/* TO header + action buttons */}
//         <div className="flex items-center gap-[1.6mm] mb-[1.3mm]">
//           <PinIcon className="w-[4.2mm] h-[4.2mm]" color="#3C4CA0" />
//           <span className="text-[8.4pt] font-extrabold tracking-[1.6px] text-[#3C4CA0]">
//             TO
//           </span>
//           <span className="flex-1 border-t border-[#C9CDD6] ml-[1.2mm]" />
//         </div>

//         {/* TO fields — postal format: Name / Address Line 1 / Address
//             Line 2 / PIN Code / Mobile No, all in larger, easy-to-read type */}
//         <div className="mb-[1.8mm]">
//           <FieldInput
//             label="Name"
//             value={label.to.name}
//             onChange={(v) => onToChange("name", v)}
//             placeholder="Recipient's full name"
//           />
//           <FieldInput
//             label="Address Line 1"
//             value={label.to.addressLine1}
//             onChange={(v) => onToChange("addressLine1", v)}
//             placeholder="House no. / Street / Area"
//           />
//           <FieldInput
//             label="Address Line 2"
//             value={label.to.addressLine2}
//             onChange={(v) => onToChange("addressLine2", v)}
//             placeholder="City / State / Country"
//           />
//           <FieldInput
//             label="PIN Code"
//             value={label.to.pincode}
//             onChange={(v) => onToChange("pincode", v)}
//             placeholder="6-digit PIN code"
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

//         {/* FROM block — sender name/address/mobile in larger, easy-to-read type */}
//         <div className="bg-[#FAF9F6] border-[0.5pt] border-[#ECE7DA] rounded-[2mm] p-[2mm_3mm_2mm_3mm] mb-[1.8mm]">
//           <input
//             value={label.from.name}
//             onChange={(e) => onFromChange("name", e.target.value)}
//             className="w-full text-[9.6pt] font-extrabold text-[#1E2230] bg-transparent outline-none border-0 focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//           />
//           <input
//             value={label.from.line1}
//             onChange={(e) => onFromChange("line1", e.target.value)}
//             className="w-full text-[8.8pt] text-[#333844] bg-transparent outline-none border-0 leading-[1.4] focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//           />
//           <input
//             value={label.from.line2}
//             onChange={(e) => onFromChange("line2", e.target.value)}
//             className="w-full text-[8.8pt] text-[#333844] bg-transparent outline-none border-0 leading-[1.4] focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//           />
//           <div className="flex items-center gap-[1mm] text-[8.6pt] text-[#333844]">
//             <span className="text-slate-500 font-bold whitespace-nowrap">
//               Mob:
//             </span>
//             <input
//               value={label.from.mobile}
//               onChange={(e) => onFromChange("mobile", e.target.value)}
//               className="flex-1 min-w-0 bg-transparent outline-none border-0 focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//             />
//           </div>
//           <div className="flex items-center gap-[1mm] text-[8.6pt] text-[#333844]">
//             <span className="text-slate-500 font-bold whitespace-nowrap">
//               Email:
//             </span>
//             <input
//               value={label.from.email}
//               onChange={(e) => onFromChange("email", e.target.value)}
//               className="flex-1 min-w-0 bg-transparent outline-none border-0 focus:bg-[#7A2E8C]/5 rounded-[1mm]"
//             />
//           </div>
//           <div className="flex items-center gap-[1mm] text-[8.6pt]">
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

//         {/* Warning banner — trimmed down (smaller icon/type/padding) to
//             offset the extra space used by the larger address text above */}
//         <div className="mt-auto border border-[#C81E2C] rounded-[2mm] bg-[#FFF6F6] p-[1.6mm_2.2mm_1.6mm_2.2mm] flex items-center gap-[1.6mm]">
//           <ShieldIcon className="w-[6mm] h-[6mm] shrink-0" color="#C81E2C" />
//           <div className="flex-1 min-w-0">
//             <input
//               value={label.bend}
//               onChange={(e) => onWarnChange("bend", e.target.value)}
//               className="w-full text-[10pt] font-black tracking-[0.6px] text-[#C81E2C] bg-transparent outline-none border-0 leading-tight mb-[0.5mm] focus:bg-[#C81E2C]/5 rounded-[1mm]"
//             />
//             <input
//               value={label.subLine1}
//               onChange={(e) => onWarnChange("subLine1", e.target.value)}
//               className="w-full text-[5.6pt] font-bold tracking-[0.3px] text-[#7A2129] uppercase bg-transparent outline-none border-0 leading-[1.35] focus:bg-[#C81E2C]/5 rounded-[1mm]"
//             />
//             <input
//               value={label.subLine2}
//               onChange={(e) => onWarnChange("subLine2", e.target.value)}
//               className="w-full text-[5.6pt] font-bold tracking-[0.3px] text-[#7A2129] uppercase bg-transparent outline-none border-0 leading-[1.35] focus:bg-[#C81E2C]/5 rounded-[1mm]"
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
//         <b className="text-[#5C4310]">Click any field to type directly.</b>{" "}
//         The recipient address now follows a postal format —{" "}
//         <b>Address Line 1</b>, <b>Address Line 2</b>, and a separate{" "}
//         <b>PIN Code</b>. Use <b>Add Label</b> for a single label or{" "}
//         <b>Add Sheet</b> for 4 at once. Labels auto-paginate into A4 sheets
//         (4 per page). <b>Ctrl+Z</b> / <b>Ctrl+Y</b> to undo/redo.
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
import AdminLayout from "../components/layout/AdminLayout";
import { searchLabelLearners } from "../services/labelPrinterService";
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
   AUTO MODE — labels generated from learner registration information
   ----------------------------------------------------------------------------
   An auto label is an ordinary label (same TO / FROM / warning fields, same
   editing, undo/redo, print and pagination) plus:
     source: "auto"
     learnerId: the learner it was generated from
     auto: { name, email, original, missing[], legacy }  — screen-only info
   Editing it only changes this label, never the learner's record. The set
   of "selected learners" is DERIVED from the labels array, so undo/redo,
   delete, paste and Copy ×4 can never get out of sync with the picker.
============================================================================ */

const cleanPart = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
const joinParts = (...parts) => parts.map(cleanPart).filter(Boolean).join(", ");

/** Which TO field each missing-data warning refers to. */
const MISSING_FIELD = {
  "Learner name": "name",
  "Address line (house / street)": "addressLine1",
  City: "addressLine2",
  Country: "addressLine2",
  "PIN / postal code": "pincode",
  "Mobile number (omitted from the label)": "mobile",
};

/**
 * Maps a learner's stored registration address onto the Label Printer's
 * existing postal format — Name / Address Line 1 (House no. / Street /
 * Area) / Address Line 2 (City / State / Country) / PIN Code / Mobile No.
 */
const learnerToLabelTo = (l) => {
  const structuredLine1 = joinParts(l.addressLine1, l.addressLine2);
  const legacy = cleanPart(String(l.address || "").replace(/\s*\n\s*/g, ", "));
  const usesLegacy = !structuredLine1 && Boolean(legacy);
  const mobile = cleanPart(l.mobile);
  return {
    to: {
      name: cleanPart(l.fullName),
      addressLine1: structuredLine1 || legacy,
      addressLine2: joinParts(l.city, l.state, l.country),
      pincode: cleanPart(l.postalCode),
      // Stored mobile, prefixed with the stored country code (same
      // "+91 98765…" convention the registration emails use).
      mobile: mobile
        ? [mobile.startsWith("+") ? "" : cleanPart(l.countryCode), mobile]
            .filter(Boolean)
            .join(" ")
        : "",
    },
    usesLegacy,
    missing: [
      !cleanPart(l.fullName) && "Learner name",
      !structuredLine1 && !legacy && "Address line (house / street)",
      !cleanPart(l.city) && !usesLegacy && "City",
      !cleanPart(l.country) && !usesLegacy && "Country",
      !cleanPart(l.postalCode) && "PIN / postal code",
      !mobile && "Mobile number (omitted from the label)",
    ].filter(Boolean),
  };
};

const makeAutoLabel = (learner, senderSnap) => {
  const { to, missing, usesLegacy } = learnerToLabelTo(learner);
  return {
    ...makeLabel(senderSnap),
    to,
    source: "auto",
    learnerId: String(learner._id),
    auto: {
      name: to.name || learner.email || "Learner",
      email: learner.email || "",
      original: { ...to },
      missing,
      legacy: usesLegacy,
    },
  };
};

/** Warnings still relevant for an auto label (fixed fields drop off). */
const getAutoWarnings = (label) => {
  if (label?.source !== "auto" || !label.auto) return [];
  const { original, missing, legacy } = label.auto;
  const out = missing.filter((m) => {
    const key = MISSING_FIELD[m];
    return !key || !label.to[key] || label.to[key] === original[key];
  });
  if (legacy && label.to.addressLine1 === original.addressLine1) {
    out.push("Address stored as a single line — check lines & PIN");
  }
  return out;
};

const isAutoEdited = (label) =>
  label?.source === "auto" &&
  Object.keys(label.to).some((k) => label.to[k] !== label.auto?.original?.[k]);

/** Strips the learner link (copies / pastes / clears become manual). */
const toManual = (label) => {
  const { source: _s, learnerId: _l, auto: _a, ...rest } = label;
  return rest;
};

/** A label nobody has typed into yet — safe slot for an auto label. */
const isPristineManual = (label) =>
  label.source !== "auto" && Object.values(label.to).every((v) => !String(v).trim());

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

const FieldInput = React.memo(function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  rowClassName = "",
  inputClassName = "",
}) {
  return (
    <div className={`flex items-baseline gap-[1.4mm] mb-[1.25mm] leading-none ${rowClassName}`}>
      <span className="text-[6.4pt] font-bold tracking-[0.4px] text-slate-500 uppercase whitespace-nowrap">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 min-w-[6mm] h-[4mm] text-[9.2pt] font-medium text-[#1E2230] bg-transparent border-0
                   border-b border-dotted border-[#A9AEBA] focus:border-solid focus:border-[#3C4CA0]
                   focus:bg-[#3C4CA0]/5 outline-none px-0 py-0 rounded-none placeholder:text-slate-300 ${inputClassName}`}
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
  globalIndex,
  sheetIndex,
  localIndex,
  onUpdate,
  onCopyFour: copyFour,
  onDuplicate: duplicate,
  onCopy: copy,
  onPaste: paste,
  onRemoveLabel,
  canPaste,
  isOnly,
}) {
  // Handlers are built here from stable parent callbacks so React.memo can
  // skip every label that didn't change (keeps big batches responsive).
  const onToChange = (k, v) => onUpdate(globalIndex, "to", k, v);
  const onFromChange = (k, v) => onUpdate(globalIndex, "from", k, v);
  const onWarnChange = (k, v) => onUpdate(globalIndex, "warn", k, v);
  const onCopyFour = () => copyFour(sheetIndex, localIndex);
  const onDuplicate = () => duplicate(globalIndex);
  const onCopy = () => copy(globalIndex);
  const onPaste = () => paste(globalIndex);
  const onRemove = () => onRemoveLabel(globalIndex);

  const isAuto = label.source === "auto";
  const autoWarnings = isAuto ? getAutoWarnings(label) : [];
  // Auto labels: never print placeholder hints, and omit an empty mobile row.
  const autoInput = isAuto ? "print:placeholder:text-transparent" : "";

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

        {/* Auto-label markers — screen only, never printed */}
        {isAuto && (
          <div className="print:hidden absolute top-[5mm] left-[3mm] right-[3mm] z-10 flex justify-between items-start gap-1 pointer-events-none">
            <span
              className="pointer-events-auto max-w-[24mm] truncate rounded bg-[#3C4CA0] text-white text-[7px] font-bold px-1.5 py-0.5"
              title={`Generated from ${label.auto?.name}'s registration${label.auto?.email ? ` (${label.auto.email})` : ""}. Editing this label does not change the learner's record.`}
            >
              AUTO{isAutoEdited(label) ? " · EDITED" : ""}
            </span>
            {autoWarnings.length > 0 && (
              <span
                className="pointer-events-auto max-w-[30mm] rounded border border-amber-300 bg-amber-50 text-amber-800 text-[7px] font-bold px-1.5 py-0.5 leading-tight"
                title={`Missing or unverified: ${autoWarnings.join("; ")}`}
              >
                ⚠ {autoWarnings.length === 1 ? autoWarnings[0] : `${autoWarnings.length} address issues`}
              </span>
            )}
          </div>
        )}

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
            inputClassName={autoInput}
          />
          <FieldInput
            label="Address Line 1"
            value={label.to.addressLine1}
            onChange={(v) => onToChange("addressLine1", v)}
            placeholder="House no. / Street / Area"
            inputClassName={autoInput}
          />
          <FieldInput
            label="Address Line 2"
            value={label.to.addressLine2}
            onChange={(v) => onToChange("addressLine2", v)}
            placeholder="City / State / Country"
            inputClassName={autoInput}
          />
          <FieldInput
            label="PIN Code"
            value={label.to.pincode}
            onChange={(v) => onToChange("pincode", v)}
            placeholder="6-digit PIN code"
            inputClassName={autoInput}
          />
          <FieldInput
            label="Mobile No."
            value={label.to.mobile}
            onChange={(v) => onToChange("mobile", v)}
            placeholder="10-digit mobile number"
            inputClassName={autoInput}
            rowClassName={isAuto && !label.to.mobile.trim() ? "print:hidden" : ""}
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
              globalIndex={globalIndex}
              sheetIndex={sheetIndex}
              localIndex={localIndex}
              onUpdate={onUpdate}
              onCopyFour={onCopyFour}
              onDuplicate={onDuplicate}
              onCopy={onCopy}
              onPaste={onPaste}
              onRemoveLabel={onRemoveLabel}
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
   MODE SWITCH — Auto (from registrations) / Manual entry
============================================================================ */

const ModeSwitch = React.memo(function ModeSwitch({ mode, onChange, autoCount, manualCount }) {
  const tab = (key, title, sub) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === key}
      onClick={() => onChange(key)}
      className={`flex-1 text-left rounded-lg px-3.5 py-2 border transition ${
        mode === key
          ? "bg-[#3C4CA0] border-[#3C4CA0] text-white shadow-sm"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className="block text-[12.5px] font-extrabold">{title}</span>
      <span className={`block text-[10.5px] ${mode === key ? "text-indigo-100" : "text-slate-400"}`}>{sub}</span>
    </button>
  );
  return (
    <div role="tablist" aria-label="Label entry mode" className="max-w-[210mm] mx-auto mt-3 flex gap-2 print:hidden">
      {tab("auto", "Auto — from learner registrations", `${autoCount} learner label${autoCount !== 1 ? "s" : ""} selected`)}
      {tab("manual", "Manual entry", `${manualCount} manual label${manualCount !== 1 ? "s" : ""}`)}
    </div>
  );
});

/* ============================================================================
   LEARNER PICKER (Auto mode)
   Server-side, paginated, case-insensitive partial search by name, email,
   mobile and registration ID. Learners are never all loaded at once.
============================================================================ */

const PICKER_PAGE_SIZE = 25;
const SELECT_ALL_PAGE_SIZE = 200;
const SELECT_ALL_CAP = 1000;

const learnerWarningsPreview = (l) => learnerToLabelTo(l).missing;

const LearnerPicker = React.memo(function LearnerPicker({
  selectedById,
  onSelect,
  onDeselect,
  onClearAuto,
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkNote, setBulkNote] = useState("");
  const seq = useRef(0);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchPage = useCallback(async (search, pageNo, append) => {
    const mySeq = ++seq.current;
    setLoading(true);
    setError("");
    try {
      const d = await searchLabelLearners({ search, page: pageNo, limit: PICKER_PAGE_SIZE });
      if (mySeq !== seq.current) return;
      setResults((prev) => (append ? [...prev, ...(d?.learners || [])] : d?.learners || []));
      setTotal(d?.total || 0);
      setPage(pageNo);
      setHasMore(Boolean(d?.hasMore));
    } catch (e) {
      if (mySeq !== seq.current) return;
      if (!append) setResults([]);
      setError(
        e?.response?.data?.message ||
          (e?.request && !e?.response ? "Network error — could not reach the server." : "Could not load learners."),
      );
    } finally {
      if (mySeq === seq.current) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setBulkNote("");
    fetchPage(debounced, 1, false);
  }, [debounced, fetchPage]);

  /** Select every learner matching the current search (walks all pages). */
  const selectAllFiltered = async () => {
    if (bulkBusy) return;
    setBulkBusy(true);
    setBulkNote("");
    try {
      const all = [];
      let p = 1;
      let more = true;
      let grandTotal = 0;
      while (more && all.length < SELECT_ALL_CAP) {
        const d = await searchLabelLearners({ search: debounced, page: p, limit: SELECT_ALL_PAGE_SIZE });
        grandTotal = d?.total || 0;
        all.push(...(d?.learners || []));
        more = Boolean(d?.hasMore);
        p += 1;
      }
      const capped = all.slice(0, SELECT_ALL_CAP);
      const fresh = capped.filter((l) => !selectedById.has(String(l._id)));
      onSelect(fresh);
      setBulkNote(
        grandTotal > SELECT_ALL_CAP
          ? `Added ${fresh.length} labels. Only the first ${SELECT_ALL_CAP.toLocaleString()} of ${grandTotal.toLocaleString()} matches can be selected at once — narrow the search for the rest.`
          : `Added ${fresh.length} label${fresh.length !== 1 ? "s" : ""}${capped.length - fresh.length ? ` (${capped.length - fresh.length} already selected)` : ""}.`,
      );
    } catch (e) {
      setBulkNote(e?.response?.data?.message || "Could not select all learners. Please try again.");
    } finally {
      setBulkBusy(false);
    }
  };

  const selectedList = [...selectedById.values()];

  return (
    <div className="max-w-[210mm] mx-auto mt-3 px-3.5 py-3 bg-white border border-slate-200 rounded-lg print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-extrabold text-[#3C4CA0]">
          Select learners — each selected learner becomes one label
        </span>
        <span className="text-[11px] text-slate-500">
          {loading ? "Searching…" : `${total.toLocaleString()} learner${total !== 1 ? "s" : ""}${debounced ? " match" : ""}`}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={100}
            placeholder="Search name, email, mobile or registration ID…"
            aria-label="Search learners"
            className="w-full text-[12.5px] border border-slate-200 rounded-md pl-3 pr-8 py-2 outline-none focus:border-[#3C4CA0] focus:ring-2 focus:ring-[#3C4CA0]/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={selectAllFiltered}
          disabled={bulkBusy || loading || total === 0}
          className="rounded-md bg-[#3C4CA0] hover:bg-[#33408C] text-white text-[12px] font-bold px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Add a label for every learner matching the current search"
        >
          {bulkBusy ? "Selecting…" : `Select all filtered (${Math.min(total, SELECT_ALL_CAP).toLocaleString()})`}
        </button>
        <button
          type="button"
          onClick={onClearAuto}
          disabled={selectedList.length === 0}
          className="rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-[12px] font-bold px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Clear selection
        </button>
      </div>
      {bulkNote && <p className="mt-1.5 text-[11px] text-slate-600">{bulkNote}</p>}

      {/* Results */}
      <div className="mt-2 max-h-72 overflow-y-auto rounded-md border border-slate-100 divide-y divide-slate-100">
        {error ? (
          <div className="flex items-center justify-between gap-2 px-3 py-3 text-[12px] text-red-600">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchPage(debounced, 1, false)}
              className="rounded border border-red-200 px-2 py-1 font-bold hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        ) : !loading && results.length === 0 ? (
          <p className="px-3 py-4 text-center text-[12px] text-slate-400">
            {debounced ? `No learners match “${debounced}”.` : "No learners found."}
          </p>
        ) : (
          results.map((l) => {
            const id = String(l._id);
            const checked = selectedById.has(id);
            const missing = learnerWarningsPreview(l);
            const addressMissing = missing.filter((m) => !m.startsWith("Mobile"));
            return (
              <label
                key={id}
                className={`flex items-start gap-2.5 px-3 py-2 cursor-pointer text-[12px] hover:bg-indigo-50/40 ${checked ? "bg-indigo-50/60" : ""}`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#3C4CA0]"
                  checked={checked}
                  onChange={() => (checked ? onDeselect(id) : onSelect([l]))}
                />
                <span className="flex-1 min-w-0">
                  <span className="font-bold text-[#1E2230]">{l.fullName || l.email || "Unnamed learner"}</span>
                  <span className="block text-slate-500 truncate">
                    {[l.email, l.mobile && [l.countryCode, l.mobile].filter(Boolean).join(" ")].filter(Boolean).join(" · ")}
                  </span>
                  {l.registrations?.length > 0 && (
                    <span className="block text-[10.5px] text-slate-400 truncate">
                      {l.registrations
                        .slice(0, 3)
                        .map((r) => `${r.courseLabel} · Reg …${String(r._id).slice(-6)}`)
                        .join("  |  ")}
                      {l.registrations.length > 3 ? `  +${l.registrations.length - 3} more` : ""}
                    </span>
                  )}
                </span>
                {addressMissing.length > 0 && (
                  <span
                    className="shrink-0 rounded border border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-bold px-1.5 py-0.5"
                    title={`Incomplete address: ${addressMissing.join(", ")}`}
                  >
                    ⚠ Incomplete address
                  </span>
                )}
              </label>
            );
          })
        )}
        {loading && (
          <p className="px-3 py-2.5 text-center text-[12px] text-slate-400">Loading learners…</p>
        )}
      </div>
      {hasMore && !loading && !error && (
        <button
          type="button"
          onClick={() => fetchPage(debounced, page + 1, true)}
          className="mt-2 w-full rounded-md border border-slate-200 text-[12px] font-bold text-[#3C4CA0] py-1.5 hover:bg-slate-50"
        >
          Load more ({results.length.toLocaleString()} of {total.toLocaleString()} shown)
        </button>
      )}

      {/* Selected learners — visible and removable */}
      <div className="mt-3">
        <p className="text-[11px] font-bold text-slate-500 mb-1.5">
          Selected ({selectedList.length.toLocaleString()})
        </p>
        {selectedList.length === 0 ? (
          <p className="text-[11.5px] text-slate-400">
            No learners selected yet. Tick learners above — their labels appear on the sheets below and stay editable.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {selectedList.map((lab) => {
              const warnings = getAutoWarnings(lab);
              return (
                <span
                  key={lab.learnerId}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                    warnings.length ? "border-amber-300 bg-amber-50 text-amber-900" : "border-indigo-200 bg-indigo-50 text-[#3C4CA0]"
                  }`}
                  title={warnings.length ? `Check: ${warnings.join("; ")}` : lab.auto?.email || ""}
                >
                  {warnings.length > 0 && <span aria-hidden>⚠</span>}
                  <span className="max-w-[40mm] truncate">{lab.auto?.name}</span>
                  <button
                    type="button"
                    onClick={() => onDeselect(lab.learnerId)}
                    className="ml-0.5 leading-none hover:text-red-600"
                    aria-label={`Remove ${lab.auto?.name}`}
                    title="Remove this learner's label"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
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

  /* ── Entry mode: "manual" (original behaviour) or "auto" ─────────────── */
  const [mode, setMode] = useState("manual");

  /* ── Derived: selected learners = auto labels (one per learner) ───────── */
  const selectedById = useMemo(() => {
    const m = new Map();
    for (const l of labels) if (l.source === "auto" && l.learnerId) m.set(l.learnerId, l);
    return m;
  }, [labels]);
  const autoCount = selectedById.size;

  // Latest labels for callbacks that only READ them (keeps them stable).
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

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
        // A copy of an auto label is a plain manual label (the learner keeps
        // exactly one linked label, so deselecting removes only that one).
        const copy = toManual({
          ...source,
          id: nextId(),
          to: { ...source.to },
          from: { ...source.from },
        });
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
          return toManual({
            ...source,
            id: nextId(),
            to: { ...source.to },
            from: { ...source.from },
          });
        });
      });
    },
    [setLabels],
  );

  /** Store a label in the clipboard (does not remove the original) */
  const handleCopy = useCallback((globalIndex) => {
    const source = labelsRef.current[globalIndex];
    if (!source) return;
    setClipboard({ ...source, to: { ...source.to }, from: { ...source.from } });
  }, []);

  /** Paste clipboard label at a position (replaces the target label's content) */
  const handlePaste = useCallback(
    (globalIndex) => {
      if (!clipboard) return;
      setLabels((prev) =>
        prev.map((lab, i) =>
          i === globalIndex
            ? { ...toManual(clipboard), id: lab.id } // keep original id, replace all content
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
    setLabels((prev) => prev.map((l) => toManual({ ...l, to: blankTo() })));
  }, [setLabels]);

  /* ── Auto mode: learner selection ────────────────────────────────────── */

  /** Add one label per learner (blank, untouched slots are filled first). */
  const handleSelectLearners = useCallback(
    (learners) => {
      if (!learners?.length) return;
      setLabels((prev) => {
        const have = new Set(prev.filter((l) => l.source === "auto").map((l) => l.learnerId));
        const fresh = learners.filter((l) => !have.has(String(l._id)));
        if (!fresh.length) return prev;
        const next = [...prev];
        let k = 0;
        for (let i = 0; i < next.length && k < fresh.length; i += 1) {
          if (isPristineManual(next[i])) {
            next[i] = { ...makeAutoLabel(fresh[k], sender), id: next[i].id };
            k += 1;
          }
        }
        for (; k < fresh.length; k += 1) next.push(makeAutoLabel(fresh[k], sender));
        return next;
      });
    },
    [setLabels, sender],
  );

  /** Deselecting a learner removes their generated label. */
  const handleDeselectLearner = useCallback(
    (learnerId) => {
      setLabels((prev) => {
        const next = prev.filter((l) => !(l.source === "auto" && l.learnerId === learnerId));
        if (next.length === prev.length) return prev;
        return next.length ? next : [makeLabel(sender)]; // always keep 1 label
      });
    },
    [setLabels, sender],
  );

  const handleClearAuto = useCallback(() => {
    if (!labelsRef.current.some((l) => l.source === "auto")) return;
    if (!window.confirm("Remove all labels generated from learner registrations? Manual labels are kept.")) return;
    setLabels((prev) => {
      const next = prev.filter((l) => l.source !== "auto");
      return next.length ? next : [makeLabel(sender)];
    });
  }, [setLabels, sender]);

  const handlePrint = useCallback(() => window.print(), []);

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <AdminLayout printBare>
    <div className="min-h-screen print:min-h-0 bg-[#EDEEF1] print:bg-white -m-4 md:-m-6 print:m-0">
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

      {/* Auto / Manual switch */}
      <ModeSwitch
        mode={mode}
        onChange={setMode}
        autoCount={autoCount}
        manualCount={labels.length - autoCount}
      />

      {mode === "auto" && (
        <LearnerPicker
          selectedById={selectedById}
          onSelect={handleSelectLearners}
          onDeselect={handleDeselectLearner}
          onClearAuto={handleClearAuto}
        />
      )}

      {/* Default sender panel */}
      <SenderPanel
        sender={sender}
        onChange={handleSenderChange}
        onApplyAll={handleApplySenderToAll}
      />

      {mode === "auto" && (
        <div className="max-w-[210mm] mx-auto mt-2 px-3.5 py-2 bg-[#EEF0FB] border border-[#C9CFEE] rounded-lg text-[11.5px] text-[#2D3878] text-center print:hidden">
          <b>Auto mode:</b> each selected learner's label is filled from their
          registration (name, address, PIN, mobile) in the same postal format.
          Labels stay fully editable — edits never change the learner's record.
          Manual labels can be added at any time with <b>Add Label</b> and are
          printed together. <span className="text-amber-700 font-bold">⚠</span>{" "}
          marks missing address details (shown on screen only, never printed).
        </div>
      )}

      {/* Hint bar */}
      <div className={`max-w-[210mm] mx-auto mt-2 px-3.5 py-2 bg-[#FFF7E8] border border-[#F0DDAE] rounded-lg text-[11.5px] text-[#7A5A16] text-center print:hidden ${mode === "auto" ? "hidden" : ""}`}>
        <b className="text-[#5C4310]">Click any field to type directly.</b>{" "}
        The recipient address now follows a postal format —{" "}
        <b>Address Line 1</b>, <b>Address Line 2</b>, and a separate{" "}
        <b>PIN Code</b>. Use <b>Add Label</b> for a single label or{" "}
        <b>Add Sheet</b> for 4 at once. Labels auto-paginate into A4 sheets
        (4 per page). <b>Ctrl+Z</b> / <b>Ctrl+Y</b> to undo/redo.
      </div>

      {/* Auto-paginated sheets */}
      <div className="pt-3.5 pb-14 print:p-0 overflow-x-auto print:overflow-visible">
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
    </AdminLayout>
  );
}