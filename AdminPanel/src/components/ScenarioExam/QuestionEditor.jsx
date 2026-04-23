import { useState } from "react";
import FormSchemaBuilder from "./FormSchemaBuilder";
import { Save, Trash2 } from "lucide-react";

export default function QuestionEditor({
  question,
  onSave,
  onDelete,
  saving,
}) {
  const [q, setQ] = useState({
    questionNumber: question?.questionNumber || 1,
    questionText: question?.questionText || "",
    scenarioPDF: question?.scenarioPDF || "",
    scenarioText: question?.scenarioText || "",
    maxMarks: question?.maxMarks || 0,
    formSchema: question?.formSchema || [],
  });

  const handleChange = (key, val) => setQ((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!q.questionText?.trim()) {
      alert("Question text is required");
      return;
    }
    onSave?.(q);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-gray-500">Question #</label>
          <input
            type="number"
            min="1"
            className="w-full border rounded-md p-2 text-sm"
            value={q.questionNumber}
            onChange={(e) =>
              handleChange("questionNumber", Number(e.target.value))
            }
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Max Marks</label>
          <input
            type="number"
            min="0"
            className="w-full border rounded-md p-2 text-sm"
            value={q.maxMarks}
            onChange={(e) => handleChange("maxMarks", Number(e.target.value))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Scenario PDF URL</label>
          <input
            type="url"
            placeholder="https://..."
            className="w-full border rounded-md p-2 text-sm"
            value={q.scenarioPDF}
            onChange={(e) => handleChange("scenarioPDF", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">
          Scenario Text (optional — shown alongside PDF)
        </label>
        <textarea
          rows={3}
          className="w-full border rounded-md p-2 text-sm"
          value={q.scenarioText}
          onChange={(e) => handleChange("scenarioText", e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Question Text</label>
        <textarea
          rows={3}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="What should the student answer based on the scenario?"
          value={q.questionText}
          onChange={(e) => handleChange("questionText", e.target.value)}
        />
      </div>

      <FormSchemaBuilder
        value={q.formSchema}
        onChange={(schema) => handleChange("formSchema", schema)}
      />

      <div className="flex items-center gap-2 pt-2 border-t">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm rounded-md px-3 py-1.5"
        >
          <Save size={14} /> {saving ? "Saving..." : "Save question"}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm rounded-md px-3 py-1.5"
          >
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
