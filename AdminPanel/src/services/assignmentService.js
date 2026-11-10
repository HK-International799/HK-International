



// import api from "./api";

// // ─── Assignments ─────────────────────────────────────────────

// export const getAllAssignments = async (params = {}) => {
//   const res = await api.get("/assignments", { params });
//   return res.data.data;
// };

// export const getAssignmentById = async (id) => {
//   const res = await api.get(`/assignments/${id}`);
//   return res.data.data;
// };

// export const createAssignment = async (payload) => {
//   const isFormData = payload instanceof FormData;
//   const res = await api.post("/assignments", payload, {
//     headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
//   });
//   return res.data.data;
// };

// export const updateAssignment = async (id, payload) => {
//   const isFormData = payload instanceof FormData;
//   const res = await api.put(`/assignments/${id}`, payload, {
//     headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
//   });
//   return res.data.data;
// };

// export const deleteAssignment = async (id) => {
//   const res = await api.delete(`/assignments/${id}`);
//   return res.data.data;
// };

// export const togglePublish = async (id) => {
//   const res = await api.patch(`/assignments/${id}/publish`);
//   return res.data.data;
// };


// // ─── Submissions ─────────────────────────────────────────────

// export const getSubmissions = async (params = {}) => {
//   const res = await api.get("/submissions", { params });
//   return res.data.data;
// };

// export const getSubmissionById = async (id) => {
//   const res = await api.get(`/submissions/${id}`);
//   return res.data.data;
// };

// /**
//  * Grade a submission.
//  * FIX: Now always sends documentAnnotations (even if empty array)
//  * so the backend correctly saves/clears annotations on grade.
//  */
// export const gradeSubmission = async (id, payload) => {
//   const body = {
//     totalScore: payload.totalScore,
//     feedback: payload.feedback || "",
//     questionGrades: payload.questionGrades || [],
//     reviewAnnotations: payload.reviewAnnotations || [],
//     // FIX: Include document annotations — use "annotations" key (matches Submission model field)
//     annotations: payload.documentAnnotations || payload.annotations || [],
//   };
//   const res = await api.put(`/submissions/${id}/grade`, body);
//   return res.data.data;
// };


// // ─── Annotations ─────────────────────────────────────────────

// /**
//  * Save document-level annotations independently (from the annotator modal
//  * "Save Annotations" button, separate from full grade submission).
//  */
// export const saveAnnotations = async (submissionId, annotations) => {
//   const res = await api.patch(
//     `/submissions/${submissionId}/annotations`,
//     { annotations }
//   );
//   return res.data.data;
// };

// // ─── MODULE 5 — AI Grading ─────────────────────────────────────

// export const aiGradeText = async (submissionId) => {
//   const res = await api.post(`/submissions/${submissionId}/ai-grade-text`);
//   return res.data.data;
// };

// export const aiReviewProject = async (submissionId) => {
//   const res = await api.post(`/submissions/${submissionId}/ai-review-project`);
//   return res.data.data;
// };

// // ─── MODULE 6 — Admin Submission Review actions ────────────────

// /**
//  * Accept the AI draft as the real grade.
//  * Pass no payload (or {}) for plain "Accept Draft".
//  * Pass { totalScore, feedback, questionGrades } for "Accept & Edit".
//  */
// export const acceptAiDraft = async (submissionId, payload = {}) => {
//   const res = await api.patch(`/submissions/${submissionId}/accept-ai-draft`, payload);
//   return res.data.data;
// };

// export const approveSubmission = async (submissionId) => {
//   const res = await api.patch(`/submissions/${submissionId}/approve`);
//   return res.data.data;
// };

// export const requestResubmission = async (submissionId, feedback) => {
//   const res = await api.patch(`/submissions/${submissionId}/request-resubmission`, {
//     feedback,
//   });
//   return res.data.data;
// };










import api from "./api";

// ─── Assignments ─────────────────────────────────────────────

export const getAllAssignments = async (params = {}) => {
  const res = await api.get("/assignments", { params });
  return res.data.data;
};

export const getAssignmentById = async (id) => {
  const res = await api.get(`/assignments/${id}`);
  return res.data.data;
};

export const createAssignment = async (payload) => {
  const isFormData = payload instanceof FormData;
  const res = await api.post("/assignments", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return res.data.data;
};

export const updateAssignment = async (id, payload) => {
  const isFormData = payload instanceof FormData;
  const res = await api.put(`/assignments/${id}`, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return res.data.data;
};

export const deleteAssignment = async (id) => {
  const res = await api.delete(`/assignments/${id}`);
  return res.data.data;
};

export const togglePublish = async (id) => {
  const res = await api.patch(`/assignments/${id}/publish`);
  return res.data.data;
};


// ─── Submissions ─────────────────────────────────────────────

export const getSubmissions = async (params = {}) => {
  const res = await api.get("/submissions", { params });
  return res.data.data;
};

export const getSubmissionById = async (id) => {
  const res = await api.get(`/submissions/${id}`);
  return res.data.data;
};

/**
 * Grade a submission.
 * FIX: Now always sends documentAnnotations (even if empty array)
 * so the backend correctly saves/clears annotations on grade.
 */
export const gradeSubmission = async (id, payload) => {
  const body = {
    totalScore: payload.totalScore,
    feedback: payload.feedback || "",
    questionGrades: payload.questionGrades || [],
    reviewAnnotations: payload.reviewAnnotations || [],
    // FIX: Include document annotations — use "annotations" key (matches Submission model field)
    annotations: payload.documentAnnotations || payload.annotations || [],
  };
  const res = await api.put(`/submissions/${id}/grade`, body);
  return res.data.data;
};


// ─── Annotations ─────────────────────────────────────────────

/**
 * Save document-level annotations independently (from the annotator modal
 * "Save Annotations" button, separate from full grade submission).
 */
export const saveAnnotations = async (submissionId, annotations) => {
  const res = await api.patch(
    `/submissions/${submissionId}/annotations`,
    { annotations }
  );
  return res.data.data;
};

// ─── MODULE 5 — AI Grading ─────────────────────────────────────

export const aiGradeText = async (submissionId) => {
  const res = await api.post(`/submissions/${submissionId}/ai-grade-text`);
  return res.data.data;
};

export const aiReviewProject = async (submissionId) => {
  const res = await api.post(`/submissions/${submissionId}/ai-review-project`);
  return res.data.data;
};

// ─── MODULE 6 — Admin Submission Review actions ────────────────

/**
 * Accept the AI draft as the real grade.
 * Pass no payload (or {}) for plain "Accept Draft".
 * Pass { totalScore, feedback, questionGrades } for "Accept & Edit".
 */
export const acceptAiDraft = async (submissionId, payload = {}) => {
  const res = await api.patch(`/submissions/${submissionId}/accept-ai-draft`, payload);
  return res.data.data;
};

export const approveSubmission = async (submissionId) => {
  const res = await api.patch(`/submissions/${submissionId}/approve`);
  return res.data.data;
};

export const requestResubmission = async (submissionId, feedback) => {
  const res = await api.patch(`/submissions/${submissionId}/request-resubmission`, {
    feedback,
  });
  return res.data.data;
};

// ── Admin management of learner submissions (admin / super_admin only) ────
// Learners enrolled in the assessment's course, with their submission state.
export const getEligibleSubmissionLearners = async (params = {}) => {
  const res = await api.get("/submissions/admin/eligible-learners", { params });
  return res.data.data;
};

// formData: assignmentId, studentId, answers (JSON string), file (PDF),
//           isLate ("true"/"false"), note
export const adminCreateSubmission = async (formData) => {
  const res = await api.post("/submissions/admin", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// formData: answers (JSON string), file (PDF → replaces current file),
//           isLate, note, resetGrading ("true" | "false")
export const adminUpdateSubmission = async (submissionId, formData) => {
  const res = await api.patch(`/submissions/admin/${submissionId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const adminDeleteSubmission = async (submissionId, { reason = "" } = {}) => {
  const res = await api.delete(`/submissions/admin/${submissionId}`, {
    data: { confirm: true, reason },
  });
  return res.data.data;
};
