import { useState } from "react";
import { Plus, Trash2, GripVertical, X } from "lucide-react";

const FIELD_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "radio", label: "Single Choice (Radio)" },
  { value: "checkbox", label: "Multiple Choice (Checkbox)" },
  { value: "dropdown", label: "Dropdown" },
  { value: "file", label: "File Upload" },
];

const NEEDS_OPTIONS = ["radio", "checkbox", "dropdown"];

const newField = () => ({
  fieldId: `f_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  label: "",
  type: "text",
  required: false,
  placeholder: "",
  options: [],
});

export default function FormSchemaBuilder({ value = [], onChange }) {
  const [fields, setFields] = useState(value);

  const update = (next) => {
    setFields(next);
    onChange?.(next);
  };

  const addField = () => update([...fields, newField()]);

  const removeField = (idx) =>
    update(fields.filter((_, i) => i !== idx));

  const patchField = (idx, patch) => {
    const next = fields.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    update(next);
  };

  const addOption = (idx) => {
    const f = fields[idx];
    patchField(idx, { options: [...(f.options || []), ""] });
  };

  const updateOption = (idx, optIdx, val) => {
    const f = fields[idx];
    const opts = [...(f.options || [])];
    opts[optIdx] = val;
    patchField(idx, { options: opts });
  };

  const removeOption = (idx, optIdx) => {
    const f = fields[idx];
    const opts = (f.options || []).filter((_, i) => i !== optIdx);
    patchField(idx, { options: opts });
  };

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[idx], next[target]] = [next[target], next[idx]];
    update(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Answer Form Fields
        </label>
        <button
          type="button"
          onClick={addField}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
        >
          <Plus size={16} /> Add field
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-gray-500 border border-dashed rounded-md p-4 text-center">
          No fields yet. Click "Add field" to start building the answer form.
        </div>
      )}

      {fields.map((f, idx) => (
        <div
          key={f.fieldId}
          className="border rounded-md p-3 bg-white space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-gray-400">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="disabled:opacity-30 hover:text-gray-700"
                title="Move up"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === fields.length - 1}
                className="disabled:opacity-30 hover:text-gray-700"
                title="Move down"
              >
                ▼
              </button>
            </div>

            <GripVertical size={16} className="text-gray-300" />
            <span className="text-xs text-gray-500">Field #{idx + 1}</span>

            <button
              type="button"
              onClick={() => removeField(idx)}
              className="ml-auto text-red-500 hover:text-red-700"
              title="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              className="border rounded-md p-2 text-sm"
              placeholder="Label (e.g. 'Describe your approach')"
              value={f.label}
              onChange={(e) => patchField(idx, { label: e.target.value })}
            />
            <select
              className="border rounded-md p-2 text-sm"
              value={f.type}
              onChange={(e) =>
                patchField(idx, {
                  type: e.target.value,
                  options: NEEDS_OPTIONS.includes(e.target.value)
                    ? f.options?.length
                      ? f.options
                      : [""]
                    : [],
                })
              }
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="border rounded-md p-2 text-sm"
              placeholder="Placeholder (optional)"
              value={f.placeholder || ""}
              onChange={(e) =>
                patchField(idx, { placeholder: e.target.value })
              }
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!f.required}
                onChange={(e) =>
                  patchField(idx, { required: e.target.checked })
                }
              />
              Required
            </label>
          </div>

          {NEEDS_OPTIONS.includes(f.type) && (
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Options</span>
                <button
                  type="button"
                  onClick={() => addOption(idx)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus size={12} /> Add option
                </button>
              </div>
              {(f.options || []).map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="border rounded-md p-1.5 text-sm flex-1"
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(idx, oi, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(idx, oi)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
