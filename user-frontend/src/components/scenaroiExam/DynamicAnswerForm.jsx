


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
        <p className="text-sm text-gray-600">
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
                <span className="flex-shrink-0 text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-0.5 font-medium">
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
                <div className="absolute bottom-2 right-2.5 text-[10px] text-gray-600">
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