// // import crypto from "crypto";
// // import bcrypt from "bcryptjs";
// // import User from "../models/User.js";
// // import Course from "../models/Course.js";
// // import Registration from "../models/Registration.js";
// // import asyncHandler from "../utils/asyncHandler.js";
// // import ApiError from "../utils/ApiError.js";
// // import emailService from "../services/emailService.js";
// // import auditService from "../services/auditService.js";
// // import notificationService from "../services/notificationService.js";

// // // ── Create User (student/tutor) ────────────────────────────────────────
// // export const createUser = asyncHandler(async (req, res) => {
// //   const { name, email, mobile, role } = req.body;

// //   if (!name || !email || !mobile || !role) {
// //     throw new ApiError(400, "All fields are required");
// //   }

// //   if (
// //     ![
// //       "student",
// //       "tutor",
// //       "admin",
// //       "super_admin",
// //       "partner_institute",
// //       "ao",
// //     ].includes(role)
// //   ) {
// //     throw new ApiError(400, "Invalid role");
// //   }

// //   const existingUser = await User.findOne({
// //     email: email.toLowerCase(),
// //   });

// //   if (existingUser) {
// //     throw new ApiError(409, "User already exists");
// //   }

// //   /* Generate Password */

// //   const randomPassword = crypto
// //     .randomBytes(6)
// //     .toString("hex");

// //   const passwordHash = await bcrypt.hash(
// //     randomPassword,
// //     10
// //   );

// //   const user = await User.create({
// //     name,
// //     email: email.toLowerCase(),
// //     mobile,
// //     passwordHash,
// //     role,
// //     isFirstLogin: true,
// //   });

// //   /* Send Email */

// //   emailService
// //     .sendWelcomeEmail(email, randomPassword)
// //     .catch((err) =>
// //       console.warn("Email failed:", err.message)
// //     );

// //   await auditService.log({
// //     action: "CREATE_USER",
// //     entity: "User",
// //     entityId: user._id,
// //     performedBy: req.user._id,
// //     details: `Created ${role}: ${email}`,
// //   });

// //   res.status(201).json({
// //     success: true,
// //     message: "User created successfully",
// //     data: {
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         mobile: user.mobile,
// //         role: user.role,
// //       },
// //       credentials: {
// //         email: email,
// //         password: randomPassword,
// //       },
// //     },
// //   });
// // });

// // // ── Enroll Student ─────────────────────────────────────────────────────
// // export const enrollStudent = asyncHandler(async (req, res) => {
// //   const { studentId, courseId } = req.body;

// //   const student = await User.findById(studentId);
// //   const course = await Course.findById(courseId);

// //   if (!student || !course)
// //     throw new ApiError(404, "Student or course not found");

// //   if (student.enrolledCourses.some((id) => id.toString() === courseId)) {
// //     throw new ApiError(400, "Student already enrolled in this course");
// //   }

// //   student.enrolledCourses.push(course._id);
// //   await student.save();

// //   await auditService.log({
// //     action: "ENROLL_STUDENT",
// //     entity: "User",
// //     entityId: student._id,
// //     performedBy: req.user._id,
// //     details: `Enrolled in course: ${course.title}`,
// //   });

// //   res.json({
// //     success: true,
// //     message: "Student enrolled successfully",
// //     data: student,
// //   });
// // });

// // // ── Admin Stats ────────────────────────────────────────────────────────
// // export const getAdminStats = asyncHandler(async (req, res) => {
// //   const [totalStudents, totalTutors, totalCourses, totalRegistrations] =
// //     await Promise.all([
// //       User.countDocuments({ role: "student" }),
// //       User.countDocuments({ role: "tutor" }),
// //       Course.countDocuments(),
// //       Registration.countDocuments(),
// //     ]);

// //   res.json({
// //     success: true,
// //     data: { totalStudents, totalTutors, totalCourses, totalRegistrations },
// //   });
// // });

// // // ── Recent Activity ────────────────────────────────────────────────────
// // export const getRecentActivity = asyncHandler(async (req, res) => {
// //   const { default: AuditLog } = await import("../models/AuditLog.js");
// //   const logs = await AuditLog.find()
// //     .sort({ createdAt: -1 })
// //     .limit(20)
// //     .populate("performedBy", "name email");

// //   res.json({ success: true, data: logs });
// // });

// // // ── Get All Users ──────────────────────────────────────────────────────
// // export const getAllUsers = asyncHandler(async (req, res) => {
// //   const { role, page = 1, limit = 50 } = req.query;
// //   const filter = {};
// //   if (role) filter.role = role;

// //   const users = await User.find(filter)
// //     .select("-passwordHash")
// //     .sort({ createdAt: -1 })
// //     .skip((page - 1) * limit)
// //     .limit(Number(limit))
// //     .lean();

// //   const total = await User.countDocuments(filter);

// //   res.json({
// //     success: true,
// //     data: { users, total, page: Number(page), limit: Number(limit) },
// //   });
// // });

// // // ── Update User ────────────────────────────────────────────────────────
// // export const updateUser = asyncHandler(async (req, res) => {
// //   const { id } = req.params;
// //   const allowedFields = ["name", "email", "mobile", "avatar"];
// //   const updates = {};
// //   for (const key of allowedFields) {
// //     if (req.body[key] !== undefined) updates[key] = req.body[key];
// //   }

// //   const user = await User.findByIdAndUpdate(id, updates, {
// //     new: true,
// //     runValidators: true,
// //   }).select("-passwordHash");
// //   if (!user) throw new ApiError(404, "User not found");

// //   res.json({ success: true, data: user });
// // });

// // // ── Delete User ────────────────────────────────────────────────────────
// // export const deleteUser = asyncHandler(async (req, res) => {
// //   const user = await User.findByIdAndDelete(req.params.id);
// //   if (!user) throw new ApiError(404, "User not found");

// //   await auditService.log({
// //     action: "DELETE_USER",
// //     entity: "User",
// //     entityId: user._id,
// //     performedBy: req.user._id,
// //     details: `Deleted user: ${user.email}`,
// //   });

// //   res.json({ success: true, message: "User deleted" });
// // });

// // // ── Update User Role ───────────────────────────────────────────────────
// // export const updateUserRole = asyncHandler(async (req, res) => {
// //   const { role } = req.body;
// //   if (!role) throw new ApiError(400, "Role is required");

// //   const user = await User.findByIdAndUpdate(
// //     req.params.id,
// //     { role },
// //     { new: true, runValidators: true },
// //   ).select("-passwordHash");

// //   if (!user) throw new ApiError(404, "User not found");

// //   res.json({ success: true, data: user });
// // });

// // // ── View All Registrations ─────────────────────────────────────────────
// // export const getAllRegistrations = asyncHandler(async (req, res) => {
// //   const { status, page = 1, limit = 50 } = req.query;
// //   const filter = {};
// //   if (status) filter.status = status;

// //   const registrations = await Registration.find(filter)
// //     .populate("student", "name email mobile")
// //     .populate("course", "title")
// //     .populate("partnerInstitute", "name code")
// //     .populate("processedBy", "name")
// //     .sort({ createdAt: -1 })
// //     .skip((page - 1) * limit)
// //     .limit(Number(limit))
// //     .lean();

// //   const total = await Registration.countDocuments(filter);

// //   res.json({ success: true, data: { registrations, total } });
// // });

// // // ── Approve / Reject Registration ──────────────────────────────────────
// // export const processRegistration = asyncHandler(async (req, res) => {
// //   const { id } = req.params;
// //   const { status, remarks } = req.body;

// //   if (!["approved", "rejected"].includes(status)) {
// //     throw new ApiError(400, "Status must be approved or rejected");
// //   }

// //   const registration = await Registration.findById(id)
// //     .populate("student", "name email")
// //     .populate("course", "title");

// //   if (!registration) throw new ApiError(404, "Registration not found");
// //   if (registration.status !== "pending") {
// //     throw new ApiError(400, `Registration already ${registration.status}`);
// //   }

// //   registration.status = status;
// //   registration.remarks = remarks || "";
// //   registration.processedBy = req.user._id;
// //   registration.processedAt = new Date();

// //   if (status === "approved") {
// //     registration.lmsAccessGranted = true;
// //     registration.lmsAccessGrantedAt = new Date();

// //     // Auto-enroll student
// //     await User.findByIdAndUpdate(registration.student._id, {
// //       $addToSet: { enrolledCourses: registration.course._id },
// //     });
// //   }

// //   await registration.save();

// //   // Notification
// //   await notificationService.create({
// //     userId: registration.student._id,
// //     type: "info",
// //     title: `Registration ${status}`,
// //     body: `Your registration for "${registration.course.title}" has been ${status}.`,
// //     referenceId: registration._id,
// //   });

// //   // Email (non-blocking)
// //   emailService
// //     .sendRegistrationStatusEmail(
// //       registration.student.email,
// //       registration.student.name,
// //       registration.course.title,
// //       status,
// //       remarks,
// //     )
// //     .catch((err) => console.warn("Status email failed:", err.message));

// //   await auditService.log({
// //     action: `REGISTRATION_${status.toUpperCase()}`,
// //     entity: "Registration",
// //     entityId: registration._id,
// //     performedBy: req.user._id,
// //     details: `${status} registration for ${registration.student.email}`,
// //   });

// //   res.json({
// //     success: true,
// //     message: `Registration ${status}`,
// //     data: registration,
// //   });
// // });

// // // ── Export Registrations CSV ───────────────────────────────────────────
// // export const exportRegistrationsCSV = asyncHandler(async (req, res) => {
// //   const registrations = await Registration.find()
// //     .populate("student", "name email mobile")
// //     .populate("course", "title")
// //     .populate("partnerInstitute", "name code")
// //     .lean();

// //   const rows = registrations.map((r) => ({
// //     StudentName: r.student?.name || "",
// //     StudentEmail: r.student?.email || "",
// //     Mobile: r.student?.mobile || "",
// //     Course: r.course?.title || "",
// //     Institute: r.partnerInstitute?.name || "Direct",
// //     Status: r.status,
// //     LMSAccess: r.lmsAccessGranted ? "Yes" : "No",
// //     CreatedAt: r.createdAt?.toISOString() || "",
// //   }));

// //   if (rows.length === 0) {
// //     return res.json({
// //       success: true,
// //       message: "No registrations found",
// //       data: [],
// //     });
// //   }

// //   const headers = Object.keys(rows[0]).join(",");
// //   const csv = [headers, ...rows.map((r) => Object.values(r).join(","))].join(
// //     "\n",
// //   );

// //   res.setHeader("Content-Type", "text/csv");
// //   res.setHeader(
// //     "Content-Disposition",
// //     "attachment; filename=registrations.csv",
// //   );
// //   res.send(csv);
// // });

// import crypto from "crypto";
// import bcrypt from "bcryptjs";
// import User from "../models/User.js";
// import Course from "../models/Course.js";
// import Registration from "../models/Registration.js";
// import asyncHandler from "../utils/asyncHandler.js";
// import ApiError from "../utils/ApiError.js";
// import emailService from "../services/emailService.js";
// import auditService from "../services/auditService.js";
// import notificationService from "../services/notificationService.js";

// // ── Create User (student/tutor) ────────────────────────────────────────
// export const createUser = asyncHandler(async (req, res) => {
//   const { name, email, mobile, role } = req.body;

//   if (!name || !email || !mobile || !role) {
//     throw new ApiError(400, "All fields are required");
//   }

//   if (
//     ![
//       "student",
//       "tutor",
//       "admin",
//       "super_admin",
//       "partner_institute",
//       "ao",
//       "sales_agent",
//       "finance",
//     ].includes(role)
//   ) {
//     throw new ApiError(400, "Invalid role");
//   }

//   const existingUser = await User.findOne({
//     email: email.toLowerCase(),
//   });

//   if (existingUser) {
//     throw new ApiError(409, "User already exists");
//   }

//   /* Generate Password */

//   const randomPassword = crypto
//     .randomBytes(6)
//     .toString("hex");

//   const passwordHash = await bcrypt.hash(
//     randomPassword,
//     10
//   );

//   const user = await User.create({
//     name,
//     email: email.toLowerCase(),
//     mobile,
//     passwordHash,
//     role,
//     isFirstLogin: true,
//   });

//   /* Send Email */

//   emailService
//     .sendWelcomeEmail(email, randomPassword)
//     .catch((err) =>
//       console.warn("Email failed:", err.message)
//     );

//   await auditService.log({
//     action: "CREATE_USER",
//     entity: "User",
//     entityId: user._id,
//     performedBy: req.user._id,
//     details: `Created ${role}: ${email}`,
//   });

//   res.status(201).json({
//     success: true,
//     message: "User created successfully",
//     data: {
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         mobile: user.mobile,
//         role: user.role,
//       },
//       credentials: {
//         email: email,
//         password: randomPassword,
//       },
//     },
//   });
// });

// // ── Enroll Student ─────────────────────────────────────────────────────
// export const enrollStudent = asyncHandler(async (req, res) => {
//   const { studentId, courseId } = req.body;

//   const student = await User.findById(studentId);
//   const course = await Course.findById(courseId);

//   if (!student || !course)
//     throw new ApiError(404, "Student or course not found");

//   if (student.enrolledCourses.some((id) => id.toString() === courseId)) {
//     throw new ApiError(400, "Student already enrolled in this course");
//   }

//   student.enrolledCourses.push(course._id);
//   await student.save();

//   await auditService.log({
//     action: "ENROLL_STUDENT",
//     entity: "User",
//     entityId: student._id,
//     performedBy: req.user._id,
//     details: `Enrolled in course: ${course.title}`,
//   });

//   res.json({
//     success: true,
//     message: "Student enrolled successfully",
//     data: student,
//   });
// });

// // ── Admin Stats ────────────────────────────────────────────────────────
// export const getAdminStats = asyncHandler(async (req, res) => {
//   const [totalStudents, totalTutors, totalCourses, totalRegistrations] =
//     await Promise.all([
//       User.countDocuments({ role: "student" }),
//       User.countDocuments({ role: "tutor" }),
//       Course.countDocuments(),
//       Registration.countDocuments(),
//     ]);

//   res.json({
//     success: true,
//     data: { totalStudents, totalTutors, totalCourses, totalRegistrations },
//   });
// });

// // ── Recent Activity ────────────────────────────────────────────────────
// export const getRecentActivity = asyncHandler(async (req, res) => {
//   const { default: AuditLog } = await import("../models/AuditLog.js");
//   const logs = await AuditLog.find()
//     .sort({ createdAt: -1 })
//     .limit(20)
//     .populate("performedBy", "name email");

//   res.json({ success: true, data: logs });
// });

// // ── Get All Users ──────────────────────────────────────────────────────
// export const getAllUsers = asyncHandler(async (req, res) => {
//   const { role, page = 1, limit = 50 } = req.query;
//   const filter = {};
//   if (role) filter.role = role;

//   const users = await User.find(filter)
//     .select("-passwordHash")
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(Number(limit))
//     .lean();

//   const total = await User.countDocuments(filter);

//   res.json({
//     success: true,
//     data: { users, total, page: Number(page), limit: Number(limit) },
//   });
// });

// // ── Update User ────────────────────────────────────────────────────────
// export const updateUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const allowedFields = ["name", "email", "mobile", "avatar"];
//   const updates = {};
//   for (const key of allowedFields) {
//     if (req.body[key] !== undefined) updates[key] = req.body[key];
//   }

//   const user = await User.findByIdAndUpdate(id, updates, {
//     new: true,
//     runValidators: true,
//   }).select("-passwordHash");
//   if (!user) throw new ApiError(404, "User not found");

//   res.json({ success: true, data: user });
// });

// // ── Delete User ────────────────────────────────────────────────────────
// export const deleteUser = asyncHandler(async (req, res) => {
//   const user = await User.findByIdAndDelete(req.params.id);
//   if (!user) throw new ApiError(404, "User not found");

//   await auditService.log({
//     action: "DELETE_USER",
//     entity: "User",
//     entityId: user._id,
//     performedBy: req.user._id,
//     details: `Deleted user: ${user.email}`,
//   });

//   res.json({ success: true, message: "User deleted" });
// });

// // ── Update User Role ───────────────────────────────────────────────────
// export const updateUserRole = asyncHandler(async (req, res) => {
//   const { role } = req.body;
//   if (!role) throw new ApiError(400, "Role is required");

//   const user = await User.findByIdAndUpdate(
//     req.params.id,
//     { role },
//     { new: true, runValidators: true },
//   ).select("-passwordHash");

//   if (!user) throw new ApiError(404, "User not found");

//   res.json({ success: true, data: user });
// });

// // ── View All Registrations ─────────────────────────────────────────────
// export const getAllRegistrations = asyncHandler(async (req, res) => {
//   const { status, page = 1, limit = 50 } = req.query;
//   const filter = {};
//   if (status) filter.status = status;

//   const registrations = await Registration.find(filter)
//     .populate("student", "name email mobile")
//     .populate("course", "title")
//     .populate("partnerInstitute", "name code")
//     .populate("processedBy", "name")
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(Number(limit))
//     .lean();

//   const total = await Registration.countDocuments(filter);

//   res.json({ success: true, data: { registrations, total } });
// });

// // ── Approve / Reject Registration ──────────────────────────────────────
// export const processRegistration = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { status, remarks } = req.body;

//   if (!["approved", "rejected"].includes(status)) {
//     throw new ApiError(400, "Status must be approved or rejected");
//   }

//   const registration = await Registration.findById(id)
//     .populate("student", "name email")
//     .populate("course", "title");

//   if (!registration) throw new ApiError(404, "Registration not found");
//   if (registration.status !== "pending") {
//     throw new ApiError(400, `Registration already ${registration.status}`);
//   }

//   registration.status = status;
//   registration.remarks = remarks || "";
//   registration.processedBy = req.user._id;
//   registration.processedAt = new Date();

//   if (status === "approved") {
//     registration.lmsAccessGranted = true;
//     registration.lmsAccessGrantedAt = new Date();

//     // Auto-enroll student
//     await User.findByIdAndUpdate(registration.student._id, {
//       $addToSet: { enrolledCourses: registration.course._id },
//     });
//   }

//   await registration.save();

//   // Notification
//   await notificationService.create({
//     userId: registration.student._id,
//     type: "info",
//     title: `Registration ${status}`,
//     body: `Your registration for "${registration.course.title}" has been ${status}.`,
//     referenceId: registration._id,
//   });

//   // Email (non-blocking)
//   emailService
//     .sendRegistrationStatusEmail(
//       registration.student.email,
//       registration.student.name,
//       registration.course.title,
//       status,
//       remarks,
//     )
//     .catch((err) => console.warn("Status email failed:", err.message));

//   await auditService.log({
//     action: `REGISTRATION_${status.toUpperCase()}`,
//     entity: "Registration",
//     entityId: registration._id,
//     performedBy: req.user._id,
//     details: `${status} registration for ${registration.student.email}`,
//   });

//   res.json({
//     success: true,
//     message: `Registration ${status}`,
//     data: registration,
//   });
// });

// // ── Export Registrations CSV ───────────────────────────────────────────
// export const exportRegistrationsCSV = asyncHandler(async (req, res) => {
//   const registrations = await Registration.find()
//     .populate("student", "name email mobile")
//     .populate("course", "title")
//     .populate("partnerInstitute", "name code")
//     .lean();

//   const rows = registrations.map((r) => ({
//     StudentName: r.student?.name || "",
//     StudentEmail: r.student?.email || "",
//     Mobile: r.student?.mobile || "",
//     Course: r.course?.title || "",
//     Institute: r.partnerInstitute?.name || "Direct",
//     Status: r.status,
//     LMSAccess: r.lmsAccessGranted ? "Yes" : "No",
//     CreatedAt: r.createdAt?.toISOString() || "",
//   }));

//   if (rows.length === 0) {
//     return res.json({
//       success: true,
//       message: "No registrations found",
//       data: [],
//     });
//   }

//   const headers = Object.keys(rows[0]).join(",");
//   const csv = [headers, ...rows.map((r) => Object.values(r).join(","))].join(
//     "\n",
//   );

//   res.setHeader("Content-Type", "text/csv");
//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=registrations.csv",
//   );
//   res.send(csv);
// });

import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Registration from "../models/Registration.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import emailService from "../services/emailService.js";
import auditService from "../services/auditService.js";
import notificationService from "../services/notificationService.js";

// ── Create User (student/tutor) ────────────────────────────────────────
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, mobile, role } = req.body;

  if (!name || !email || !mobile || !role) {
    throw new ApiError(400, "All fields are required");
  }

  if (
    ![
      "student",
      "tutor",
      "admin",
      "super_admin",
      "partner_institute",
      "ao",
      "sales_agent",
      "finance",
    ].includes(role)
  ) {
    throw new ApiError(400, "Invalid role");
  }

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  /* Generate Password */

  const randomPassword = crypto.randomBytes(6).toString("hex");

  const passwordHash = await bcrypt.hash(randomPassword, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    mobile,
    passwordHash,
    role,
    isFirstLogin: true,
  });

  /* Send Email */

  emailService
    .sendWelcomeEmail(email, randomPassword)
    .catch((err) => console.warn("Email failed:", err.message));

  await auditService.log({
    action: "CREATE_USER",
    entity: "User",
    entityId: user._id,
    performedBy: req.user._id,
    details: `Created ${role}: ${email}`,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      credentials: {
        email: email,
        password: randomPassword,
      },
    },
  });
});

// ── Enroll Student ─────────────────────────────────────────────────────
export const enrollStudent = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;

  const student = await User.findById(studentId);
  const course = await Course.findById(courseId);

  if (!student || !course)
    throw new ApiError(404, "Student or course not found");

  if (student.enrolledCourses.some((id) => id.toString() === courseId)) {
    throw new ApiError(400, "Student already enrolled in this course");
  }

  student.enrolledCourses.push(course._id);
  await student.save();

  await auditService.log({
    action: "ENROLL_STUDENT",
    entity: "User",
    entityId: student._id,
    performedBy: req.user._id,
    details: `Enrolled in course: ${course.title}`,
  });

  res.json({
    success: true,
    message: "Student enrolled successfully",
    data: student,
  });
});

// ── Admin Stats ────────────────────────────────────────────────────────
export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalStudents, totalTutors, totalCourses, totalRegistrations] =
    await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "tutor" }),
      Course.countDocuments(),
      Registration.countDocuments(),
    ]);

  res.json({
    success: true,
    data: { totalStudents, totalTutors, totalCourses, totalRegistrations },
  });
});

// ── Recent Activity ────────────────────────────────────────────────────
export const getRecentActivity = asyncHandler(async (req, res) => {
  const { default: AuditLog } = await import("../models/AuditLog.js");
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("performedBy", "name email");

  res.json({ success: true, data: logs });
});

// ── Get All Users ──────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: { users, total, page: Number(page), limit: Number(limit) },
  });
});

// ── Update User ────────────────────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowedFields = ["name", "email", "mobile", "avatar"];
  const updates = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, data: user });
});

// ── Delete User ────────────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  await auditService.log({
    action: "DELETE_USER",
    entity: "User",
    entityId: user._id,
    performedBy: req.user._id,
    details: `Deleted user: ${user.email}`,
  });

  res.json({ success: true, message: "User deleted" });
});

// ── Update User Role ───────────────────────────────────────────────────
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) throw new ApiError(400, "Role is required");

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  ).select("-passwordHash");

  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, data: user });
});

// ── View All Registrations ─────────────────────────────────────────────
export const getAllRegistrations = asyncHandler(async (req, res) => {
  const { status, paymentStatus, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const registrations = await Registration.find(filter)
    .populate("student", "name email mobile")
    .populate("course", "title")
    .populate("partnerInstitute", "name code")
    .populate("processedBy", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Registration.countDocuments(filter);

  res.json({ success: true, data: { registrations, total } });
});

// ── Approve / Reject Registration ──────────────────────────────────────
export const processRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be approved or rejected");
  }

  const registration = await Registration.findById(id)
    .populate("student", "name email")
    .populate("course", "title");

  if (!registration) throw new ApiError(404, "Registration not found");
  if (registration.status !== "pending") {
    throw new ApiError(400, `Registration already ${registration.status}`);
  }

  registration.status = status;
  registration.remarks = remarks || "";
  registration.processedBy = req.user._id;
  registration.processedAt = new Date();

  if (status === "approved") {
    registration.lmsAccessGranted = true;
    registration.lmsAccessGrantedAt = new Date();

    // Auto-enroll student
    await User.findByIdAndUpdate(registration.student._id, {
      $addToSet: { enrolledCourses: registration.course._id },
    });
  }

  await registration.save();

  // Notification
  await notificationService.create({
    userId: registration.student._id,
    type: "info",
    title: `Registration ${status}`,
    body: `Your registration for "${registration.course.title}" has been ${status}.`,
    referenceId: registration._id,
  });

  // Email (non-blocking)
  emailService
    .sendRegistrationStatusEmail(
      registration.student.email,
      registration.student.name,
      registration.course.title,
      status,
      remarks,
    )
    .catch((err) => console.warn("Status email failed:", err.message));

  await auditService.log({
    action: `REGISTRATION_${status.toUpperCase()}`,
    entity: "Registration",
    entityId: registration._id,
    performedBy: req.user._id,
    details: `${status} registration for ${registration.student.email}`,
  });

  res.json({
    success: true,
    message: `Registration ${status}`,
    data: registration,
  });
});

// ── Export Registrations CSV ───────────────────────────────────────────
export const exportRegistrationsCSV = asyncHandler(async (req, res) => {
  const registrations = await Registration.find()
    .populate("student", "name email mobile")
    .populate("course", "title")
    .populate("partnerInstitute", "name code")
    .lean();

  const rows = registrations.map((r) => ({
    StudentName: r.student?.name || "",
    StudentEmail: r.student?.email || "",
    Mobile: r.student?.mobile || "",
    Course: r.course?.title || "",
    Institute: r.partnerInstitute?.name || "Direct",
    Status: r.status,
    LMSAccess: r.lmsAccessGranted ? "Yes" : "No",
    CreatedAt: r.createdAt?.toISOString() || "",
  }));

  if (rows.length === 0) {
    return res.json({
      success: true,
      message: "No registrations found",
      data: [],
    });
  }

  const headers = Object.keys(rows[0]).join(",");
  const csv = [headers, ...rows.map((r) => Object.values(r).join(","))].join(
    "\n",
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=registrations.csv",
  );
  res.send(csv);
});

// ═══════════════════════════════════════════════════════════════════════
//  ADDITIVE — Payment Verification, Single Registration View,
//             Learner 360° Profile Aggregation
//  Nothing above this line was modified.
// ═══════════════════════════════════════════════════════════════════════

// ── View Single Registration ────────────────────────────────────────────
export const getRegistrationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registration = await Registration.findById(id)
    .populate(
      "student",
      "name email mobile firstName lastName dateOfBirth address country",
    )
    .populate("course", "title")
    .populate("batch", "name startDate endDate")
    .populate("partnerInstitute", "name code")
    .populate("processedBy", "name")
    .populate("paymentVerifiedBy", "name")
    .populate("documents")
    .lean();

  if (!registration) throw new ApiError(404, "Registration not found");

  res.json({ success: true, data: registration });
});

// ── Confirm / Verify Payment for a Registration ─────────────────────────
// This is a WORKFLOW GATE only (Registration.paymentStatus). It does not
// replace or duplicate the LearnerPayment ledger — if `recordPayment` is
// true, it ALSO writes a single LearnerPayment installment record, reusing
// the existing finance model rather than introducing a parallel total.
export const confirmRegistrationPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    paymentStatus,
    notes,
    recordPayment,
    amount,
    paymentMode,
    referenceNumber,
  } = req.body;

  if (!["partial", "paid", "verified"].includes(paymentStatus)) {
    throw new ApiError(400, "paymentStatus must be partial, paid, or verified");
  }

  const registration = await Registration.findById(id)
    .populate("student", "name email")
    .populate("course", "title");
  if (!registration) throw new ApiError(404, "Registration not found");

  registration.paymentStatus = paymentStatus;
  registration.paymentNotes = notes || "";
  registration.paymentVerifiedBy = req.user._id;
  registration.paymentVerifiedAt = new Date();
  await registration.save();

  if (recordPayment && amount) {
    const { default: LearnerPayment } =
      await import("../models/LearnerPayment.js");
    const { default: CourseEnrollmentFee } =
      await import("../models/CourseEnrollmentFee.js");

    const feeDoc = await CourseEnrollmentFee.findOne({
      courseId: registration.course._id,
    }).lean();
    const totalCourseFee = feeDoc?.fee ?? Number(amount);

    await LearnerPayment.create({
      learnerId: registration.student._id,
      courseId: registration.course._id,
      totalCourseFee,
      amount: Number(amount),
      paymentMode: paymentMode || "other",
      referenceNumber: referenceNumber || "",
      remarks: `Recorded during registration payment verification (Registration ${registration._id})`,
      status:
        paymentStatus === "verified" || paymentStatus === "paid"
          ? "fully_paid"
          : "part_payment",
      recordedBy: req.user._id,
    });
  }

  await auditService.log({
    action: "REGISTRATION_PAYMENT_" + paymentStatus.toUpperCase(),
    entity: "Registration",
    entityId: registration._id,
    performedBy: req.user._id,
    details: `Payment marked ${paymentStatus} for ${registration.student.email}`,
  });

  res.json({
    success: true,
    message: `Payment marked ${paymentStatus}`,
    data: registration,
  });
});

// ── Learner 360° Profile ─────────────────────────────────────────────────
// Pure read-aggregation across existing collections. No writes, no schema
// changes to Exam/Assignment/ScenarioExam/Certificate/Attendance models.
export const getLearnerProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [
    { default: Batch },
    { default: ChapterProgress },
    { default: LearnerPayment },
    { default: Submission },
    { default: Assignment },
    { default: ExamAttempt },
    { default: ScenarioExamAttempt },
    { default: Certificate },
    { default: Document },
    { default: Attendance },
    { default: AuditLog },
    { default: Notification },
  ] = await Promise.all([
    import("../models/Batch.js"),
    import("../models/ChapterProgress.js"),
    import("../models/LearnerPayment.js"),
    import("../models/Submission.js"),
    import("../models/Assignment.js"),
    import("../models/ExamAttempt.js"),
    import("../models/ScenarioExamAttempt.js"),
    import("../models/Certificate.js"),
    import("../models/Document.js"),
    import("../models/Attendance.js"),
    import("../models/AuditLog.js"),
    import("../models/Notification.js"),
  ]);

  const user = await User.findById(id).select("-passwordHash").lean();
  if (!user) throw new ApiError(404, "Learner not found");

  const [
    registrations,
    courses,
    batches,
    payments,
    submissions,
    examAttempts,
    scenarioAttempts,
    certificates,
    documents,
    attendance,
    auditLogs,
    notifications,
  ] = await Promise.all([
    Registration.find({ student: id })
      .populate("course", "title")
      .populate("batch", "name startDate endDate")
      .lean(),
    Course.find({ _id: { $in: user.enrolledCourses || [] } })
      .select("title thumbnail status")
      .lean(),
    Batch.find({ students: id })
      .select("name courseId startDate endDate status")
      .lean(),
    LearnerPayment.find({ learnerId: id, isDeleted: { $ne: true } })
      .sort({ paymentDate: -1 })
      .lean(),
    Submission.find({ studentId: id })
      .populate("assignmentId", "title totalMarks courseId")
      .lean(),
    ExamAttempt.find({ studentId: id }).populate("examId", "title").lean(),
    ScenarioExamAttempt.find({ studentId: id })
      .populate("examId", "title")
      .lean(),
    Certificate.find({ studentId: id }).populate("courseId", "title").lean(),
    Document.find({ uploadedBy: id }).lean(),
    Attendance.find({ student: id }).lean(),
    AuditLog.find({ $or: [{ performedBy: id }, { entityId: id }] })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Notification.find({ userId: id }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  // Course progress (chapter completion) per enrolled course
  const progressDocs = await ChapterProgress.find({ studentId: id }).lean();
  const progressByCourse = {};
  for (const p of progressDocs) {
    progressByCourse[String(p.courseId)] = {
      completedChapters: p.completedChapters?.length || 0,
      chapterResults: p.chapterResults,
    };
  }

  const coursesWithProgress = courses.map((c) => ({
    ...c,
    progress: progressByCourse[String(c._id)] || null,
  }));

  // Payments summary
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalFee = payments.length ? payments[0].totalCourseFee : 0;
  const paymentsSummary = {
    totalFee,
    totalPaid,
    pending: Math.max(totalFee - totalPaid, 0),
    installments: payments,
  };

  // Unified activity timeline (registration, payments, enrollment, exams,
  // certificates, login) — sorted descending by date.
  const timeline = [];
  for (const r of registrations) {
    timeline.push({
      type: "registration",
      date: r.createdAt,
      label: `Registration (${r.status}) — ${r.course?.title || ""}`,
    });
    if (r.processedAt)
      timeline.push({
        type: "registration",
        date: r.processedAt,
        label: `Registration ${r.status}`,
      });
  }
  for (const p of payments) {
    timeline.push({
      type: "payment",
      date: p.paymentDate,
      label: `Payment of ${p.amount} ${p.currency} (${p.paymentMode})`,
    });
  }
  for (const e of examAttempts) {
    timeline.push({
      type: "exam",
      date: e.submittedAt || e.startedAt,
      label: `Exam attempt: ${e.examId?.title || ""} — ${e.status}`,
    });
  }
  for (const s of scenarioAttempts) {
    timeline.push({
      type: "scenario_exam",
      date: s.createdAt,
      label: `Scenario exam attempt: ${s.examId?.title || ""}`,
    });
  }
  for (const c of certificates) {
    timeline.push({
      type: "certificate",
      date: c.issuedAt,
      label: `Certificate issued: ${c.title}`,
    });
  }
  if (user.lastLoginAt)
    timeline.push({
      type: "login",
      date: user.lastLoginAt,
      label: "Last login",
    });
  timeline.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  res.json({
    success: true,
    data: {
      profile: {
        ...user,
        registrationDate: user.createdAt,
      },
      registrations,
      courses: coursesWithProgress,
      batches,
      payments: paymentsSummary,
      assignments: submissions,
      exams: examAttempts,
      scenarioExams: scenarioAttempts,
      certificates,
      documents,
      attendance,
      activityTimeline: timeline,
      auditLogs,
      notifications,
    },
  });
});
