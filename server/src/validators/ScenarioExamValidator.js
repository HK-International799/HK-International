import ApiError from "../utils/ApiError.js";

/* ── Validators for Scenario Exam payloads ───────────────────────────── */

const ALLOWED_FIELD_TYPES = [
  "text",
  "textarea",
  "radio",
  "checkbox",
  "dropdown",
  "number",
  "file",
];

export const validateExamPayload = (payload = {}, { partial = false } = {}) => {
  const { title, duration, passingScore, allowReattempt, description, status } =
    payload;

  if (!partial || title !== undefined) {
    if (!title || typeof title !== "string" || !title.trim()) {
      throw new ApiError(400, "Title is required");
    }
  }

  if (!partial || duration !== undefined) {
    if (
      duration === undefined ||
      duration === null ||
      Number.isNaN(Number(duration)) ||
      Number(duration) < 1
    ) {
      throw new ApiError(400, "Duration (in minutes) must be a positive number");
    }
  }

  if (passingScore !== undefined && Number.isNaN(Number(passingScore))) {
    throw new ApiError(400, "passingScore must be a number");
  }

  if (
    allowReattempt !== undefined &&
    typeof allowReattempt !== "boolean"
  ) {
    throw new ApiError(400, "allowReattempt must be boolean");
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    throw new ApiError(400, "description must be a string");
  }

  if (
    status !== undefined &&
    !["draft", "published", "archived"].includes(status)
  ) {
    throw new ApiError(400, "Invalid exam status");
  }
};

export const validateFormSchema = (formSchema) => {
  if (!Array.isArray(formSchema)) {
    throw new ApiError(400, "formSchema must be an array");
  }
  const seenIds = new Set();
  for (const [idx, field] of formSchema.entries()) {
    if (!field || typeof field !== "object") {
      throw new ApiError(400, `formSchema[${idx}] must be an object`);
    }
    if (!field.fieldId || typeof field.fieldId !== "string") {
      throw new ApiError(400, `formSchema[${idx}].fieldId is required`);
    }
    if (seenIds.has(field.fieldId)) {
      throw new ApiError(400, `Duplicate fieldId: ${field.fieldId}`);
    }
    seenIds.add(field.fieldId);

    if (!field.label || typeof field.label !== "string") {
      throw new ApiError(400, `formSchema[${idx}].label is required`);
    }
    if (!ALLOWED_FIELD_TYPES.includes(field.type)) {
      throw new ApiError(
        400,
        `formSchema[${idx}].type must be one of: ${ALLOWED_FIELD_TYPES.join(", ")}`
      );
    }
    if (
      ["radio", "checkbox", "dropdown"].includes(field.type) &&
      (!Array.isArray(field.options) || field.options.length === 0)
    ) {
      throw new ApiError(
        400,
        `formSchema[${idx}] (${field.type}) requires non-empty options[]`
      );
    }
  }
};

export const validateQuestionPayload = (
  payload = {},
  { partial = false } = {}
) => {
  const { questionText, formSchema, maxMarks, questionNumber } = payload;

  if (!partial || questionText !== undefined) {
    if (
      !questionText ||
      typeof questionText !== "string" ||
      !questionText.trim()
    ) {
      throw new ApiError(400, "questionText is required");
    }
  }

  if (formSchema !== undefined) {
    validateFormSchema(formSchema);
  }

  if (maxMarks !== undefined && Number.isNaN(Number(maxMarks))) {
    throw new ApiError(400, "maxMarks must be a number");
  }

  if (
    questionNumber !== undefined &&
    Number.isNaN(Number(questionNumber))
  ) {
    throw new ApiError(400, "questionNumber must be a number");
  }
};

export const validateReviewPayload = (payload = {}) => {
  const { answers } = payload;
  if (!Array.isArray(answers)) {
    throw new ApiError(400, "answers array is required for review");
  }
  for (const [idx, a] of answers.entries()) {
    if (!a || typeof a !== "object") {
      throw new ApiError(400, `answers[${idx}] must be an object`);
    }
    if (!a.questionId) {
      throw new ApiError(400, `answers[${idx}].questionId is required`);
    }
    if (
      a.marksObtained !== undefined &&
      Number.isNaN(Number(a.marksObtained))
    ) {
      throw new ApiError(400, `answers[${idx}].marksObtained must be a number`);
    }
    if (a.isCorrect !== undefined && typeof a.isCorrect !== "boolean") {
      throw new ApiError(400, `answers[${idx}].isCorrect must be boolean`);
    }
  }
};
