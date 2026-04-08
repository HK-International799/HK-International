// import api from "./api";

// // ─── Courses ──────────────────────────────────────────────────────────────────
// export const getEnrolledCourses = async () => {
//   try {
//     const { data } = await api.get("/students/courses");
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load courses" };
//   }
// };

// // ─── Progress ─────────────────────────────────────────────────────────────────
// export const completeLesson = async (courseId, lessonId) => {
//   try {
//     const { data } = await api.post("/progress/complete-lesson", {
//       courseId,
//       lessonId,
//     });
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to mark lesson complete" };
//   }
// };

// export const getCourseProgress = async (courseId) => {
//   try {
//     const { data } = await api.get(`/progress/${courseId}`);
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load progress" };
//   }
// };

// export const getAllProgress = async () => {
//   try {
//     const { data } = await api.get("/progress");
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load progress" };
//   }
// };

// // ─── Profile ──────────────────────────────────────────────────────────────────
// export const getProfile = async () => {
//   try {
//     const { data } = await api.get("/students/profile");
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load profile" };
//   }
// };

// export const updateProfile = async (payload) => {
//   try {
//     const { data } = await api.put("/students/profile", payload);
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to update profile" };
//   }
// };

// // ─── Certificates ─────────────────────────────────────────────────────────────
// export const getCertificates = async () => {
//   try {
//     const { data } = await api.get("/students/certificates");
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load certificates" };
//   }
// };

// // ─── Messages / Chat ──────────────────────────────────────────────────────────
// export const sendMessage = async (payload) => {
//   const { data } = await api.post("/messages", payload);
//   return data;
// };

// export const getMessages = async (courseId) => {
//   const { data } = await api.get("/messages", { params: { courseId } });
//   return data;
// };

// export const markMessageRead = async (id) => {
//   const { data } = await api.put(`/messages/${id}/read`);
//   return data;
// };

// // ─── Feedback ─────────────────────────────────────────────────────────────────
// export const createFeedback = async (payload) => {
//   const { data } = await api.post("/feedback", payload);
//   return data;
// };

// // ─── Live Classes ─────────────────────────────────────────────────────────────
// export const getLiveClasses = async () => {
//   const { data } = await api.get("/live-classes");
//   return data;
// };

// export const getLiveClassById = async (id) => {
//   const { data } = await api.get(`/live-classes/${id}`);
//   return data;
// };

// // ─── Documents ────────────────────────────────────────────────────────────────
// export const uploadDocument = async (payload) => {
//   const { data } = await api.post("/documents", payload);
//   return data;
// };

// export const getMyDocuments = async () => {
//   const { data } = await api.get("/documents");
//   return data;
// };

// export const getDocumentById = async (id) => {
//   const { data } = await api.get(`/documents/${id}`);
//   return data;
// };

// // ─── Question Banks (read-only for students) ──────────────────────────────────
// export const getQuestionBanks = async () => {
//   const { data } = await api.get("/question-banks");
//   return data;
// };

// export const getQuestionBankById = async (id) => {
//   const { data } = await api.get(`/question-banks/${id}`);
//   return data;
// };

// // ─── Assignments (detailed) ───────────────────────────────────────────────────
// export const getAssignmentById = async (id) => {
//   const { data } = await api.get(`/assignments/${id}`);
//   return data;
// };

// export const getAssignments = async (courseId) => {
//   const params = courseId ? { courseId } : {};
//   const { data } = await api.get("/assignments", { params });
//   return data;
// };

// // ─── Notifications ────────────────────────────────────────────────────────────
// export const getNotifications = async (params = {}) => {
//   const { data } = await api.get("/notifications", { params });
//   return data;
// };

// export const markNotificationRead = async (id) => {
//   const { data } = await api.patch(`/notifications/${id}/read`);
//   return data;
// };

// export const markAllNotificationsRead = async () => {
//   const { data } = await api.patch("/notifications/mark-all/read");
//   return data;
// };

// export const getUnreadNotificationCount = async () => {
//   const { data } = await api.get("/notifications/unread/count");
//   return data;
// };

// // ─── Submissions ──────────────────────────────────────────────────────────────
// export const submitAssignment = async (payload) => {
//   const { data } = await api.post("/submissions", payload);
//   return data;
// };

// export const getMySubmissions = async () => {
//   const { data } = await api.get("/submissions/my");
//   return data;
// };

// export const getSubmissionForAssignment = async (assignmentId) => {
//   try {
//     const { data } = await api.get(
//       `/submissions/assignment/${assignmentId}/my`,
//     );
//     return data;
//   } catch (err) {
//     if (err.response?.status === 404) return null;
//     throw err;
//   }
// };

// export const getSubmissionById = async (id) => {
//   const { data } = await api.get(`/submissions/${id}`);
//   return data;
// };

// // ─── Profile & Auth ───────────────────────────────────────────────────────────
// export const getMe = async () => {
//   const { data } = await api.get("/auth/me");
//   return data;
// };

// export const changePassword = async (payload) => {
//   const { data } = await api.put("/auth/change-password", payload);
//   return data;
// };

// // ─── Courses ──────────────────────────────────────────────────────────────────
// export const getCourses = async () => {
//   const { data } = await api.get("/courses");
//   return data;
// };

// export const getCourseById = async (id) => {
//   const { data } = await api.get(`/courses/${id}`);
//   return data;
// };

// // ─── Student Dashboard ────────────────────────────────────────────────────────
// export const getDashboard = async () => {
//   const { data } = await api.get("/students/dashboard");
//   return data;
// };

// export const getStudentCourses = async () => {
//   const { data } = await api.get("/students/courses");
//   return data;
// };

// export const getStudentAssignments = async () => {
//   const { data } = await api.get("/students/assignments");
//   return data;
// };



import api from "./api";

// ─── Courses ──────────────────────────────────────────────────────────────────
export const getEnrolledCourses = async () => {
  try {
    const { data } = await api.get("/students/courses");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load courses" };
  }
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const completeLesson = async (courseId, lessonId) => {
  try {
    const { data } = await api.post("/progress/complete-lesson", {
      courseId,
      lessonId,
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to mark lesson complete" };
  }
};

export const getCourseProgress = async (courseId) => {
  try {
    const { data } = await api.get(`/progress/${courseId}`);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load progress" };
  }
};

export const getAllProgress = async () => {
  try {
    const { data } = await api.get("/progress");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load progress" };
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = async () => {
  try {
    const { data } = await api.get("/students/profile");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load profile" };
  }
};

export const updateProfile = async (payload) => {
  try {
    const { data } = await api.put("/students/profile", payload);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update profile" };
  }
};

// ─── Certificates ─────────────────────────────────────────────────────────────
export const getCertificates = async () => {
  try {
    const { data } = await api.get("/students/certificates");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load certificates" };
  }
};

// ─── Messages / Chat ──────────────────────────────────────────────────────────
export const sendMessage = async (payload) => {
  const { data } = await api.post("/messages", payload);
  return data;
};

export const getMessages = async (courseId) => {
  const { data } = await api.get("/messages", { params: { courseId } });
  return data;
};

export const markMessageRead = async (id) => {
  const { data } = await api.put(`/messages/${id}/read`);
  return data;
};

// ─── Feedback ─────────────────────────────────────────────────────────────────
export const createFeedback = async (payload) => {
  const { data } = await api.post("/feedback", payload);
  return data;
};

// ─── Live Classes ─────────────────────────────────────────────────────────────
export const getLiveClasses = async () => {
  const { data } = await api.get("/live-classes");
  return data;
};

export const getLiveClassById = async (id) => {
  const { data } = await api.get(`/live-classes/${id}`);
  return data;
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const uploadDocument = async (payload) => {
  const { data } = await api.post("/documents", payload);
  return data;
};

export const getMyDocuments = async () => {
  const { data } = await api.get("/documents");
  return data;
};

export const getDocumentById = async (id) => {
  const { data } = await api.get(`/documents/${id}`);
  return data;
};

// ─── Question Banks (read-only for students) ──────────────────────────────────
export const getQuestionBanks = async () => {
  const { data } = await api.get("/question-banks");
  return data;
};

export const getQuestionBankById = async (id) => {
  const { data } = await api.get(`/question-banks/${id}`);
  return data;
};

// ─── Assignments ──────────────────────────────────────────────────────────────
export const getAssignmentById = async (id) => {
  const { data } = await api.get(`/assignments/${id}`);
  return data;
};

export const getAssignments = async (courseId) => {
  const params = courseId ? { courseId } : {};
  const { data } = await api.get("/assignments", { params });
  return data;
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = async (params = {}) => {
  const { data } = await api.get("/notifications", { params });
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.patch("/notifications/mark-all/read");
  return data;
};

export const getUnreadNotificationCount = async () => {
  const { data } = await api.get("/notifications/unread/count");
  return data;
};

// ─── Submissions ──────────────────────────────────────────────────────────────
export const submitAssignment = async (payload) => {
  const { data } = await api.post("/submissions", payload);
  return data;
};

export const getMySubmissions = async () => {
  const { data } = await api.get("/submissions/my");
  return data;
};

export const getSubmissionForAssignment = async (assignmentId) => {
  try {
    const { data } = await api.get(`/submissions/assignment/${assignmentId}/my`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

export const getSubmissionById = async (id) => {
  const { data } = await api.get(`/submissions/${id}`);
  return data;
};

// ─── Profile & Auth ───────────────────────────────────────────────────────────
export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await api.put("/auth/change-password", payload);
  return data;
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const getCourses = async () => {
  const { data } = await api.get("/courses");
  return data;
};

export const getCourseById = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

// ─── Student Dashboard ────────────────────────────────────────────────────────
export const getDashboard = async () => {
  const { data } = await api.get("/students/dashboard");
  return data;
};

export const getStudentCourses = async () => {
  const { data } = await api.get("/students/courses");
  return data;
};

export const getStudentAssignments = async () => {
  const { data } = await api.get("/students/assignments");
  return data;
};

// ─── Chapter APIs (NEW) ───────────────────────────────────────────────────────

/**
 * Get all chapters for a course plus the student's completed chapter IDs.
 * Returns: { chapters: [...], completedChapters: [...ids] }
 */
export const getCourseChapters = async (courseId) => {
  try {
    const { data } = await api.get(`/chapters/course/${courseId}`);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load chapters" };
  }
};

/**
 * Get the quiz (with questions) for a specific chapter.
 * Returns: { quiz: { ... questions[] } | null }
 */
export const getChapterQuiz = async (chapterId) => {
  try {
    const { data } = await api.get(`/chapters/${chapterId}/quiz`);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load quiz" };
  }
};

/**
 * Submit quiz answers for a chapter.
 * Body: { answers: [{ questionId, selectedOption }] }
 * Returns: { score, totalMarks, passed, gradedAnswers }
 */
export const submitChapterQuiz = async (chapterId, answers) => {
  try {
    const { data } = await api.post(`/chapters/${chapterId}/submit-quiz`, {
      answers,
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit quiz" };
  }
};

/**
 * Get the student's chapter progress for a course.
 * Returns: { completedChapters: [...ids] }
 */
export const getChapterProgress = async (courseId) => {
  try {
    const { data } = await api.get(`/chapters/progress/${courseId}`);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load chapter progress" };
  }
};
