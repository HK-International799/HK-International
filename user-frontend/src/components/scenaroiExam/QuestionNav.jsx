// /**
//  * QuestionNav
//  *
//  * Displays a compact list of question numbers with visual indicators for
//  * answered / unanswered / current.
//  *
//  * Props:
//  *   - questions: Array of { _id, questionNumber }
//  *   - currentId: string
//  *   - answeredSet: Set<string> (of questionIds with at least one response)
//  *   - onSelect: (questionId) => void
//  */
// export default function QuestionNav({
//   questions = [],
//   currentId,
//   answeredSet,
//   onSelect,
// }) {
//   const isAnswered = (id) => answeredSet?.has(String(id));

//   return (
//     <div className="bg-white border rounded-md p-3">
//       <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">
//         Questions
//       </h3>
//       <div className="grid grid-cols-5 gap-1.5">
//         {questions.map((q) => {
//           const active = String(currentId) === String(q._id);
//           const done = isAnswered(q._id);
//           return (
//             <button
//               key={q._id}
//               type="button"
//               onClick={() => onSelect?.(q._id)}
//               className={`h-8 text-xs rounded border flex items-center justify-center transition ${
//                 active
//                   ? "bg-indigo-600 text-white border-indigo-600"
//                   : done
//                     ? "bg-green-50 text-green-700 border-green-300"
//                     : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
//               }`}
//               title={`Question ${q.questionNumber}`}
//             >
//               {q.questionNumber}
//             </button>
//           );
//         })}
//       </div>
//       <div className="mt-3 space-y-1 text-[11px] text-gray-500">
//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 rounded border bg-indigo-600 border-indigo-600 inline-block" />
//           Current
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 rounded border bg-green-50 border-green-300 inline-block" />
//           Answered
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 rounded border bg-white border-gray-200 inline-block" />
//           Not answered
//         </div>
//       </div>
//     </div>
//   );
// }




/**
 * QuestionNav — sidebar showing scenario numbers with answered / current states.
 *
 * Props:
 *   - questions: Array of { _id, questionNumber, subQuestions }
 *   - currentId: string (_id of the currently visible question)
 *   - answeredSet: Set<string> (question _ids that have ≥1 non-empty subAnswer)
 *   - onSelect: (questionId: string) => void
 */
export default function QuestionNav({
  questions = [],
  currentId,
  answeredSet,
  onSelect,
}) {
  const answeredCount = [...(answeredSet || [])].length;
  const total = questions.length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">
            {answeredCount}/{total}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: total ? `${(answeredCount / total) * 100}%` : "0%" }}
          />
        </div>
      </div>

      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Scenarios
      </h3>

      <div className="space-y-1">
        {questions.map((q) => {
          const active = String(currentId) === String(q._id);
          const done = answeredSet?.has(String(q._id));

          return (
            <button
              key={q._id}
              type="button"
              onClick={() => onSelect?.(q._id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : done
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  active
                    ? "bg-white/20 text-white"
                    : done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {q.questionNumber}
              </span>
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs">
                  {q.subQuestions?.length || 0} sub-question
                  {(q.subQuestions?.length || 0) !== 1 ? "s" : ""}
                </div>
              </div>
              {done && !active && (
                <svg
                  className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
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
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
        {[
          {
            color: "bg-indigo-600",
            label: "Current",
          },
          {
            color: "bg-emerald-100 border border-emerald-300",
            label: "Answered",
          },
          {
            color: "bg-gray-100 border border-gray-200",
            label: "Not answered",
          },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded ${color} flex-shrink-0`} />
            <span className="text-[11px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}