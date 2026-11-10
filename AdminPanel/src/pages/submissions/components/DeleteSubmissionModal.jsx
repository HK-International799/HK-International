import { useEffect, useState } from "react";
import { Modal, Button, Textarea } from "../../../components/ui";
import { adminDeleteSubmission } from "../../../services/assignmentService";
import { AlertTriangle, Trash2 } from "lucide-react";

const listToText = (items) =>
  items.length <= 1
    ? items[0] || ""
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/**
 * Confirmation step for deleting a learner's submission. Clearly names the
 * learner and the assessment, warns when a grade / approval would be lost,
 * and only then calls the server (which requires `confirm: true`).
 */
export default function DeleteSubmissionModal({ open, submission, onClose, onDeleted }) {
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
      setDeleting(false);
    }
  }, [open]);

  if (!submission) return null;

  const learner = submission.studentId?.name || "Unknown learner";
  const email = submission.studentId?.email || "";
  const assessment = submission.assignmentId?.title || "Unknown assessment";
  const isGraded = submission.totalScore != null || ["graded", "approved"].includes(submission.status);
  const isApproved = submission.approvalStatus === "approved" || submission.status === "approved";
  const lostItems = [
    "The submitted answers",
    submission.submissionFile?.url && "the uploaded file",
    isGraded && "the grade and feedback",
    isApproved && "the approval",
  ].filter(Boolean);

  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError("");
    try {
      await adminDeleteSubmission(submission._id, { reason: reason.trim() });
      onDeleted?.(submission);
    } catch (e) {
      setError(e?.response?.data?.message || "The submission could not be deleted.");
      setDeleting(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !deleting && onClose()} title="Delete Submission" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          You are about to permanently delete this submission:
        </p>
        <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
          <p>
            <strong>Learner:</strong> {learner}
            {email && <span className="text-gray-500"> ({email})</span>}
          </p>
          <p>
            <strong>Assessment:</strong> {assessment}
          </p>
          <p>
            <strong>Status:</strong> {String(submission.status || "").replace(/_/g, " ")}
            {submission.totalScore != null &&
              ` · Score ${submission.totalScore}/${submission.assignmentId?.totalMarks ?? "—"}`}
          </p>
          {submission.submissionFile?.originalName && (
            <p>
              <strong>File:</strong> {submission.submissionFile.originalName}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            {listToText(lostItems)} will be removed. This cannot be undone. The
            learner will be able to submit this assessment again. Certificates
            and course progress records are not changed.
          </span>
        </div>

        <Textarea
          label="Reason (optional — recorded in the audit log)"
          value={reason}
          rows={2}
          maxLength={1000}
          disabled={deleting}
          onChange={(e) => setReason(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} loading={deleting}>
            <Trash2 size={14} /> Delete for {learner}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
