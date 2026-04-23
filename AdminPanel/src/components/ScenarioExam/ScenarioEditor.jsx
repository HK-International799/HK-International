import { useState, useRef } from "react";
import { Save, Trash2, Plus, X, Upload, FileText, Loader2 } from "lucide-react";
import { uploadScenarioPdf } from "../../services/scenarioExamService";

/**
 * ScenarioEditor
 *
 * Represents one "Scenario Block" which contains:
 *  - A mandatory PDF upload
 *  - One or more questions (subQuestions) with text answers
 *
 * Props:
 *  - examId: string (needed for PDF upload)
 *  - scenario: existing scenario object (or {} for new)
 *  - onSave(data): called with the final payload
 *  - onDelete(): called when delete is clicked (only shown for existing)
 *  - saving: bool
 *  - scenarioIndex: number (for display label)
 */
export default function ScenarioEditor({
  examId,
  scenario = {},
  onSave,
  onDelete,
  saving,
  scenarioIndex,
}) {
  const isNew = !scenario._id;

  const [pdfUrl, setPdfUrl] = useState(scenario.scenarioPdfUrl || "");
  const [publicId, setPublicId] = useState(scenario.cloudinaryPublicId || "");
  const [pdfName, setPdfName] = useState(
    scenario.scenarioPdfUrl ? "Uploaded PDF" : ""
  );
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const [subQuestions, setSubQuestions] = useState(
    scenario.subQuestions?.length
      ? scenario.subQuestions.map((sq) => ({
          _id: sq._id,
          questionText: sq.questionText,
          maxMarks: sq.maxMarks || 0,
        }))
      : [{ questionText: "", maxMarks: 0 }]
  );

  const [maxMarks, setMaxMarks] = useState(scenario.maxMarks || 0);
  const [saveErr, setSaveErr] = useState("");

  const fileInputRef = useRef(null);

  /* ── PDF Upload ─────────────────────────────────────────── */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadErr("Only PDF files are allowed.");
      return;
    }
    if (!examId) {
      setUploadErr("Save the exam first before uploading a PDF.");
      return;
    }

    setUploadErr("");
    setUploading(true);
    setPdfName(file.name);

    try {
      const res = await uploadScenarioPdf(examId, file);
      const { pdfUrl: url, cloudinaryPublicId: pid } = res.data;
      setPdfUrl(url);
      setPublicId(pid);
    } catch (err) {
      setUploadErr(
        err.response?.data?.message || "PDF upload failed. Please try again."
      );
      setPdfName("");
    } finally {
      setUploading(false);
    }
  };

  /* ── Sub-question helpers ───────────────────────────────── */
  const addSubQuestion = () =>
    setSubQuestions((prev) => [...prev, { questionText: "", maxMarks: 0 }]);

  const removeSubQuestion = (idx) =>
    setSubQuestions((prev) => prev.filter((_, i) => i !== idx));

  const updateSubQuestion = (idx, key, value) =>
    setSubQuestions((prev) =>
      prev.map((sq, i) => (i === idx ? { ...sq, [key]: value } : sq))
    );

  /* ── Save ───────────────────────────────────────────────── */
  const handleSave = () => {
    setSaveErr("");

    if (!pdfUrl) {
      setSaveErr("A scenario PDF is required.");
      return;
    }

    const validSubQs = subQuestions.filter((sq) => sq.questionText.trim());
    if (validSubQs.length === 0) {
      setSaveErr("At least one question is required.");
      return;
    }

    onSave?.({
      scenarioPdfUrl: pdfUrl,
      cloudinaryPublicId: publicId,
      subQuestions: validSubQs.map((sq) => ({
        ...(sq._id ? { _id: sq._id } : {}),
        questionText: sq.questionText.trim(),
        maxMarks: Number(sq.maxMarks) || 0,
      })),
      maxMarks: Number(maxMarks) || 0,
    });
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">
          Scenario {scenarioIndex !== undefined ? scenarioIndex + 1 : ""}
          {!isNew && (
            <span className="ml-2 text-xs text-gray-400 font-normal">
              (ID: {scenario._id?.slice(-6)})
            </span>
          )}
        </h3>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Delete this scenario"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* ── PDF Upload ───────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Scenario PDF <span className="text-red-500">*</span>
        </label>

        {pdfUrl ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <FileText size={16} className="text-green-600 shrink-0" />
            <span className="text-sm text-green-800 truncate flex-1">
              {pdfName || "PDF uploaded"}
            </span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 hover:underline shrink-0"
            >
              View
            </a>
            <button
              onClick={() => {
                setPdfUrl("");
                setPublicId("");
                setPdfName("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-gray-400 hover:text-red-500 shrink-0"
              title="Remove and upload a different PDF"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex flex-col items-center justify-center gap-2 p-6
              border-2 border-dashed rounded-lg cursor-pointer transition-colors
              ${uploading ? "border-indigo-300 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"}
            `}
          >
            {uploading ? (
              <>
                <Loader2 size={22} className="text-indigo-500 animate-spin" />
                <p className="text-sm text-indigo-600">Uploading PDF…</p>
              </>
            ) : (
              <>
                <Upload size={22} className="text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload scenario PDF
                </p>
                <p className="text-xs text-gray-400">PDF only · Max 20MB</p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {uploadErr && (
          <p className="text-xs text-red-600 mt-1">{uploadErr}</p>
        )}
      </div>

      {/* ── Sub-questions ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">
            Questions for this Scenario{" "}
            <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-gray-400">
            {subQuestions.length} question{subQuestions.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-3">
          {subQuestions.map((sq, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  Q{idx + 1}
                </span>
                {subQuestions.length > 1 && (
                  <button
                    onClick={() => removeSubQuestion(idx)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <textarea
                rows={2}
                className="w-full border rounded-md p-2 text-sm resize-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                placeholder="Enter the question that students must answer based on the scenario PDF…"
                value={sq.questionText}
                onChange={(e) =>
                  updateSubQuestion(idx, "questionText", e.target.value)
                }
              />

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">
                  Max Marks:
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-20 border rounded-md p-1.5 text-xs focus:ring-1 focus:ring-indigo-400 outline-none"
                  value={sq.maxMarks}
                  onChange={(e) =>
                    updateSubQuestion(idx, "maxMarks", Number(e.target.value))
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSubQuestion}
          className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Plus size={13} /> Add another question
        </button>
      </div>

      {/* ── Errors & Save ─────────────────────────────────────── */}
      {saveErr && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {saveErr}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1 border-t">
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm rounded-md px-4 py-2 font-medium transition-colors"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? "Saving…" : isNew ? "Add Scenario" : "Update Scenario"}
        </button>
      </div>
    </div>
  );
}