// /**
//  * DynamicAnswerForm
//  *
//  * Renders a question's formSchema as a live form. Values are managed
//  * by the parent (controlled component) and returned via onChange.
//  *
//  * Props:
//  *   - schema:  Array of field specs (fieldId, label, type, required, options, placeholder)
//  *   - value:   Object map { [fieldId]: value }
//  *   - onChange(nextValue): called whenever any field changes
//  *   - disabled: boolean (true when exam is submitted)
//  */
// export default function DynamicAnswerForm({
//   schema = [],
//   value = {},
//   onChange,
//   disabled = false,
// }) {
//   const setField = (fieldId, newVal) => {
//     onChange?.({ ...value, [fieldId]: newVal });
//   };

//   if (!schema.length) {
//     return (
//       <div className="border border-dashed rounded-md p-4 text-sm text-gray-500">
//         No answer fields defined for this question.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {schema.map((f) => {
//         const v = value[f.fieldId];
//         const common =
//           "w-full border rounded-md p-2 text-sm disabled:bg-gray-50 disabled:text-gray-500";

//         return (
//           <div key={f.fieldId}>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               {f.label}
//               {f.required && <span className="text-red-500 ml-1">*</span>}
//             </label>

//             {f.type === "text" && (
//               <input
//                 type="text"
//                 className={common}
//                 placeholder={f.placeholder || ""}
//                 value={v ?? ""}
//                 onChange={(e) => setField(f.fieldId, e.target.value)}
//                 disabled={disabled}
//               />
//             )}

//             {f.type === "number" && (
//               <input
//                 type="number"
//                 className={common}
//                 placeholder={f.placeholder || ""}
//                 value={v ?? ""}
//                 onChange={(e) => setField(f.fieldId, e.target.value)}
//                 disabled={disabled}
//               />
//             )}

//             {f.type === "textarea" && (
//               <textarea
//                 rows={4}
//                 className={common}
//                 placeholder={f.placeholder || ""}
//                 value={v ?? ""}
//                 onChange={(e) => setField(f.fieldId, e.target.value)}
//                 disabled={disabled}
//               />
//             )}

//             {f.type === "dropdown" && (
//               <select
//                 className={common}
//                 value={v ?? ""}
//                 onChange={(e) => setField(f.fieldId, e.target.value)}
//                 disabled={disabled}
//               >
//                 <option value="">-- Select --</option>
//                 {(f.options || []).map((opt, i) => (
//                   <option key={i} value={opt}>
//                     {opt}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {f.type === "radio" && (
//               <div className="space-y-1">
//                 {(f.options || []).map((opt, i) => (
//                   <label
//                     key={i}
//                     className="flex items-center gap-2 text-sm text-gray-700"
//                   >
//                     <input
//                       type="radio"
//                       name={f.fieldId}
//                       value={opt}
//                       checked={v === opt}
//                       onChange={(e) => setField(f.fieldId, e.target.value)}
//                       disabled={disabled}
//                     />
//                     {opt}
//                   </label>
//                 ))}
//               </div>
//             )}

//             {f.type === "checkbox" && (
//               <div className="space-y-1">
//                 {(f.options || []).map((opt, i) => {
//                   const arr = Array.isArray(v) ? v : [];
//                   const checked = arr.includes(opt);
//                   return (
//                     <label
//                       key={i}
//                       className="flex items-center gap-2 text-sm text-gray-700"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={checked}
//                         onChange={(e) => {
//                           const next = e.target.checked
//                             ? [...arr, opt]
//                             : arr.filter((x) => x !== opt);
//                           setField(f.fieldId, next);
//                         }}
//                         disabled={disabled}
//                       />
//                       {opt}
//                     </label>
//                   );
//                 })}
//               </div>
//             )}

//             {f.type === "file" && (
//               <div className="space-y-1">
//                 {/*
//                  * For file fields we accept a URL. In a fuller implementation
//                  * this would upload to Cloudinary/etc. and save the URL. Here
//                  * we allow pasting a URL to keep scope tight and reuse
//                  * existing upload infrastructure if the team already has one.
//                  */}
//                 <input
//                   type="url"
//                   className={common}
//                   placeholder={f.placeholder || "Paste file URL"}
//                   value={v ?? ""}
//                   onChange={(e) => setField(f.fieldId, e.target.value)}
//                   disabled={disabled}
//                 />
//                 <p className="text-xs text-gray-400">
//                   Paste a URL to your uploaded file (e.g. Google Drive share
//                   link).
//                 </p>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }




/**
 * DynamicAnswerForm
 *
 * Renders a scenario's sub-questions as a live form.
 * The backend model uses `subQuestions: [{ _id, questionText, maxMarks }]`
 * and stores answers as `subAnswers: [{ subQuestionId, answerText }]`.
 *
 * Props:
 *   - subQuestions: Array of { _id, questionText, maxMarks }
 *   - value: Object map  { [subQuestionId]: answerText }
 *   - onChange: (nextValue) => void
 *   - disabled: boolean
 */
export default function DynamicAnswerForm({
  subQuestions = [],
  value = {},
  onChange,
  disabled = false,
}) {
  const setField = (subQuestionId, newVal) => {
    onChange?.({ ...value, [subQuestionId]: newVal });
  };

  if (!subQuestions.length) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-400">
          No questions defined for this scenario.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {subQuestions.map((sq, idx) => {
        const subId = String(sq._id);
        const val = value[subId] ?? "";
        const charCount = val.length;

        return (
          <div
            key={subId}
            className={`border rounded-xl p-4 transition-colors ${
              disabled
                ? "border-gray-200 bg-gray-50"
                : val
                ? "border-indigo-200 bg-indigo-50/30"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 mt-0.5">
                  {idx + 1}
                </span>
                <label className="text-sm font-medium text-gray-800 leading-snug">
                  {sq.questionText}
                </label>
              </div>
              {sq.maxMarks > 0 && (
                <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 font-medium">
                  {sq.maxMarks} mark{sq.maxMarks !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={4}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent ${
                  disabled
                    ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                    : "bg-white border-gray-300 text-gray-800 hover:border-gray-400"
                }`}
                placeholder={
                  disabled
                    ? "—"
                    : "Type your answer here…"
                }
                value={val}
                onChange={(e) => setField(subId, e.target.value)}
                disabled={disabled}
              />
              {!disabled && (
                <div className="absolute bottom-2 right-2.5 text-[10px] text-gray-400">
                  {charCount > 0 && `${charCount} chars`}
                </div>
              )}
            </div>

            {!disabled && val && (
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Answer saved
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}