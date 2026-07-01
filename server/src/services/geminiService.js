// import { GoogleGenerativeAI } from "@google/generative-ai";
// import ApiError from "../utils/ApiError.js";

// /**
//  * geminiService
//  * ─────────────────────────────────────────────────────────────
//  * Wraps Gemini 1.5 Pro for AI auto-checking of Scenario Exam
//  * submissions.
//  *
//  *  - fetchPdfAsInlinePart(url)
//  *      Downloads a PDF from a (Cloudinary) URL and converts it
//  *      into the inline base64 part shape Gemini expects.
//  *
//  *  - checkScenarioAnswers(scenarioPdfUrl, subQuestions, subAnswers)
//  *      Builds the evaluation prompt, sends the PDF + questions +
//  *      student answers to Gemini 1.5 Pro, parses the JSON response
//  *      and enforces the feedback character limit server-side.
//  *
//  * Env vars used:
//  *   GEMINI_API_KEY                — required, your Google AI key
//  *   GEMINI_FEEDBACK_CHAR_LIMIT    — optional, default 500
//  */

// /* ── Config ──────────────────────────────────────────────────── */

// const FEEDBACK_CHAR_LIMIT =
//   Number(process.env.GEMINI_FEEDBACK_CHAR_LIMIT) || 500;

// const GEMINI_MODEL = "gemini-2.5-flash";

// /**
//  * Lazily create the Gemini client so the server can still boot
//  * even if the key is missing — the error only surfaces when an
//  * admin actually triggers an AI check.
//  */
// const getModel = () => {
//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) {
//     throw new ApiError(
//       500,
//       "GEMINI_API_KEY is not configured on the server"
//     );
//   }
//   const genAI = new GoogleGenerativeAI(apiKey);
//   return genAI.getGenerativeModel({ model: GEMINI_MODEL });
// };

// /* ── Helpers ─────────────────────────────────────────────────── */

// /**
//  * Truncate a string to the feedback character limit.
//  * @param {string} text
//  * @returns {string}
//  */
// const enforceCharLimit = (text = "") => {
//   const str = String(text || "");
//   if (str.length <= FEEDBACK_CHAR_LIMIT) return str;
//   return str.slice(0, FEEDBACK_CHAR_LIMIT);
// };

// /**
//  * Strip markdown code fences (```json ... ```) that Gemini
//  * sometimes adds despite being told not to.
//  * @param {string} raw
//  * @returns {string}
//  */
// const stripCodeFences = (raw = "") =>
//   String(raw)
//     .replace(/^\s*```(?:json)?/i, "")
//     .replace(/```\s*$/i, "")
//     .trim();

// /**
//  * fetchPdfAsInlinePart
//  * Downloads a PDF and returns the Gemini inlineData part.
//  * @param {string} url - publicly reachable PDF URL (Cloudinary)
//  * @returns {Promise<{ inlineData: { data: string, mimeType: string } }>}
//  */
// export const fetchPdfAsInlinePart = async (url) => {
//   if (!url || !String(url).trim()) {
//     throw new ApiError(400, "scenarioPdfUrl is missing for a scenario");
//   }

//   let response;
//   try {
//     response = await fetch(url);
//   } catch (err) {
//     throw new ApiError(
//       502,
//       `Failed to download scenario PDF: ${err.message}`
//     );
//   }

//   if (!response.ok) {
//     throw new ApiError(
//       502,
//       `Failed to download scenario PDF (HTTP ${response.status})`
//     );
//   }

//   const arrayBuffer = await response.arrayBuffer();
//   const base64 = Buffer.from(arrayBuffer).toString("base64");

//   return {
//     inlineData: {
//       data: base64,
//       mimeType: "application/pdf",
//     },
//   };
// };

// /**
//  * buildPrompt
//  * Constructs the text instruction sent alongside the PDF.
//  * @param {Array} subQuestions - [{ _id, questionText, maxMarks }]
//  * @param {Array} subAnswers   - [{ subQuestionId, answerText }]
//  * @returns {string}
//  */
// const buildPrompt = (subQuestions, subAnswers) => {
//   // Map answers by subQuestionId for quick lookup
//   const answerMap = new Map(
//     (subAnswers || []).map((sa) => [String(sa.subQuestionId), sa])
//   );

//   const questionBlocks = (subQuestions || [])
//     .map((sq, idx) => {
//       const ans = answerMap.get(String(sq._id));
//       const answerText =
//         ans && ans.answerText && ans.answerText.trim()
//           ? ans.answerText.trim()
//           : "(No answer provided by the student)";

//       return [
//         `Sub-question ${idx + 1}:`,
//         `  subQuestionId: ${sq._id}`,
//         `  questionText: ${sq.questionText}`,
//         `  maxMarks: ${sq.maxMarks}`,
//         `  studentAnswer: ${answerText}`,
//       ].join("\n");
//     })
//     .join("\n\n");

//   return [
//     "You are an expert exam evaluator for a Learning Management System.",
//     "",
//     "STEP 1: Carefully read the attached PDF document. It contains a scenario / case study that the student was asked to read before answering the sub-questions below.",
//     "",
//     "STEP 2: For EACH sub-question, evaluate the student's answer strictly against the scenario content in the PDF.",
//     "",
//     "For each sub-question you must decide:",
//     "  - marksObtained: an integer or decimal between 0 and that sub-question's maxMarks. Never exceed maxMarks. Never go below 0.",
//     "  - isCorrect: true if the answer is substantially correct, false otherwise.",
//     `  - feedbackText: a concise explanation of what was right and wrong, plus the correct answer. MUST be under ${FEEDBACK_CHAR_LIMIT} characters.`,
//     "",
//     "Here are the sub-questions and the student's answers:",
//     "",
//     questionBlocks,
//     "",
//     "RESPONSE FORMAT:",
//     "Return ONLY valid JSON. No markdown, no code fences, no commentary before or after.",
//     "The JSON must match EXACTLY this shape:",
//     '{ "results": [ { "subQuestionId": "...", "marksObtained": 0, "isCorrect": false, "feedbackText": "..." } ] }',
//     "",
//     "There must be exactly one results entry per sub-question, and each subQuestionId must match the ids given above.",
//   ].join("\n");
// };

// /**
//  * checkScenarioAnswers
//  * Sends one scenario (PDF + sub-questions + student answers) to
//  * Gemini 1.5 Pro and returns the parsed, char-limited results.
//  *
//  * @param {string} scenarioPdfUrl
//  * @param {Array}  subQuestions - [{ _id, questionText, maxMarks }]
//  * @param {Array}  subAnswers   - [{ subQuestionId, answerText }]
//  * @returns {Promise<Array<{ subQuestionId, marksObtained, isCorrect, feedbackText }>>}
//  */
// export const checkScenarioAnswers = async (
//   scenarioPdfUrl,
//   subQuestions = [],
//   subAnswers = []
// ) => {
//   if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
//     throw new ApiError(400, "Scenario has no sub-questions to evaluate");
//   }

//   const model = getModel();

//   // 1. Download + encode the PDF
//   const pdfPart = await fetchPdfAsInlinePart(scenarioPdfUrl);

//   // 2. Build the prompt
//   const promptText = buildPrompt(subQuestions, subAnswers);

//   // 3. Call Gemini
//   let rawText;
//   try {
//     const result = await model.generateContent([
//       pdfPart,
//       { text: promptText },
//     ]);
//     rawText = result.response.text();
//   } catch (err) {
//     throw new ApiError(
//       502,
//       `Gemini request failed: ${err.message}`
//     );
//   }

//   // 4. Parse JSON (strip code fences first if present)
//   let parsed;
//   try {
//     parsed = JSON.parse(stripCodeFences(rawText));
//   } catch (err) {
//     throw new ApiError(
//       502,
//       "Gemini returned a non-JSON response — please review this scenario manually."
//     );
//   }

//   if (!parsed || !Array.isArray(parsed.results)) {
//     throw new ApiError(
//       502,
//       "Gemini response did not contain a valid 'results' array."
//     );
//   }

//   // 5. Normalise + enforce limits per sub-question
//   //    We iterate over the known subQuestions so the output is
//   //    always complete and correctly keyed, even if Gemini
//   //    omitted or reordered something.
//   const resultMap = new Map(
//     parsed.results.map((r) => [String(r.subQuestionId), r])
//   );

//   return subQuestions.map((sq) => {
//     const maxMarks = Number(sq.maxMarks) || 0;
//     const aiRes = resultMap.get(String(sq._id)) || {};

//     // Clamp marks to [0, maxMarks]
//     let marks = Number(aiRes.marksObtained);
//     if (Number.isNaN(marks)) marks = 0;
//     marks = Math.max(0, Math.min(marks, maxMarks));

//     return {
//       subQuestionId: String(sq._id),
//       marksObtained: marks,
//       isCorrect: aiRes.isCorrect === true,
//       feedbackText: enforceCharLimit(aiRes.feedbackText || ""),
//     };
//   });
// };

// export { FEEDBACK_CHAR_LIMIT };





import { GoogleGenerativeAI } from "@google/generative-ai";
import ApiError from "../utils/ApiError.js";

/**
 * geminiService
 * ─────────────────────────────────────────────────────────────
 * Wraps Gemini 1.5 Pro for AI auto-checking of Scenario Exam
 * submissions.
 *
 *  - fetchPdfAsInlinePart(url)
 *      Downloads a PDF from a (Cloudinary) URL and converts it
 *      into the inline base64 part shape Gemini expects.
 *
 *  - checkScenarioAnswers(scenarioPdfUrl, subQuestions, subAnswers)
 *      Builds the evaluation prompt, sends the PDF + questions +
 *      student answers to Gemini 1.5 Pro, parses the JSON response
 *      and enforces the feedback character limit server-side.
 *
 * Env vars used:
 *   GEMINI_API_KEY                — required, your Google AI key
 *   GEMINI_FEEDBACK_CHAR_LIMIT    — optional, default 500
 */

/* ── Config ──────────────────────────────────────────────────── */

const FEEDBACK_CHAR_LIMIT =
  Number(process.env.GEMINI_FEEDBACK_CHAR_LIMIT) || 500;

const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Lazily create the Gemini client so the server can still boot
 * even if the key is missing — the error only surfaces when an
 * admin actually triggers an AI check.
 */
const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(
      500,
      "GEMINI_API_KEY is not configured on the server"
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
};

/* ── Helpers ─────────────────────────────────────────────────── */

/**
 * Truncate a string to the feedback character limit.
 * @param {string} text
 * @returns {string}
 */
const enforceCharLimit = (text = "") => {
  const str = String(text || "");
  if (str.length <= FEEDBACK_CHAR_LIMIT) return str;
  return str.slice(0, FEEDBACK_CHAR_LIMIT);
};

/**
 * Generic version of enforceCharLimit that accepts an explicit limit.
 * Used only by the new Assessment AI-grading functions below so the
 * original scenario-exam FEEDBACK_CHAR_LIMIT behaviour is untouched.
 */
const enforceCharLimitGeneric = (text = "", limit = FEEDBACK_CHAR_LIMIT) => {
  const str = String(text || "");
  if (str.length <= limit) return str;
  return str.slice(0, limit);
};

/**
 * Strip markdown code fences (```json ... ```) that Gemini
 * sometimes adds despite being told not to.
 * @param {string} raw
 * @returns {string}
 */
const stripCodeFences = (raw = "") =>
  String(raw)
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();

/**
 * fetchPdfAsInlinePart
 * Downloads a PDF and returns the Gemini inlineData part.
 * @param {string} url - publicly reachable PDF URL (Cloudinary)
 * @returns {Promise<{ inlineData: { data: string, mimeType: string } }>}
 */
export const fetchPdfAsInlinePart = async (url) => {
  if (!url || !String(url).trim()) {
    throw new ApiError(400, "scenarioPdfUrl is missing for a scenario");
  }

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new ApiError(
      502,
      `Failed to download scenario PDF: ${err.message}`
    );
  }

  if (!response.ok) {
    throw new ApiError(
      502,
      `Failed to download scenario PDF (HTTP ${response.status})`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return {
    inlineData: {
      data: base64,
      mimeType: "application/pdf",
    },
  };
};

/**
 * buildPrompt
 * Constructs the text instruction sent alongside the PDF.
 * @param {Array} subQuestions - [{ _id, questionText, maxMarks }]
 * @param {Array} subAnswers   - [{ subQuestionId, answerText }]
 * @returns {string}
 */
const buildPrompt = (subQuestions, subAnswers) => {
  // Map answers by subQuestionId for quick lookup
  const answerMap = new Map(
    (subAnswers || []).map((sa) => [String(sa.subQuestionId), sa])
  );

  const questionBlocks = (subQuestions || [])
    .map((sq, idx) => {
      const ans = answerMap.get(String(sq._id));
      const answerText =
        ans && ans.answerText && ans.answerText.trim()
          ? ans.answerText.trim()
          : "(No answer provided by the student)";

      return [
        `Sub-question ${idx + 1}:`,
        `  subQuestionId: ${sq._id}`,
        `  questionText: ${sq.questionText}`,
        `  maxMarks: ${sq.maxMarks}`,
        `  studentAnswer: ${answerText}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    "You are an expert exam evaluator for a Learning Management System.",
    "",
    "STEP 1: Carefully read the attached PDF document. It contains a scenario / case study that the student was asked to read before answering the sub-questions below.",
    "",
    "STEP 2: For EACH sub-question, evaluate the student's answer strictly against the scenario content in the PDF.",
    "",
    "For each sub-question you must decide:",
    "  - marksObtained: an integer or decimal between 0 and that sub-question's maxMarks. Never exceed maxMarks. Never go below 0.",
    "  - isCorrect: true if the answer is substantially correct, false otherwise.",
    `  - feedbackText: a concise explanation of what was right and wrong, plus the correct answer. MUST be under ${FEEDBACK_CHAR_LIMIT} characters.`,
    "",
    "Here are the sub-questions and the student's answers:",
    "",
    questionBlocks,
    "",
    "RESPONSE FORMAT:",
    "Return ONLY valid JSON. No markdown, no code fences, no commentary before or after.",
    "The JSON must match EXACTLY this shape:",
    '{ "results": [ { "subQuestionId": "...", "marksObtained": 0, "isCorrect": false, "feedbackText": "..." } ] }',
    "",
    "There must be exactly one results entry per sub-question, and each subQuestionId must match the ids given above.",
  ].join("\n");
};

/**
 * checkScenarioAnswers
 * Sends one scenario (PDF + sub-questions + student answers) to
 * Gemini 1.5 Pro and returns the parsed, char-limited results.
 *
 * @param {string} scenarioPdfUrl
 * @param {Array}  subQuestions - [{ _id, questionText, maxMarks }]
 * @param {Array}  subAnswers   - [{ subQuestionId, answerText }]
 * @returns {Promise<Array<{ subQuestionId, marksObtained, isCorrect, feedbackText }>>}
 */
export const checkScenarioAnswers = async (
  scenarioPdfUrl,
  subQuestions = [],
  subAnswers = []
) => {
  if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
    throw new ApiError(400, "Scenario has no sub-questions to evaluate");
  }

  const model = getModel();

  // 1. Download + encode the PDF
  const pdfPart = await fetchPdfAsInlinePart(scenarioPdfUrl);

  // 2. Build the prompt
  const promptText = buildPrompt(subQuestions, subAnswers);

  // 3. Call Gemini
  let rawText;
  try {
    const result = await model.generateContent([
      pdfPart,
      { text: promptText },
    ]);
    rawText = result.response.text();
  } catch (err) {
    throw new ApiError(
      502,
      `Gemini request failed: ${err.message}`
    );
  }

  // 4. Parse JSON (strip code fences first if present)
  let parsed;
  try {
    parsed = JSON.parse(stripCodeFences(rawText));
  } catch (err) {
    throw new ApiError(
      502,
      "Gemini returned a non-JSON response — please review this scenario manually."
    );
  }

  if (!parsed || !Array.isArray(parsed.results)) {
    throw new ApiError(
      502,
      "Gemini response did not contain a valid 'results' array."
    );
  }

  // 5. Normalise + enforce limits per sub-question
  //    We iterate over the known subQuestions so the output is
  //    always complete and correctly keyed, even if Gemini
  //    omitted or reordered something.
  const resultMap = new Map(
    parsed.results.map((r) => [String(r.subQuestionId), r])
  );

  return subQuestions.map((sq) => {
    const maxMarks = Number(sq.maxMarks) || 0;
    const aiRes = resultMap.get(String(sq._id)) || {};

    // Clamp marks to [0, maxMarks]
    let marks = Number(aiRes.marksObtained);
    if (Number.isNaN(marks)) marks = 0;
    marks = Math.max(0, Math.min(marks, maxMarks));

    return {
      subQuestionId: String(sq._id),
      marksObtained: marks,
      isCorrect: aiRes.isCorrect === true,
      feedbackText: enforceCharLimit(aiRes.feedbackText || ""),
    };
  });
};

export { FEEDBACK_CHAR_LIMIT };

/* ════════════════════════════════════════════════════════════════
 * ASSESSMENT & ASSIGNMENT MODULE — AI Grading (additive)
 * ────────────────────────────────────────────────────────────────
 * Reuses the same Gemini client/model and JSON-parsing helpers as
 * checkScenarioAnswers above. Does NOT modify any scenario-exam
 * behaviour. Two new entry points:
 *
 *  - gradeWrittenAnswers(...)  → MODULE 5: POST .../ai-grade-text
 *  - reviewProjectSubmission() → MODULE 5: POST .../ai-review-project
 *
 * Both return a draft only — nothing here writes to the database.
 * The service layer (submissionService) decides how to persist the
 * draft (Submission.aiDraft) and only the admin's explicit "accept"
 * action ever moves AI numbers into the real grade.
 * ════════════════════════════════════════════════════════════════ */

const ASSESSMENT_FEEDBACK_CHAR_LIMIT =
  Number(process.env.GEMINI_ASSESSMENT_FEEDBACK_CHAR_LIMIT) || 800;

/**
 * buildWrittenGradingPrompt
 * @param {Array} questions - [{ _id, prompt, marks, rubric, correctAnswer }]
 * @param {Array} answers   - [{ questionId, textAnswer }]
 * @param {string} gradingPrompt - admin-supplied grading instructions
 * @param {string} answerKey - admin-supplied free-text answer key (optional)
 * @param {boolean} useAnswerKeyForGrading
 */
const buildWrittenGradingPrompt = (
  questions,
  answers,
  { gradingPrompt, answerKey, useAnswerKeyForGrading } = {}
) => {
  const answerMap = new Map(
    (answers || []).map((a) => [String(a.questionId), a])
  );

  const questionBlocks = (questions || [])
    .map((q, idx) => {
      const ans = answerMap.get(String(q._id));
      const answerText =
        ans && ans.textAnswer && ans.textAnswer.trim()
          ? ans.textAnswer.trim()
          : "(No answer provided by the student)";

      return [
        `Question ${idx + 1}:`,
        `  questionId: ${q._id}`,
        `  prompt: ${q.prompt}`,
        `  maxMarks: ${q.marks}`,
        q.rubric ? `  rubric: ${q.rubric}` : null,
        q.correctAnswer ? `  referenceAnswer: ${q.correctAnswer}` : null,
        `  studentAnswer: ${answerText}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return [
    "You are an expert assessment grader for a Learning Management System.",
    "",
    gradingPrompt
      ? `Grading instructions from the instructor: ${gradingPrompt}`
      : "Grade fairly and consistently based on the rubric / reference answer provided per question.",
    useAnswerKeyForGrading && answerKey
      ? `\nUse this answer key as the authoritative source of correctness:\n${answerKey}\n`
      : "",
    "",
    "For EACH question below, evaluate the student's answer and decide:",
    "  - marksAwarded: a number between 0 and that question's maxMarks. Never exceed maxMarks. Never go below 0.",
    "  - isCorrect: true if substantially correct, false otherwise.",
    `  - feedbackText: concise, specific feedback. MUST be under ${ASSESSMENT_FEEDBACK_CHAR_LIMIT} characters.`,
    "",
    "Questions and student answers:",
    "",
    questionBlocks,
    "",
    "Also provide:",
    "  - overallFeedback: 2-4 sentence summary of overall performance.",
    "  - suggestedPass: true/false, your recommendation on whether this submission should pass.",
    "",
    "RESPONSE FORMAT:",
    "Return ONLY valid JSON, no markdown, no code fences, no commentary.",
    "Match EXACTLY this shape:",
    '{ "questionGrades": [ { "questionId": "...", "marksAwarded": 0, "isCorrect": false, "feedbackText": "..." } ], "overallFeedback": "...", "suggestedPass": false }',
    "",
    "There must be exactly one questionGrades entry per question, with matching questionId values.",
  ]
    .filter((line) => line !== "")
    .join("\n");
};

/**
 * gradeWrittenAnswers
 * MODULE 5 — AI grading for written_assessment / general text-answer
 * submissions. Pure text evaluation (no file/PDF involved).
 *
 * @param {Array}  questions - [{ _id, prompt, marks, rubric, correctAnswer }]
 * @param {Array}  answers   - [{ questionId, textAnswer }]
 * @param {Object} options   - { gradingPrompt, answerKey, useAnswerKeyForGrading }
 * @returns {Promise<{questionGrades: Array, overallFeedback: string, suggestedPass: boolean}>}
 */
export const gradeWrittenAnswers = async (
  questions = [],
  answers = [],
  options = {}
) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "This assignment has no questions to AI-grade");
  }

  const model = getModel();
  const promptText = buildWrittenGradingPrompt(questions, answers, options);

  let rawText;
  try {
    const result = await model.generateContent([{ text: promptText }]);
    rawText = result.response.text();
  } catch (err) {
    throw new ApiError(502, `Gemini request failed: ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(stripCodeFences(rawText));
  } catch {
    throw new ApiError(
      502,
      "Gemini returned a non-JSON response — please review this submission manually."
    );
  }

  if (!parsed || !Array.isArray(parsed.questionGrades)) {
    throw new ApiError(
      502,
      "Gemini response did not contain a valid 'questionGrades' array."
    );
  }

  const gradeMap = new Map(
    parsed.questionGrades.map((g) => [String(g.questionId), g])
  );

  const questionGrades = questions.map((q) => {
    const maxMarks = Number(q.marks) || 0;
    const aiRes = gradeMap.get(String(q._id)) || {};

    let marks = Number(aiRes.marksAwarded);
    if (Number.isNaN(marks)) marks = 0;
    marks = Math.max(0, Math.min(marks, maxMarks));

    return {
      questionId: String(q._id),
      marksAwarded: marks,
      isCorrect: aiRes.isCorrect === true,
      feedbackText: enforceCharLimitGeneric(
        aiRes.feedbackText || "",
        ASSESSMENT_FEEDBACK_CHAR_LIMIT
      ),
    };
  });

  const score = questionGrades.reduce((sum, g) => sum + g.marksAwarded, 0);

  return {
    questionGrades,
    overallFeedback: enforceCharLimitGeneric(
      parsed.overallFeedback || "",
      ASSESSMENT_FEEDBACK_CHAR_LIMIT
    ),
    suggestedPass: parsed.suggestedPass === true,
    score,
  };
};

/**
 * reviewProjectSubmission
 * MODULE 5 — AI review for project_submission assignments where the
 * student uploaded a file (PDF). Reuses fetchPdfAsInlinePart so the
 * same download/Cloudinary handling as scenario exams applies.
 *
 * @param {string} fileUrl - Cloudinary URL of the submitted file (PDF)
 * @param {Object} options - { gradingPrompt, answerKey, useAnswerKeyForGrading, totalMarks }
 * @returns {Promise<{overallFeedback: string, suggestedPass: boolean, score: number}>}
 */
export const reviewProjectSubmission = async (fileUrl, options = {}) => {
  const { gradingPrompt, answerKey, useAnswerKeyForGrading, totalMarks } =
    options;

  if (!fileUrl) {
    throw new ApiError(
      400,
      "This submission has no uploaded file for AI to review"
    );
  }

  const model = getModel();
  const filePart = await fetchPdfAsInlinePart(fileUrl);
  const maxMarks = Number(totalMarks) || 100;

  const promptText = [
    "You are an expert project/assignment reviewer for a Learning Management System.",
    "",
    "STEP 1: Carefully read the attached document — it is the student's project submission.",
    "",
    gradingPrompt
      ? `Grading instructions from the instructor: ${gradingPrompt}`
      : "Evaluate the overall quality, completeness, and correctness of the work.",
    useAnswerKeyForGrading && answerKey
      ? `\nUse this answer key / model solution as the authoritative reference:\n${answerKey}\n`
      : "",
    "",
    `STEP 2: Award a score out of ${maxMarks} and decide whether you recommend this submission to pass.`,
    "",
    "RESPONSE FORMAT:",
    "Return ONLY valid JSON, no markdown, no code fences, no commentary.",
    "Match EXACTLY this shape:",
    `{ "score": 0, "suggestedPass": false, "overallFeedback": "..." }`,
    `overallFeedback must be under ${ASSESSMENT_FEEDBACK_CHAR_LIMIT} characters.`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  let rawText;
  try {
    const result = await model.generateContent([
      filePart,
      { text: promptText },
    ]);
    rawText = result.response.text();
  } catch (err) {
    throw new ApiError(502, `Gemini request failed: ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(stripCodeFences(rawText));
  } catch {
    throw new ApiError(
      502,
      "Gemini returned a non-JSON response — please review this submission manually."
    );
  }

  let score = Number(parsed?.score);
  if (Number.isNaN(score)) score = 0;
  score = Math.max(0, Math.min(score, maxMarks));

  return {
    score,
    suggestedPass: parsed?.suggestedPass === true,
    overallFeedback: enforceCharLimitGeneric(
      parsed?.overallFeedback || "",
      ASSESSMENT_FEEDBACK_CHAR_LIMIT
    ),
  };
};
