// import api from "./api";

// /**
//  * 📘 Assignments
//  */
// export const getAssignments = async () => {
//   const { data } = await api.get("/assignments");
//   return data;
// };

// export const getAssignmentById = async (id) => {
//   const { data } = await api.get(`/assignments/${id}`);
//   return data;
// };

// export const createAssignment = async (payload) => {
//   const { data } = await api.post("/assignments", payload);
//   return data;
// };

// export const updateAssignment = async (id, payload) => {
//   const { data } = await api.put(`/assignments/${id}`, payload);
//   return data;
// };

// export const deleteAssignment = async (id) => {
//   const { data } = await api.delete(`/assignments/${id}`);
//   return data;
// };

// /**
//  * 📥 Submissions (Assuming route exists)
//  */
// export const getSubmissionsByAssignment = async (assignmentId) => {
//   const { data } = await api.get(`/submissions/assignment/${assignmentId}`);
//   return data;
// };

import api from "./api";

export const getAllAssignments = async (params = {}) => {
  const res = await api.get("/assignments", { params });
  return res.data;
};

export const getAssignmentById = async (id) => {
  const res = await api.get(`/assignments/${id}`);
  return res.data;
};

export const createNewAssignment = async (payload) => {
  const res = await api.post("/assignments", payload);
  return res.data;
};

export const updateExistingAssignment = async (id, payload) => {
  const res = await api.put(`/assignments/${id}`, payload);
  return res.data;
};

export const deleteExistingAssignment = async (id) => {
  const res = await api.delete(`/assignments/${id}`);
  return res.data;
};

export const getSubmissionsByAssignment = async (assignmentId) => {
  const { data } = await api.get(`/submissions/assignment/${assignmentId}`);
  return data;
};
