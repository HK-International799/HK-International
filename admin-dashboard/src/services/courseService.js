import api from "./api";

/**
 * 📚 Courses
 */
export const getCourses = async () => {
  const { data } = await api.get("/courses");
  return data;
};

export const getCourseById = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

export const createCourse = async (payload) => {
  const { data } = await api.post("/courses", payload);
  return data;
};

export const updateCourse = async (id, payload) => {
  const { data } = await api.put(`/courses/${id}`, payload);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
};

/**
 * 👨‍🏫 Tutor
 */
export const assignTutor = async (id, tutorId) => {
  const { data } = await api.post(`/courses/${id}/assign-tutor`, { tutorId });
  return data;
};

/**
 * 📂 Sections
 */
export const addSection = async (courseId, payload) => {
  const { data } = await api.post(`/courses/${courseId}/sections`, payload);
  return data;
};

export const updateSection = async (sectionId, payload) => {
  const { data } = await api.put(`/courses/sections/${sectionId}`, payload);
  return data;
};

export const deleteSection = async (sectionId) => {
  const { data } = await api.delete(`/courses/sections/${sectionId}`);
  return data;
};