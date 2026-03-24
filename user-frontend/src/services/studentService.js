// import api from "./api";

// /**
//  * Student Dashboard
//  * GET /api/students/dashboard
//  */
// export const getDashboard = async () => {
//   try {
//     const { data } = await api.get("/students/dashboard");
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load dashboard" };
//   }
// };

// /**
//  * Enrolled Courses
//  * GET /api/students/courses
//  */
// export const getEnrolledCourses = async () => {
//   try {
//     const { data } = await api.get("/students/courses");
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load courses" };
//   }
// };

// /**
//  * Student Assignments
//  * GET /api/students/assignments
//  */
// export const getAssignments = async () => {
//   try {
//     const { data } = await api.get("/students/assignments");
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load assignments" };
//   }
// };

// /**
//  * Student Certificates
//  * GET /api/students/certificates
//  */
// export const getCertificates = async () => {
//   try {
//     const { data } = await api.get("/students/certificates");
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load certificates" };
//   }
// };

// /**
//  * Student Profile
//  * GET /api/students/profile
//  */
// export const getProfile = async () => {
//   try {
//     const { data } = await api.get("/students/profile");
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to load profile" };
//   }
// };

// /**
//  * Submit Assignment
//  * POST /api/students/assignments/:id/submit
//  */
// export const submitAssignment = async (assignmentId, payload) => {
//   try {
//     const { data } = await api.post(
//       `/students/assignments/${assignmentId}/submit`,
//       payload
//     );
//     return data;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to submit assignment" };
//   }
// };

import api from "./api";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = async () => {
  try {
    const { data } = await api.get("/students/dashboard");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load dashboard" };
  }
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const getEnrolledCourses = async () => {
  try {
    const { data } = await api.get("/students/courses");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load courses" };
  }
};

// ─── Assignments ──────────────────────────────────────────────────────────────
export const getAssignments = async () => {
  try {
    const { data } = await api.get("/students/assignments");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load assignments" };
  }
};

// ─── Submissions ──────────────────────────────────────────────────────────────
export const submitAssignment = async (payload) => {
  try {
    const { data } = await api.post("/submissions", payload);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit assignment" };
  }
};

export const getMySubmissions = async () => {
  try {
    const { data } = await api.get("/submissions/my");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load submissions" };
  }
};

export const getSubmissionForAssignment = async (assignmentId) => {
  try {
    const { data } = await api.get(`/submissions/assignment/${assignmentId}/my`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error.response?.data || { message: "Failed to load submission" };
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

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = async (params = {}) => {
  try {
    const { data } = await api.get("/notifications", { params });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to load notifications" };
  }
};

export const markNotificationRead = async (id) => {
  try {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to mark notification" };
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const { data } = await api.patch("/notifications/mark-all/read");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to mark all read" };
  }
};
