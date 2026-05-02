



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
