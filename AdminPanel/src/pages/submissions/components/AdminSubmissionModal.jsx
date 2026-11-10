import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, Badge, Textarea } from "../../../components/ui";
import {
  getAllAssignments,
  getSubmissionById,
  getEligibleSubmissionLearners,
  adminCreateSubmission,
  adminUpdateSubmission,
} from "../../../services/assignmentService";
import {
  AlertTriangle,
  FileText,
  Search,
  ShieldCheck,
  UploadCloud,
  X,
  Loader2,
} from "lucide-react";

/**
 * Admin: upload a submission on a learner's behalf ("create"), or edit /
 * replace the file of an existing submission ("edit").
 *
 * Learners submit either a PDF or answers to the assessment's questions;
 * this modal accepts exactly the same content. All rules (enrolment,
 * published assessment, PDF only, size limit, duplicates) are enforced on
 * the server too — the checks here are only for fast feedback.
 */

export const ADMIN_SUBMISSION_MAX_MB = 10;
const TEXT_TYPES = ["text", "short_answer", "long_answer"];
const SINGLE_CHOICE_TYPES = ["mcq", "single_choice", "true_false"];
const GRADED_STATUSES = ["graded", "approved", "ai_reviewed"];

const validatePdf = (f) => {
  if (!f) return "";
  const isPdf = f.type === "application/pdf" && /\.pdf$/i.test(f.name || "");
  if (!isPdf) return "Only PDF files are accepted.";
  if (f.size > ADMIN_SUBMISSION_MAX_MB * 1024 * 1024) {
    return `File is larger than ${ADMIN_SUBMISSION_MAX_MB}MB.`;
  }
  return "";
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const optionsFor = (q) => {
  if (Array.isArray(q.options) && q.options.length) return q.options;
  if (q.type === "true_false") return ["True", "False"];
  return [];
};

/** Answer editor that mirrors what a learner can submit per question type. */
function AnswersEditor({ questions, answers, onChange, disabled }) {
  if (!questions?.length) return null;
  const set = (qid, patch) => onChange({ ...answers, [qid]: { ...(answers[qid] || {}), ...patch } });

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-600">Answers</p>
      {questions.map((q, i) => {
        const qid = String(q._id);
        const a = answers[qid] || {};
        const opts = optionsFor(q);
        return (
          <div key={qid} className="rounded-xl border border-gray-100 p-3 space-y-2">
            <p className="text-sm text-gray-800">
              <span className="text-gray-400 mr-1">Q{i + 1}.</span>
              {q.prompt}
              <span className="text-xs text-gray-400 ml-2">
                ({q.marks ?? 0} mark{q.marks === 1 ? "" : "s"} · {String(q.type).replace(/_/g, " ")})
              </span>
            </p>
            {SINGLE_CHOICE_TYPES.includes(q.type) && opts.length > 0 ? (
              <select
                value={a.selectedOption || ""}
                disabled={disabled}
                onChange={(e) => set(qid, { selectedOption: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">— No answer —</option>
                {opts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : q.type === "multiple_choice" && opts.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {opts.map((o) => {
                  const chosen = (a.selectedOption || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const checked = chosen.includes(o);
                  return (
                    <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-indigo-600"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => {
                          const next = checked ? chosen.filter((c) => c !== o) : [...chosen, o];
                          set(qid, { selectedOption: next.join(",") });
                        }}
                      />
                      {o}
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                rows={TEXT_TYPES.includes(q.type) && q.type !== "short_answer" ? 4 : 2}
                value={a.textAnswer || ""}
                disabled={disabled}
                maxLength={20000}
                onChange={(e) => set(qid, { textAnswer: e.target.value })}
                placeholder="Learner's answer"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 resize-y"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FilePicker({ file, onFile, error, label, disabled }) {
  const inputRef = useRef(null);
  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !disabled && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!disabled) onFile(e.dataTransfer.files?.[0] || null);
        }}
        className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition ${
          error ? "border-red-300 bg-red-50/40" : "border-gray-200 hover:border-indigo-300"
        }`}
      >
        <UploadCloud size={20} className="text-gray-400 shrink-0" />
        <div className="flex-1 min-w-0 text-sm">
          {file ? (
            <span className="text-gray-800 truncate block">
              {file.name} <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </span>
          ) : (
            <span className="text-gray-500">
              Click or drop a PDF (max {ADMIN_SUBMISSION_MAX_MB}MB)
            </span>
          )}
        </div>
        {file && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="p-1 rounded-md text-gray-400 hover:text-red-500"
            aria-label="Remove selected file"
          >
            <X size={15} />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function AdminSubmissionModal({
  open,
  mode, // "create" | "edit"
  submissionId, // edit
  defaultAssignmentId, // create (optional pre-selection)
  focusFile = false, // edit: opened via "Replace file"
  onClose,
  onSaved,
}) {
  const isEdit = mode === "edit";

  // shared
  const [answers, setAnswers] = useState({});
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isLate, setIsLate] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // create
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [learnerSearch, setLearnerSearch] = useState("");
  const [learners, setLearners] = useState([]);
  const [learnersTotal, setLearnersTotal] = useState(0);
  const [learnersLoading, setLearnersLoading] = useState(false);
  const [learnersError, setLearnersError] = useState("");
  const [studentId, setStudentId] = useState("");

  // edit
  const [submission, setSubmission] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [resetGrading, setResetGrading] = useState(false);

  // Reset everything whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setAnswers({});
    setFile(null);
    setFileError("");
    setNote("");
    setError("");
    setSaving(false);
    setAssignmentFilter("");
    setLearnerSearch("");
    setLearners([]);
    setStudentId("");
    setSubmission(null);
    setAssignmentId(isEdit ? "" : defaultAssignmentId || "");
  }, [open, isEdit, defaultAssignmentId]);

  // create: load assessments
  useEffect(() => {
    if (!open || isEdit) return;
    setAssignmentsLoading(true);
    getAllAssignments({ limit: 500 })
      .then((d) => setAssignments(Array.isArray(d?.assignments) ? d.assignments : []))
      .catch(() => setError("Could not load assessments. Close and try again."))
      .finally(() => setAssignmentsLoading(false));
  }, [open, isEdit]);

  // edit: load the submission with its questions + answers
  useEffect(() => {
    if (!open || !isEdit || !submissionId) return;
    setLoadingSubmission(true);
    getSubmissionById(submissionId)
      .then((s) => {
        setSubmission(s);
        setIsLate(Boolean(s.isLate));
        setResetGrading(!GRADED_STATUSES.includes(s.status));
        const initial = {};
        for (const a of s.answers || []) {
          const qid = String(a.questionId?._id || a.questionId);
          initial[qid] = { textAnswer: a.textAnswer || "", selectedOption: a.selectedOption || "" };
        }
        setAnswers(initial);
      })
      .catch((e) => setError(e?.response?.data?.message || "Could not load this submission."))
      .finally(() => setLoadingSubmission(false));
  }, [open, isEdit, submissionId]);

  const assignment = useMemo(
    () => assignments.find((a) => a._id === assignmentId) || null,
    [assignments, assignmentId],
  );

  // create: default late flag from the due date
  useEffect(() => {
    if (!isEdit && assignment) {
      setIsLate(Boolean(assignment.dueDate && new Date() > new Date(assignment.dueDate)));
      setAnswers({});
      setStudentId("");
    }
  }, [assignment, isEdit]);

  // create: eligible learners (debounced server search)
  const learnerSeq = useRef(0);
  useEffect(() => {
    if (!open || isEdit || !assignmentId) return undefined;
    const seq = ++learnerSeq.current;
    const t = setTimeout(async () => {
      setLearnersLoading(true);
      setLearnersError("");
      try {
        const d = await getEligibleSubmissionLearners({
          assignmentId,
          search: learnerSearch.trim(),
          limit: 20,
        });
        if (seq !== learnerSeq.current) return;
        setLearners(d?.learners || []);
        setLearnersTotal(d?.total || 0);
      } catch (e) {
        if (seq !== learnerSeq.current) return;
        setLearners([]);
        setLearnersError(e?.response?.data?.message || "Could not load learners.");
      } finally {
        if (seq === learnerSeq.current) setLearnersLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [open, isEdit, assignmentId, learnerSearch]);

  const filteredAssignments = useMemo(() => {
    const q = assignmentFilter.trim().toLowerCase();
    return assignments.filter(
      (a) =>
        !q ||
        a.title?.toLowerCase().includes(q) ||
        a.courseId?.title?.toLowerCase().includes(q),
    );
  }, [assignments, assignmentFilter]);

  const questions = isEdit ? submission?.assignmentId?.questions || [] : assignment?.questions || [];
  const selectedLearner = learners.find((l) => l._id === studentId);

  const handleFile = (f) => {
    const msg = validatePdf(f);
    setFileError(msg);
    setFile(msg ? null : f);
  };

  const answersPayload = () =>
    Object.entries(answers).map(([questionId, a]) => ({
      questionId,
      textAnswer: a.textAnswer || "",
      selectedOption: a.selectedOption || "",
    }));

  const hasAnswerContent = answersPayload().some((a) => a.textAnswer.trim() || a.selectedOption);

  const submit = async () => {
    if (saving) return; // duplicate-click guard (button is disabled too)
    setError("");
    try {
      if (!isEdit) {
        if (!assignmentId) throw new Error("Select an assessment.");
        if (!studentId) throw new Error("Select a learner.");
        if (!file && !hasAnswerContent) {
          throw new Error("Attach a PDF or enter at least one answer.");
        }
      }
      setSaving(true);
      const fd = new FormData();
      if (file) fd.append("file", file);
      if (questions.length) fd.append("answers", JSON.stringify(answersPayload()));
      fd.append("isLate", String(isLate));
      if (note.trim()) fd.append("note", note.trim());

      let result;
      if (isEdit) {
        fd.append("resetGrading", String(resetGrading));
        result = await adminUpdateSubmission(submissionId, fd);
      } else {
        fd.append("assignmentId", assignmentId);
        fd.append("studentId", studentId);
        result = await adminCreateSubmission(fd);
      }
      onSaved?.(result, isEdit ? (file ? "replaced" : "edited") : "created");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const graded = submission && GRADED_STATUSES.includes(submission.status);
  const title = isEdit ? (focusFile ? "Replace Submission File" : "Edit Submission") : "Upload Submission for a Learner";

  return (
    <Modal open={open} onClose={() => !saving && onClose()} title={title} size="lg">
      <div className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" /> <span>{error}</span>
          </div>
        )}

        {/* ── CREATE: assessment + learner selection ── */}
        {!isEdit && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">1. Assessment</p>
              <input
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                placeholder="Filter by assessment or course…"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200"
              />
              <select
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
                disabled={assignmentsLoading || saving}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">
                  {assignmentsLoading ? "Loading assessments…" : "Select an assessment"}
                </option>
                {filteredAssignments.map((a) => (
                  <option key={a._id} value={a._id} disabled={!a.isPublished}>
                    {a.title} — {a.courseId?.title || "No course"} ·{" "}
                    {(a.assessmentType || "general").replace(/_/g, " ")}
                    {a.isPublished ? "" : " (unpublished)"}
                  </option>
                ))}
              </select>
              {!assignmentsLoading && assignments.length > 0 && filteredAssignments.length === 0 && (
                <p className="text-xs text-gray-400">No assessments match this filter.</p>
              )}
              {assignment?.dueDate && (
                <p className="text-xs text-gray-500">Due {fmtDate(assignment.dueDate)}</p>
              )}
            </div>

            {assignmentId && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">2. Learner</p>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={learnerSearch}
                    onChange={(e) => setLearnerSearch(e.target.value)}
                    placeholder="Search enrolled learners by name, email or mobile…"
                    className="w-full pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-100 divide-y">
                  {learnersLoading ? (
                    <p className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                      <Loader2 size={14} className="animate-spin" /> Searching learners…
                    </p>
                  ) : learnersError ? (
                    <p className="px-4 py-3 text-sm text-red-600">{learnersError}</p>
                  ) : learners.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400">
                      No enrolled learners found for this assessment's course.
                    </p>
                  ) : (
                    learners.map((l) => {
                      const taken = Boolean(l.existingSubmission);
                      return (
                        <label
                          key={l._id}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                            taken ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-indigo-50/40"
                          } ${studentId === l._id ? "bg-indigo-50" : ""}`}
                        >
                          <input
                            type="radio"
                            name="admin-sub-learner"
                            className="accent-indigo-600"
                            disabled={taken || saving}
                            checked={studentId === l._id}
                            onChange={() => setStudentId(l._id)}
                          />
                          <span className="flex-1 min-w-0">
                            <span className="font-medium text-gray-800">{l.name || "—"}</span>
                            <span className="block text-xs text-gray-500 truncate">
                              {l.email}
                              {l.mobile ? ` · ${l.mobile}` : ""}
                            </span>
                          </span>
                          {taken && <Badge variant="default">Already submitted</Badge>}
                        </label>
                      );
                    })
                  )}
                </div>
                {learnersTotal > learners.length && !learnersLoading && (
                  <p className="text-xs text-gray-400">
                    Showing {learners.length} of {learnersTotal} — refine the search to find others.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── EDIT: who / what ── */}
        {isEdit && (
          <>
            {loadingSubmission && (
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 size={14} className="animate-spin" /> Loading submission…
              </p>
            )}
            {submission && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                <p>
                  <strong>Learner:</strong> {submission.studentId?.name || "—"} ({submission.studentId?.email || "—"})
                </p>
                <p>
                  <strong>Assessment:</strong> {submission.assignmentId?.title || "—"}
                </p>
                <p>
                  <strong>Status:</strong> {String(submission.status).replace(/_/g, " ")}
                  {submission.totalScore != null && ` · Score ${submission.totalScore}/${submission.assignmentId?.totalMarks ?? "—"}`}
                  {submission.approvalStatus === "approved" && " · Approved"}
                </p>
                {submission.submissionFile?.url && (
                  <p className="flex items-center gap-1">
                    <strong>Current file:</strong>
                    <a
                      href={submission.submissionFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                    >
                      <FileText size={13} /> {submission.submissionFile.originalName || "submission.pdf"}
                    </a>
                  </p>
                )}
                {submission.submittedByAdmin && (
                  <p className="flex items-center gap-1 text-xs text-indigo-700">
                    <ShieldCheck size={12} /> Uploaded by {submission.adminSubmittedBy?.name || "an administrator"} on{" "}
                    {fmtDate(submission.adminSubmittedAt)}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Content ── */}
        {((!isEdit && assignment) || (isEdit && submission)) && (
          <>
            <FilePicker
              file={file}
              onFile={handleFile}
              error={fileError}
              disabled={saving}
              label={
                isEdit
                  ? submission?.submissionFile?.url
                    ? "Replace PDF (optional — the current file is removed after a successful replace)"
                    : "Attach PDF (optional)"
                  : questions.length
                    ? "Submission PDF (optional when answers are entered)"
                    : "Submission PDF"
              }
            />

            {!(isEdit && focusFile) && (
              <AnswersEditor questions={questions} answers={answers} onChange={setAnswers} disabled={saving} />
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="accent-indigo-600"
                checked={isLate}
                disabled={saving}
                onChange={(e) => setIsLate(e.target.checked)}
              />
              Mark as a late submission
            </label>

            {isEdit && (
              <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                <p className="text-sm font-medium text-gray-600">Grading</p>
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="admin-sub-grading"
                    className="accent-indigo-600 mt-1"
                    checked={!resetGrading}
                    disabled={saving}
                    onChange={() => setResetGrading(false)}
                  />
                  <span>
                    Keep the existing grade, feedback and approval
                    {graded && <span className="block text-xs text-gray-500">Recommended for corrections that don't change the assessed work.</span>}
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="admin-sub-grading"
                    className="accent-indigo-600 mt-1"
                    checked={resetGrading}
                    disabled={saving}
                    onChange={() => setResetGrading(true)}
                  />
                  <span>
                    Reset grading and send it back to the review queue
                    <span className="block text-xs text-gray-500">
                      Clears score, feedback, annotations, AI draft and approval; MCQ answers are re-marked automatically.
                    </span>
                  </span>
                </label>
                {resetGrading && graded && (
                  <p className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    This submission is already {submission.status === "approved" ? "approved" : "graded"}. Resetting removes that result until it is graded again.
                  </p>
                )}
              </div>
            )}

            <Textarea
              label="Admin note (optional — kept in the audit trail, not shown to the learner)"
              value={note}
              maxLength={1000}
              rows={2}
              disabled={saving}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paper copy received by post on 3 Nov"
            />
          </>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            loading={saving}
            disabled={
              saving ||
              (isEdit ? !submission : !assignmentId || !studentId || (!file && !hasAnswerContent))
            }
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? (file ? "Replace File & Save" : "Save Changes") : "Upload Submission"}
          </Button>
        </div>
        {!isEdit && selectedLearner && assignment && (
          <p className="text-xs text-gray-400 text-right -mt-3">
            Submitting for {selectedLearner.name} on “{assignment.title}”
          </p>
        )}
      </div>
    </Modal>
  );
}
