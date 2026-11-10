/**
 * adminSubmissionService
 *
 * Lets administrators manage learner assessment (Assignment) submissions
 * from the existing admin Submissions area:
 *
 *   • upload a submission on a learner's behalf
 *   • edit an existing submission (answers, late flag, admin note)
 *   • replace the submitted PDF
 *   • delete a submission (with confirmation)
 *
 * Design rules
 *   - Re-uses the existing Submission / Answer models, the same Cloudinary
 *     helpers, and the same MCQ auto-grading rules learners get, so admin-
 *     created submissions flow through the existing grading, AI grading and
 *     approval workflow unchanged.
 *   - Non-destructive by default: editing / replacing keeps the existing
 *     grade, approval and AI draft unless the admin explicitly asks to
 *     reset grading. Every content change snapshots the previous version
 *     into the existing `submissionHistory` array.
 *   - Never consumes the learner's own resubmission allowance.
 *   - Files are uploaded first; the previous file is deleted only after
 *     the database update succeeded (no orphans, no data loss on failure).
 *   - Every action is recorded on the submission (`adminActivity`) and in
 *     the global AuditLog (deletes keep a full snapshot there).
 *
 * Authorization is enforced in routes (admin / super_admin only); this
 * module additionally validates that the learner is a student enrolled in
 * the assessment's course.
 */
import mongoose from "mongoose";
import Submission from "../models/Submission.js";
import Answer from "../models/Answer.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import auditService from "./auditService.js";
import {
  uploadPdfToCloudinary,
  deletePdfFromCloudinary,
} from "../utils/cloudinaryPdf.js";
import { runAutoGrading, computePassFail } from "./submissionService.js";
import { sanitizePlainText, sanitizeFilename } from "../utils/textSanitize.js";
import { escapeRegex } from "../utils/learnerFilters.js";
import { deriveFullName } from "../utils/nameUtils.js";

const SUBMISSION_FOLDER = "assignments/submissions";
const NOTE_MAX = 1000;
const TEXT_ANSWER_MAX = 20000;
const OPTION_MAX = 1000;

const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const isObjectId = (v) =>
  typeof v === "string" &&
  /^[a-f0-9]{24}$/i.test(v) &&
  mongoose.Types.ObjectId.isValid(v);

const parseBool = (v) => v === true || v === "true" || v === "1" || v === 1;

const isProvided = (v) => v !== undefined && v !== null && v !== "";

const clampInt = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

// ── Input validation ──────────────────────────────────────────────────────

/** Verifies an uploaded buffer really is a PDF (not just named ".pdf"). */
const assertValidPdf = (file) => {
  if (!file) return;
  if (!file.buffer || !file.buffer.length) {
    throw new ApiError(400, "The uploaded file is empty");
  }
  const signature = file.buffer.subarray(0, 1024).toString("latin1");
  if (!signature.includes("%PDF-")) {
    throw new ApiError(
      400,
      "The uploaded file is not a valid PDF document",
    );
  }
};

/**
 * Accepts the answers payload (array or JSON string), validates every
 * questionId against the assessment and returns a de-duplicated, cleaned
 * list. Throws a 400 for anything malformed.
 */
const parseAnswers = (raw, assignment) => {
  if (raw === undefined || raw === null || raw === "") return null;
  let answers = raw;
  if (typeof answers === "string") {
    try {
      answers = JSON.parse(answers);
    } catch {
      throw new ApiError(400, "Answers must be valid JSON");
    }
  }
  if (!Array.isArray(answers)) throw new ApiError(400, "Answers must be a list");
  if (answers.length > 500) throw new ApiError(400, "Too many answers");

  const questionsById = new Map(
    (assignment.questions || []).map((q) => [String(q._id), q]),
  );
  const seen = new Map();
  for (const a of answers) {
    if (!a || typeof a !== "object") {
      throw new ApiError(400, "Each answer must be an object");
    }
    const qid = String(a.questionId || "");
    if (!isObjectId(qid) || !questionsById.has(qid)) {
      throw new ApiError(400, `Invalid questionId for this assessment: ${qid || "(missing)"}`);
    }
    if (a.textAnswer !== undefined && typeof a.textAnswer !== "string") {
      throw new ApiError(400, "textAnswer must be text");
    }
    if (a.selectedOption !== undefined && typeof a.selectedOption !== "string") {
      throw new ApiError(400, "selectedOption must be text");
    }
    const textAnswer = (a.textAnswer || "").replace(CONTROL_RE, "");
    const selectedOption = (a.selectedOption || "").replace(CONTROL_RE, "").trim();
    if (textAnswer.length > TEXT_ANSWER_MAX) {
      throw new ApiError(400, `Text answers must be ${TEXT_ANSWER_MAX} characters or fewer`);
    }
    if (selectedOption.length > OPTION_MAX) {
      throw new ApiError(400, "Selected option is too long");
    }
    seen.set(qid, { questionId: qid, textAnswer, selectedOption });
  }
  return [...seen.values()];
};

const hasAnyAnswer = (answers) =>
  (answers || []).some(
    (a) => (a.textAnswer && a.textAnswer.trim()) || a.selectedOption,
  );

const cleanNote = (note) =>
  sanitizePlainText(typeof note === "string" ? note : "", {
    maxLength: NOTE_MAX,
    multiline: true,
  });

const computeIsLate = (assignment, override) => {
  if (override !== undefined && override !== null && override !== "") {
    return parseBool(override);
  }
  return Boolean(assignment.dueDate && new Date() > new Date(assignment.dueDate));
};

/** Learner must be a student enrolled in the assessment's course. */
const loadEligibleStudent = async (studentId, assignment) => {
  if (!isObjectId(String(studentId || ""))) {
    throw new ApiError(400, "Please select a valid learner");
  }
  const student = await User.findById(studentId)
    .select("name firstName middleName lastName email role enrolledCourses")
    .lean();
  if (!student) throw new ApiError(404, "Learner not found");
  if (student.role !== "student") {
    throw new ApiError(400, "Submissions can only be made for learner (student) accounts");
  }
  const enrolled = (student.enrolledCourses || []).some(
    (id) => String(id) === String(assignment.courseId?._id || assignment.courseId),
  );
  if (!enrolled) {
    throw new ApiError(
      400,
      "This learner is not enrolled in the course this assessment belongs to",
    );
  }
  return student;
};

const loadAssignment = async (assignmentId) => {
  if (!isObjectId(String(assignmentId || ""))) {
    throw new ApiError(400, "Please select a valid assessment");
  }
  const assignment = await Assignment.findById(assignmentId)
    .populate("questions")
    .populate("courseId", "title");
  if (!assignment) throw new ApiError(404, "Assessment not found");
  return assignment;
};

const uploadPdf = async (file) => {
  const originalName = sanitizeFilename(file.originalname, {
    fallback: "submission.pdf",
  });
  const finalName = /\.pdf$/i.test(originalName) ? originalName : `${originalName}.pdf`;
  try {
    const result = await uploadPdfToCloudinary(file.buffer, finalName, SUBMISSION_FOLDER);
    return { url: result.url, public_id: result.public_id, originalName: finalName };
  } catch (err) {
    throw new ApiError(
      502,
      `The file could not be uploaded to storage: ${err?.message || "unknown error"}`,
    );
  }
};

/** Applies the learner auto-grading rules to the submission's answers. */
const applyAutoGrading = async (submission, assignment, answerDocs) => {
  const { patches, correctCount, wrongCount, autoScore, allAutoGradable } =
    runAutoGrading(assignment.questions || [], answerDocs);
  if (!patches.length) return;

  await Promise.all(
    patches.map((p) =>
      Answer.findByIdAndUpdate(p.answerId, {
        marksAwarded: p.marksAwarded,
        isCorrect: p.isCorrect,
      }),
    ),
  );
  submission.correctCount = correctCount;
  submission.wrongCount = wrongCount;

  if (allAutoGradable) {
    submission.totalScore = autoScore;
    submission.passFail = computePassFail(autoScore, assignment.passingMarks);
    submission.status = assignment.requireAdminApproval ? "submitted" : "graded";
    if (!assignment.requireAdminApproval) submission.gradedAt = new Date();
  }
};

const resetGradingState = (submission, assignment) => {
  submission.status = "submitted";
  submission.totalScore = null;
  submission.feedback = "";
  submission.gradedBy = null;
  submission.gradedAt = null;
  submission.annotations = [];
  submission.reviewAnnotations = [];
  submission.passFail = "pending";
  submission.correctCount = null;
  submission.wrongCount = null;
  submission.approvalStatus = assignment.requireAdminApproval ? "pending" : "not_required";
  submission.approvedBy = null;
  submission.approvedAt = null;
  submission.aiDraft = {
    questionGrades: [],
    feedbackText: "",
    overallFeedback: "",
    suggestedPass: null,
    score: null,
    generatedAt: null,
    accepted: false,
  };
};

const populateForResponse = (id) =>
  Submission.findById(id)
    .populate("studentId", "name email avatar")
    .populate(
      "assignmentId",
      "title totalMarks dueDate courseId assessmentType requireAdminApproval passingMarks",
    )
    .populate("answers")
    .populate("adminSubmittedBy", "name")
    .populate("lastAdminModifiedBy", "name")
    .populate("adminActivity.performedBy", "name");

const learnerLabel = (student) =>
  `${deriveFullName(student) || student?.name || "Unknown learner"}${
    student?.email ? ` <${student.email}>` : ""
  }`;

// ── Eligible learners for an assessment ───────────────────────────────────

export const listEligibleLearnersService = async ({ assignmentId, search, page, limit }) => {
  const assignment = await loadAssignment(assignmentId);
  const p = clampInt(page, 1, 1, 100000);
  const l = clampInt(limit, 20, 1, 100);

  const filter = {
    role: "student",
    enrolledCourses: assignment.courseId?._id || assignment.courseId,
  };
  const term = typeof search === "string" ? search.trim().slice(0, 100) : "";
  if (term) {
    const regex = new RegExp(escapeRegex(term), "i");
    filter.$or = [
      { name: regex },
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { mobile: regex },
    ];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("name firstName middleName lastName email mobile")
      .sort({ name: 1, _id: 1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
  ]);

  const subs = users.length
    ? await Submission.find({
        assignmentId: assignment._id,
        studentId: { $in: users.map((u) => u._id) },
      })
        .select("studentId status")
        .lean()
    : [];
  const subByStudent = new Map(subs.map((s) => [String(s.studentId), s]));

  return {
    assignment: {
      _id: assignment._id,
      title: assignment.title,
      course: assignment.courseId?.title || "",
      isPublished: assignment.isPublished,
    },
    learners: users.map((u) => {
      const sub = subByStudent.get(String(u._id));
      return {
        _id: u._id,
        name: deriveFullName(u) || u.name || "",
        email: u.email || "",
        mobile: u.mobile || "",
        existingSubmission: sub ? { _id: sub._id, status: sub.status } : null,
      };
    }),
    total,
    page: p,
    limit: l,
    totalPages: Math.max(Math.ceil(total / l), 1),
  };
};

// ── Upload on behalf of a learner ─────────────────────────────────────────

export const adminCreateSubmissionService = async (
  { assignmentId, studentId, answers: rawAnswers, isLate, note, file },
  admin,
) => {
  const assignment = await loadAssignment(assignmentId);
  if (!assignment.isPublished) {
    throw new ApiError(
      400,
      "This assessment is not published yet, so learners cannot submit to it",
    );
  }
  const student = await loadEligibleStudent(studentId, assignment);

  const existing = await Submission.exists({
    assignmentId: assignment._id,
    studentId: student._id,
  });
  if (existing) {
    throw new ApiError(
      409,
      "This learner already has a submission for this assessment. Edit or replace the existing submission instead.",
    );
  }

  assertValidPdf(file);
  const answers = parseAnswers(rawAnswers, assignment) || [];
  if (!file && !hasAnyAnswer(answers)) {
    throw new ApiError(
      400,
      "Provide a PDF file or at least one answer for the submission",
    );
  }

  const adminNote = cleanNote(note);
  const now = new Date();

  const submissionFile = file ? await uploadPdf(file) : null;

  let submission;
  try {
    submission = await Submission.create({
      assignmentId: assignment._id,
      studentId: student._id,
      status: "submitted",
      isLate: computeIsLate(assignment, isLate),
      submissionFile,
      approvalStatus: assignment.requireAdminApproval ? "pending" : "not_required",
      submittedByAdmin: true,
      adminSubmittedBy: admin._id,
      adminSubmittedAt: now,
      lastAdminModifiedBy: admin._id,
      lastAdminModifiedAt: now,
      adminActivity: [
        {
          action: "uploaded",
          performedBy: admin._id,
          performedAt: now,
          note: adminNote,
          changes: {
            file: submissionFile?.originalName || null,
            answers: answers.length,
          },
        },
      ],
    });
  } catch (err) {
    // Never leave an orphaned file behind if the record could not be saved
    // (e.g. a duplicate created by a concurrent request → unique index).
    if (submissionFile?.public_id) await deletePdfFromCloudinary(submissionFile.public_id);
    if (err?.code === 11000) {
      throw new ApiError(409, "This learner already has a submission for this assessment");
    }
    throw err;
  }

  if (answers.length) {
    const answerDocs = await Answer.insertMany(
      answers.map((a) => ({
        questionId: a.questionId,
        submissionId: submission._id,
        textAnswer: a.textAnswer,
        selectedOption: a.selectedOption,
      })),
    );
    submission.answers = answerDocs.map((a) => a._id);
    await applyAutoGrading(submission, assignment, answerDocs);
    await submission.save();
  }

  await auditService.log({
    action: "ADMIN_SUBMISSION_UPLOADED",
    entity: "Submission",
    entityId: submission._id,
    performedBy: admin._id,
    details: `Uploaded submission for ${learnerLabel(student)} on "${assignment.title}"`,
    changes: {
      assignmentId: String(assignment._id),
      studentId: String(student._id),
      file: submissionFile?.originalName || null,
      answers: answers.length,
      note: adminNote,
    },
  });

  return populateForResponse(submission._id);
};

// ── Edit / replace ────────────────────────────────────────────────────────

export const adminUpdateSubmissionService = async (
  id,
  { answers: rawAnswers, isLate, note, resetGrading, file },
  admin,
) => {
  if (!isObjectId(String(id || ""))) throw new ApiError(400, "Invalid submission id");
  const submission = await Submission.findById(id).populate(
    "studentId",
    "name firstName middleName lastName email",
  );
  if (!submission) throw new ApiError(404, "Submission not found");

  const assignment = await loadAssignment(submission.assignmentId);
  assertValidPdf(file);
  const answers = parseAnswers(rawAnswers, assignment);
  const adminNote = cleanNote(note);
  const doReset = parseBool(resetGrading);

  // Work out what actually changes.
  const existingAnswers = await Answer.find({ submissionId: submission._id });
  const existingByQ = new Map(existingAnswers.map((a) => [String(a.questionId), a]));
  const answerChanges = (answers || []).filter((a) => {
    const cur = existingByQ.get(a.questionId);
    if (!cur) return Boolean(a.textAnswer.trim() || a.selectedOption);
    return (cur.textAnswer || "") !== a.textAnswer || (cur.selectedOption || "") !== a.selectedOption;
  });
  const lateProvided = isProvided(isLate);
  const lateChanged = lateProvided && parseBool(isLate) !== Boolean(submission.isLate);
  const contentChanged = Boolean(file) || answerChanges.length > 0;

  if (!contentChanged && !lateChanged && !doReset && !adminNote) {
    throw new ApiError(400, "No changes were provided");
  }

  // Result must still contain some content.
  if (!file && !submission.submissionFile?.url) {
    const merged = new Map(
      existingAnswers.map((a) => [
        String(a.questionId),
        { textAnswer: a.textAnswer || "", selectedOption: a.selectedOption || "" },
      ]),
    );
    for (const a of answers || []) merged.set(a.questionId, a);
    if (!hasAnyAnswer([...merged.values()])) {
      throw new ApiError(400, "A submission must keep a PDF file or at least one answer");
    }
  }

  // Snapshot the previous version before any content change (same
  // convention as learner resubmission).
  if (contentChanged) {
    const f = submission.submissionFile;
    submission.submissionHistory = submission.submissionHistory || [];
    submission.submissionHistory.push({
      submittedAt: submission.updatedAt || submission.createdAt || new Date(),
      submissionFile: f?.url
        ? { url: f.url, public_id: f.public_id, originalName: f.originalName }
        : undefined,
      totalScore: submission.totalScore,
      feedback: submission.feedback,
      status: submission.status,
    });
  }

  const previousFile = submission.submissionFile?.public_id
    ? {
        url: submission.submissionFile.url,
        public_id: submission.submissionFile.public_id,
        originalName: submission.submissionFile.originalName,
      }
    : null;
  const newFile = file ? await uploadPdf(file) : null;

  try {
    if (newFile) submission.submissionFile = newFile;
    if (lateProvided) submission.isLate = parseBool(isLate);
    if (doReset) resetGradingState(submission, assignment);

    const now = new Date();
    submission.lastAdminModifiedBy = admin._id;
    submission.lastAdminModifiedAt = now;
    submission.adminActivity.push({
      action: newFile ? "file_replaced" : "edited",
      performedBy: admin._id,
      performedAt: now,
      note: adminNote,
      gradingReset: doReset,
      changes: {
        fileReplaced: Boolean(newFile),
        previousFile: newFile ? previousFile?.originalName || null : undefined,
        newFile: newFile?.originalName,
        answersChanged: answerChanges.length,
        isLate: lateChanged ? submission.isLate : undefined,
      },
    });

    // Validate the submission BEFORE touching Answer documents so a
    // rejected update never leaves answers half-changed.
    await submission.validate();

    // Apply answer edits (only the questions that were sent).
    for (const a of answerChanges) {
      const cur = existingByQ.get(a.questionId);
      if (cur) {
        cur.textAnswer = a.textAnswer;
        cur.selectedOption = a.selectedOption;
        await cur.save();
      } else {
        const created = await Answer.create({
          questionId: a.questionId,
          submissionId: submission._id,
          textAnswer: a.textAnswer,
          selectedOption: a.selectedOption,
        });
        existingByQ.set(a.questionId, created);
        submission.answers.push(created._id);
      }
    }

    // Reset → clear per-answer marks / AI suggestions, then re-apply the
    // same instant auto-grading a learner submission gets.
    if (doReset && existingByQ.size) {
      await Answer.updateMany(
        { submissionId: submission._id },
        {
          marksAwarded: null,
          isCorrect: null,
          aiSuggestedMarks: null,
          aiSuggestedFeedback: "",
          aiSuggestedCorrect: null,
        },
      );
      await applyAutoGrading(submission, assignment, [...existingByQ.values()]);
    }

    await submission.save();
  } catch (err) {
    // DB update failed → remove the freshly uploaded file, keep the old one.
    if (newFile?.public_id) await deletePdfFromCloudinary(newFile.public_id);
    throw err;
  }

  // Only now that the record points at the new file, remove the old one.
  if (newFile && previousFile?.public_id && previousFile.public_id !== newFile.public_id) {
    await deletePdfFromCloudinary(previousFile.public_id);
  }

  await auditService.log({
    action: newFile ? "ADMIN_SUBMISSION_FILE_REPLACED" : "ADMIN_SUBMISSION_EDITED",
    entity: "Submission",
    entityId: submission._id,
    performedBy: admin._id,
    details: `${newFile ? "Replaced file on" : "Edited"} submission of ${learnerLabel(
      submission.studentId,
    )} on "${assignment.title}"${doReset ? " (grading reset)" : ""}`,
    changes: {
      fileReplaced: Boolean(newFile),
      previousFile: previousFile?.originalName || null,
      newFile: newFile?.originalName || null,
      answersChanged: answerChanges.length,
      isLate: lateChanged ? submission.isLate : undefined,
      gradingReset: doReset,
      note: adminNote,
    },
  });

  return populateForResponse(submission._id);
};

// ── Delete ────────────────────────────────────────────────────────────────

export const adminDeleteSubmissionService = async (id, { confirm, reason } = {}, admin) => {
  if (!isObjectId(String(id || ""))) throw new ApiError(400, "Invalid submission id");
  if (!parseBool(confirm)) {
    throw new ApiError(400, "Deletion must be explicitly confirmed");
  }

  const submission = await Submission.findById(id)
    .populate("studentId", "name firstName middleName lastName email")
    .populate("assignmentId", "title")
    .lean();
  if (!submission) throw new ApiError(404, "Submission not found");

  const cleanReason = cleanNote(reason);
  const answersCount = await Answer.countDocuments({ submissionId: submission._id });

  // Same deletion convention as assignmentService.deleteAssignmentService:
  // Answer docs → Submission → stored file(s). Certificates, course
  // progress and registrations are separate records and are not touched.
  await Answer.deleteMany({ submissionId: submission._id });
  await Submission.deleteOne({ _id: submission._id });

  const publicIds = new Set(
    [
      submission.submissionFile?.public_id,
      ...(submission.submissionHistory || []).map((h) => h?.submissionFile?.public_id),
    ].filter(Boolean),
  );
  for (const pid of publicIds) await deletePdfFromCloudinary(pid);

  await auditService.log({
    action: "ADMIN_SUBMISSION_DELETED",
    entity: "Submission",
    entityId: submission._id,
    performedBy: admin._id,
    details: `Deleted submission of ${learnerLabel(submission.studentId)} on "${
      submission.assignmentId?.title || "deleted assessment"
    }"${cleanReason ? ` — reason: ${cleanReason}` : ""}`,
    changes: {
      snapshot: {
        assignmentId: String(submission.assignmentId?._id || submission.assignmentId || ""),
        assignmentTitle: submission.assignmentId?.title || "",
        studentId: String(submission.studentId?._id || submission.studentId || ""),
        studentEmail: submission.studentId?.email || "",
        status: submission.status,
        totalScore: submission.totalScore,
        passFail: submission.passFail,
        approvalStatus: submission.approvalStatus,
        isLate: submission.isLate,
        file: submission.submissionFile?.originalName || null,
        answers: answersCount,
        submittedByAdmin: Boolean(submission.submittedByAdmin),
        createdAt: submission.createdAt,
      },
      reason: cleanReason,
    },
  });

  return {
    _id: submission._id,
    learner: deriveFullName(submission.studentId) || submission.studentId?.email || "",
    assessment: submission.assignmentId?.title || "",
  };
};

export default {
  listEligibleLearnersService,
  adminCreateSubmissionService,
  adminUpdateSubmissionService,
  adminDeleteSubmissionService,
};
