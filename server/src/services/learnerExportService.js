// /**
//  * learnerExportService
//  *
//  * Enterprise "Export Learners" (.xlsx) for the admin Learners page.
//  *
//  *  - The column catalog is generated from the live User schema (so any
//  *    field added to User later shows up automatically), plus derived
//  *    columns and columns computed from collections that ALREADY reference
//  *    the user (Course, ChapterProgress, Chapter, Attempt, Submission,
//  *    Assignment, QuizAttempt, ScenarioExamAttempt, Certificate,
//  *    Attendance, Registration, PartnerInstitute, AwardingOrganisation).
//  *    No schema is invented — fields that don't exist are reported back as
//  *    `unavailableColumns` so the UI can say so explicitly.
//  *
//  *  - Related data is loaded in BATCHES keyed by user id ($in queries /
//  *    $group aggregations), never one query per user (no N+1), and ONLY for
//  *    the relationship groups the selected columns actually need.
//  *
//  *  - The workbook is built fully in memory and only sent once it has been
//  *    generated successfully, so a generation failure turns into a clean
//  *    JSON error instead of a half-written download.
//  */
// import ExcelJS from "exceljs";
// import mongoose from "mongoose";

// import User from "../models/User.js";
// import Course from "../models/Course.js";
// import Chapter from "../models/Chapter.js";
// import ChapterProgress from "../models/ChapterProgress.js";
// import Attempt from "../models/Attempt.js";
// import Exam from "../models/Exam.js";
// import Submission from "../models/Submission.js";
// import Assignment from "../models/Assignment.js";
// import QuizAttempt from "../models/QuizAttempt.js";
// import ScenarioExamAttempt from "../models/ScenarioExamAttempt.js";
// import Certificate from "../models/Certificate.js";
// import Attendance from "../models/Attendance.js";
// import Registration from "../models/Registration.js";
// import PartnerInstitute from "../models/PartnerInstitute.js";
// import AwardingOrganisation from "../models/AwardingOrganisation.js";

// import { deriveFullName } from "../utils/nameUtils.js";
// import {
//   SENSITIVE_USER_FIELDS,
//   SORT_COLLATION,
//   SORT_KEY_FIELD,
//   toLocalCalendarDate,
//   toUtcCalendarDate,
// } from "../utils/learnerFilters.js";

// export const EXPORT_SHEET_NAME = "Learners Export";
// export const MAX_EXPORT_ROWS = 50000;
// const BATCH_SIZE = 1000;

// // ═══════════════════════════════════════════════════════════════════════
// //  1. Column catalog
// // ═══════════════════════════════════════════════════════════════════════

// // Friendly labels / groups for User schema paths we know about. Any User
// // path NOT listed here is still exported (auto-labelled from its name).
// const USER_FIELD_META = {
//   firstName: { label: "First Name", group: "Personal", order: 10 },
//   middleName: { label: "Middle Name", group: "Personal", order: 11 },
//   lastName: { label: "Last Name", group: "Personal", order: 12 },
//   dateOfBirth: { label: "Date of Birth", group: "Personal", order: 14 },
//   email: { label: "Email", group: "Contact", order: 20 },
//   countryCode: { label: "Country Code", group: "Contact", order: 21 },
//   mobile: { label: "Mobile", group: "Contact", order: 22 },
//   address: { label: "Address", group: "Address", order: 30 },
//   addressLine1: { label: "Address Line 1", group: "Address", order: 31 },
//   addressLine2: { label: "Address Line 2", group: "Address", order: 32 },
//   city: { label: "City", group: "Address", order: 33 },
//   state: { label: "State", group: "Address", order: 34 },
//   postalCode: { label: "Pincode / Postal Code", group: "Address", order: 35 },
//   country: { label: "Country", group: "Address", order: 36 },
//   role: { label: "Role", group: "Account", order: 40 },
//   createdAt: { label: "Registration Date", group: "Account", order: 41 },
//   registeredVia: { label: "Registration Source", group: "Account", order: 42 },
//   lastLoginAt: { label: "Last Login", group: "Account", order: 43 },
//   isFirstLogin: { label: "First Login Pending", group: "Account", order: 45 },
//   updatedAt: { label: "Updated At", group: "Account", order: 46 },
//   avatar: { label: "Avatar URL", group: "Account", order: 47 },
// };

// // Paths that are never exported directly: secrets, internals, and refs
// // that are exported through a friendlier derived/relationship column.
// const USER_PATHS_EXCLUDED = new Set([
//   ...SENSITIVE_USER_FIELDS,
//   "_id",
//   "__v",
//   "id",
//   "name", // legacy single name — covered by "Full Name" (falls back to it)
//   "enrolledCourses", // → Courses Enrolled In / Total Courses Enrolled
//   "assignedCourses", // → Assigned Courses (title lookup)
//   "partnerInstitute", // → Organization (Partner Institute)
//   "awardingOrganisation", // → Awarding Organisation
// ]);

// // Requested columns that do NOT exist anywhere in the current schema /
// // relationships. Surfaced to the UI so it can say so explicitly rather
// // than silently inventing data. (If a field with one of these names is
// // ever added to User, it is auto-included and dropped from this list.)
// const REQUESTED_BUT_UNSUPPORTED = [
//   { label: "Gender", path: "gender" },
//   { label: "Parent Name", path: "parentName" },
//   { label: "Parent Mobile", path: "parentMobile" },
//   { label: "Qualification", path: "qualification" },
//   { label: "College", path: "college" },
//   { label: "Email Verified", path: "emailVerified" },
//   { label: "Created By", path: "createdBy" },
//   { label: "Course Categories", path: null },
//   { label: "Learning Hours", path: null },
//   { label: "Total Learning Time", path: null },
// ];

// const humanize = (path) =>
//   path
//     .replace(/\./g, " ")
//     .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());

// const schemaTypeOf = (schemaType) => {
//   const inst = schemaType?.instance;
//   if (inst === "Date") return "date";
//   if (inst === "Boolean") return "boolean";
//   if (inst === "Number") return "number";
//   return "string";
// };

// const getPath = (obj, path) =>
//   path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);

// /** Columns generated from the live User schema. */
// const buildUserSchemaColumns = () => {
//   const cols = [];
//   User.schema.eachPath((path, schemaType) => {
//     if (USER_PATHS_EXCLUDED.has(path)) return;
//     if (path.startsWith("_")) return;
//     if (schemaType?.options?.select === false) return;
//     // Arrays / sub-documents / ObjectId refs aren't meaningful as raw cells.
//     if (["Array", "ObjectId", "Embedded", "Mixed", "Map"].includes(schemaType?.instance)) return;

//     const meta = USER_FIELD_META[path] || {};
//     const type = schemaTypeOf(schemaType);
//     cols.push({
//       key: path,
//       label: meta.label || humanize(path),
//       group: meta.group || "Other Profile Fields",
//       order: meta.order ?? 100,
//       type,
//       source: "user",
//       // DOB is a calendar date (stored UTC-midnight); everything else is a
//       // timestamp displayed in the admin's local timezone.
//       get: (u, ctx) => {
//         const v = getPath(u, path);
//         if (type === "date") {
//           return path === "dateOfBirth"
//             ? toUtcCalendarDate(v)
//             : toLocalCalendarDate(v, ctx.tzOffset);
//         }
//         if (type === "boolean") return v == null ? null : v ? "Yes" : "No";
//         if (path === "role" && v) return String(v).replace(/_/g, " ");
//         return v;
//       },
//     });
//   });
//   return cols;
// };

// // Derived + relationship columns. `needs` lists the batch loaders the
// // column depends on (see LOADERS below).
// const DERIVED_COLUMNS = [
//   {
//     key: "learnerId",
//     label: "Learner ID",
//     group: "Account",
//     order: 39,
//     type: "string",
//     get: (u) => String(u._id),
//   },
//   {
//     key: "fullName",
//     label: "Full Name",
//     group: "Personal",
//     order: 13,
//     type: "string",
//     // Same derivation used everywhere else (never "John  Smith"; falls
//     // back to the legacy `name` for pre-existing users).
//     get: (u) => deriveFullName(u),
//   },
//   {
//     key: "accountStatus",
//     label: "Account Status",
//     group: "Account",
//     order: 44,
//     type: "string",
//     // Identical rule to the existing Candidate History export
//     // (adminController.exportLearnerHistory) so both exports agree.
//     get: (u) => (u.isFirstLogin ? "Not yet logged in" : "Active"),
//   },
//   {
//     key: "organization",
//     label: "Organization (Partner Institute)",
//     group: "Account",
//     order: 48,
//     type: "string",
//     needs: ["orgs"],
//     get: (u, ctx) =>
//       u.partnerInstitute
//         ? ctx.data.orgs.partner.get(String(u.partnerInstitute)) || ""
//         : "",
//   },
//   {
//     key: "awardingOrganisationName",
//     label: "Awarding Organisation",
//     group: "Account",
//     order: 49,
//     type: "string",
//     needs: ["orgs"],
//     get: (u, ctx) =>
//       u.awardingOrganisation
//         ? ctx.data.orgs.ao.get(String(u.awardingOrganisation)) || ""
//         : "",
//   },

//   // ── Courses & progress ────────────────────────────────────────────────
//   {
//     key: "coursesEnrolled",
//     label: "Courses Enrolled In",
//     group: "Courses & Progress",
//     order: 200,
//     type: "string",
//     needs: ["courses"],
//     get: (u, ctx) =>
//       (u.enrolledCourses || [])
//         .map((id) => ctx.data.courses.get(String(id)))
//         .filter(Boolean)
//         .join("; "),
//   },
//   {
//     key: "totalCoursesEnrolled",
//     label: "Total Courses Enrolled",
//     group: "Courses & Progress",
//     order: 201,
//     type: "number",
//     get: (u) => (u.enrolledCourses || []).length,
//   },
//   {
//     key: "activeCourses",
//     label: "Active Courses",
//     group: "Courses & Progress",
//     order: 202,
//     type: "number",
//     needs: ["progress"],
//     get: (u, ctx) => {
//       const p = ctx.data.progress.get(String(u._id));
//       const total = (u.enrolledCourses || []).length;
//       return Math.max(total - (p?.completedCourses || 0), 0);
//     },
//   },
//   {
//     key: "completedCourses",
//     label: "Completed Courses",
//     group: "Courses & Progress",
//     order: 203,
//     type: "number",
//     needs: ["progress"],
//     get: (u, ctx) => ctx.data.progress.get(String(u._id))?.completedCourses || 0,
//   },
//   {
//     key: "courseProgress",
//     label: "Course Progress (per course)",
//     group: "Courses & Progress",
//     order: 204,
//     type: "string",
//     needs: ["courses", "progress"],
//     get: (u, ctx) => {
//       const p = ctx.data.progress.get(String(u._id));
//       return (u.enrolledCourses || [])
//         .map((cid) => {
//           const title = ctx.data.courses.get(String(cid));
//           if (!title) return null;
//           const pct = p?.perCourse.get(String(cid));
//           return `${title}: ${pct == null ? "n/a" : `${pct}%`}`;
//         })
//         .filter(Boolean)
//         .join("; ");
//     },
//   },
//   {
//     key: "overallProgress",
//     label: "Overall Course Progress (%)",
//     group: "Courses & Progress",
//     order: 205,
//     type: "percent",
//     needs: ["progress"],
//     get: (u, ctx) => ctx.data.progress.get(String(u._id))?.overall ?? null,
//   },
//   {
//     key: "lastCourseActivity",
//     label: "Last Course Activity",
//     group: "Courses & Progress",
//     order: 206,
//     type: "date",
//     needs: ["progress"],
//     get: (u, ctx) =>
//       toLocalCalendarDate(
//         ctx.data.progress.get(String(u._id))?.lastActivity,
//         ctx.tzOffset,
//       ),
//   },
//   {
//     key: "assignedCoursesList",
//     label: "Assigned Courses (Tutors)",
//     group: "Courses & Progress",
//     order: 207,
//     type: "string",
//     needs: ["courses"],
//     get: (u, ctx) =>
//       (u.assignedCourses || [])
//         .map((id) => ctx.data.courses.get(String(id)))
//         .filter(Boolean)
//         .join("; "),
//   },

//   // ── Assessments & scores ──────────────────────────────────────────────
//   {
//     key: "examsAttempted",
//     label: "Total Exams Attempted",
//     group: "Assessments & Scores",
//     order: 300,
//     type: "number",
//     needs: ["exams"],
//     get: (u, ctx) => ctx.data.exams.get(String(u._id))?.count || 0,
//   },
//   {
//     key: "examScores",
//     label: "Exam Scores",
//     group: "Assessments & Scores",
//     order: 301,
//     type: "string",
//     needs: ["exams"],
//     get: (u, ctx) =>
//       (ctx.data.exams.get(String(u._id))?.items || [])
//         .map((e) => `${e.title}: ${e.pct}%`)
//         .join("; "),
//   },
//   {
//     key: "averageExamScore",
//     label: "Average Exam Score (%)",
//     group: "Assessments & Scores",
//     order: 302,
//     type: "percent",
//     needs: ["exams"],
//     get: (u, ctx) => avg(ctx.data.exams.get(String(u._id))?.items.map((i) => i.pct)),
//   },
//   {
//     key: "assignmentsSubmitted",
//     label: "Total Assignments Submitted",
//     group: "Assessments & Scores",
//     order: 303,
//     type: "number",
//     needs: ["submissions"],
//     get: (u, ctx) => ctx.data.submissions.get(String(u._id))?.count || 0,
//   },
//   {
//     key: "assignmentScores",
//     label: "Assignment Scores",
//     group: "Assessments & Scores",
//     order: 304,
//     type: "string",
//     needs: ["submissions"],
//     get: (u, ctx) =>
//       (ctx.data.submissions.get(String(u._id))?.items || [])
//         .map((s) => `${s.title}: ${s.score}/${s.total} (${s.pct}%)`)
//         .join("; "),
//   },
//   {
//     key: "averageAssignmentScore",
//     label: "Average Assignment Score (%)",
//     group: "Assessments & Scores",
//     order: 305,
//     type: "percent",
//     needs: ["submissions"],
//     get: (u, ctx) =>
//       avg(ctx.data.submissions.get(String(u._id))?.items.map((i) => i.pct)),
//   },
//   {
//     key: "chapterQuizAverage",
//     label: "Average Chapter Quiz Score (%)",
//     group: "Assessments & Scores",
//     order: 306,
//     type: "percent",
//     needs: ["progress"],
//     get: (u, ctx) => avg(ctx.data.progress.get(String(u._id))?.quizPcts),
//   },
//   {
//     key: "quizzesAttempted",
//     label: "Total Quizzes Attempted",
//     group: "Assessments & Scores",
//     order: 307,
//     type: "number",
//     needs: ["quizzes"],
//     get: (u, ctx) => ctx.data.quizzes.get(String(u._id)) || 0,
//   },
//   {
//     key: "scenarioExamsAttempted",
//     label: "Total Scenario Exams Attempted",
//     group: "Assessments & Scores",
//     order: 308,
//     type: "number",
//     needs: ["scenario"],
//     get: (u, ctx) => ctx.data.scenario.get(String(u._id)) || 0,
//   },
//   {
//     key: "totalAssessmentsAttempted",
//     label: "Total Assessments Attempted",
//     group: "Assessments & Scores",
//     order: 309,
//     type: "number",
//     needs: ["exams", "submissions", "quizzes", "scenario"],
//     get: (u, ctx) => {
//       const id = String(u._id);
//       return (
//         (ctx.data.exams.get(id)?.count || 0) +
//         (ctx.data.submissions.get(id)?.count || 0) +
//         (ctx.data.quizzes.get(id) || 0) +
//         (ctx.data.scenario.get(id) || 0)
//       );
//     },
//   },
//   {
//     key: "overallAverageScore",
//     label: "Overall Average Score (%)",
//     group: "Assessments & Scores",
//     order: 310,
//     type: "percent",
//     needs: ["exams", "submissions", "progress"],
//     get: (u, ctx) => avg(allScorePcts(u, ctx)),
//   },
//   {
//     key: "highestScore",
//     label: "Highest Score (%)",
//     group: "Assessments & Scores",
//     order: 311,
//     type: "percent",
//     needs: ["exams", "submissions", "progress"],
//     get: (u, ctx) => {
//       const s = allScorePcts(u, ctx);
//       return s.length ? Math.max(...s) : null;
//     },
//   },
//   {
//     key: "lowestScore",
//     label: "Lowest Score (%)",
//     group: "Assessments & Scores",
//     order: 312,
//     type: "percent",
//     needs: ["exams", "submissions", "progress"],
//     get: (u, ctx) => {
//       const s = allScorePcts(u, ctx);
//       return s.length ? Math.min(...s) : null;
//     },
//   },

//   // ── Certificates ──────────────────────────────────────────────────────
//   {
//     key: "certificatesEarned",
//     label: "Certificates Earned",
//     group: "Certificates",
//     order: 400,
//     type: "number",
//     needs: ["certificates"],
//     get: (u, ctx) => ctx.data.certificates.get(String(u._id))?.length || 0,
//   },
//   {
//     key: "certificateNumbers",
//     label: "Certificate Numbers",
//     group: "Certificates",
//     order: 401,
//     type: "string",
//     needs: ["certificates"],
//     get: (u, ctx) =>
//       (ctx.data.certificates.get(String(u._id)) || [])
//         .map((c) => c.certificateNumber)
//         .join("; "),
//   },
//   {
//     key: "certificateCompletionDate",
//     label: "Certificate Completion Date (Latest)",
//     group: "Certificates",
//     order: 402,
//     type: "date",
//     needs: ["certificates"],
//     get: (u, ctx) => {
//       const list = ctx.data.certificates.get(String(u._id)) || [];
//       if (!list.length) return null;
//       const latest = list.reduce((a, b) =>
//         new Date(a.issuedAt || 0) > new Date(b.issuedAt || 0) ? a : b,
//       );
//       return toLocalCalendarDate(latest.issuedAt, ctx.tzOffset);
//     },
//   },

//   // ── Attendance (orientation sessions) ─────────────────────────────────
//   {
//     key: "attendanceSessions",
//     label: "Attendance — Sessions Marked",
//     group: "Attendance",
//     order: 500,
//     type: "number",
//     needs: ["attendance"],
//     get: (u, ctx) => ctx.data.attendance.get(String(u._id))?.total || 0,
//   },
//   {
//     key: "attendanceAttended",
//     label: "Attendance — Sessions Attended",
//     group: "Attendance",
//     order: 501,
//     type: "number",
//     needs: ["attendance"],
//     get: (u, ctx) => ctx.data.attendance.get(String(u._id))?.attended || 0,
//   },
//   {
//     key: "attendanceRate",
//     label: "Attendance Rate (%)",
//     group: "Attendance",
//     order: 502,
//     type: "percent",
//     needs: ["attendance"],
//     get: (u, ctx) => {
//       const a = ctx.data.attendance.get(String(u._id));
//       return a && a.total ? round1((a.attended / a.total) * 100) : null;
//     },
//   },

//   // ── Registration ──────────────────────────────────────────────────────
//   {
//     key: "registrationCourses",
//     label: "Registration — Requested Courses",
//     group: "Registration",
//     order: 600,
//     type: "string",
//     needs: ["registrations", "courses"],
//     get: (u, ctx) => {
//       const regs = ctx.data.registrations.get(String(u._id)) || [];
//       const ids = new Set();
//       for (const r of regs) {
//         if (r.course) ids.add(String(r.course));
//         for (const rc of r.requestedCourses || []) {
//           if (rc?.course) ids.add(String(rc.course));
//         }
//       }
//       return [...ids]
//         .map((id) => ctx.data.courses.get(id))
//         .filter(Boolean)
//         .join("; ");
//     },
//   },
//   {
//     key: "latestRegistrationStatus",
//     label: "Registration — Latest Status",
//     group: "Registration",
//     order: 601,
//     type: "string",
//     needs: ["registrations"],
//     get: (u, ctx) => ctx.data.registrations.get(String(u._id))?.[0]?.status || "",
//   },
//   {
//     key: "latestPaymentStatus",
//     label: "Registration — Latest Payment Status",
//     group: "Registration",
//     order: 602,
//     type: "string",
//     needs: ["registrations"],
//     get: (u, ctx) =>
//       ctx.data.registrations.get(String(u._id))?.[0]?.paymentStatus || "",
//   },
// ];

// function round1(n) {
//   return Math.round(n * 10) / 10;
// }

// function avg(list) {
//   const nums = (list || []).filter((n) => Number.isFinite(n));
//   if (!nums.length) return null;
//   return round1(nums.reduce((a, b) => a + b, 0) / nums.length);
// }

// // Every percentage-normalised score we can trust: exam attempts
// // (Attempt.result.percentage), graded assignments (score / totalMarks) and
// // chapter quizzes (ChapterProgress.chapterResults[].percentage).
// // QuizAttempt.score is intentionally NOT mixed in: depending on the code
// // path that wrote it, it holds either a percentage (orientation quiz) or
// // raw marks (course quiz), so it cannot be compared reliably.
// function allScorePcts(u, ctx) {
//   const id = String(u._id);
//   return [
//     ...(ctx.data.exams.get(id)?.items.map((i) => i.pct) || []),
//     ...(ctx.data.submissions.get(id)?.items.map((i) => i.pct) || []),
//     ...(ctx.data.progress.get(id)?.quizPcts || []),
//   ].filter((n) => Number.isFinite(n));
// }

// let cachedCatalog = null;

// /** Full ordered column catalog (cached — the schema can't change at runtime). */
// export const getExportColumnCatalog = () => {
//   if (cachedCatalog) return cachedCatalog;
//   const userCols = buildUserSchemaColumns();
//   const userKeys = new Set(userCols.map((c) => c.key));
//   const all = [...userCols, ...DERIVED_COLUMNS.filter((c) => !userKeys.has(c.key))];
//   all.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
//   cachedCatalog = all;
//   return all;
// };

// /** Public (JSON-safe) version of the catalog for the UI. */
// export const getPublicExportColumns = () =>
//   getExportColumnCatalog().map(({ key, label, group, type }) => ({
//     key,
//     label,
//     group,
//     type,
//   }));

// /** Requested columns that the current schema cannot provide. */
// export const getUnavailableExportColumns = () =>
//   REQUESTED_BUT_UNSUPPORTED.filter(
//     (c) => !c.path || !User.schema.path(c.path),
//   ).map((c) => c.label);

// // ═══════════════════════════════════════════════════════════════════════
// //  2. Batch loaders (one round-trip per collection per batch of users)
// // ═══════════════════════════════════════════════════════════════════════

// const toIds = (users) => users.map((u) => u._id);

// const LOADERS = {
//   async courses(users) {
//     const ids = new Set();
//     for (const u of users) {
//       for (const c of u.enrolledCourses || []) ids.add(String(c));
//       for (const c of u.assignedCourses || []) ids.add(String(c));
//     }
//     // Registration courses are added by the registrations loader below
//     // (it runs first when both are needed).
//     for (const regs of this.registrations?.values?.() || []) {
//       for (const r of regs) {
//         if (r.course) ids.add(String(r.course));
//         for (const rc of r.requestedCourses || []) {
//           if (rc?.course) ids.add(String(rc.course));
//         }
//       }
//     }
//     if (!ids.size) return new Map();
//     const docs = await Course.find({ _id: { $in: [...ids] } })
//       .select("title")
//       .lean();
//     return new Map(docs.map((d) => [String(d._id), d.title]));
//   },

//   async progress(users) {
//     const userIds = toIds(users);
//     const docs = await ChapterProgress.find({ studentId: { $in: userIds } })
//       .select("studentId courseId completedChapters chapterResults updatedAt")
//       .lean();

//     const courseIds = [
//       ...new Set([
//         ...docs.map((d) => String(d.courseId)),
//         ...users.flatMap((u) => (u.enrolledCourses || []).map(String)),
//       ]),
//     ].map((id) => new mongoose.Types.ObjectId(id));

//     const totals = courseIds.length
//       ? await Chapter.aggregate([
//           { $match: { courseId: { $in: courseIds } } },
//           { $group: { _id: "$courseId", total: { $sum: 1 } } },
//         ])
//       : [];
//     const totalByCourse = new Map(totals.map((t) => [String(t._id), t.total]));

//     const docsByUser = new Map();
//     for (const d of docs) {
//       const k = String(d.studentId);
//       if (!docsByUser.has(k)) docsByUser.set(k, []);
//       docsByUser.get(k).push(d);
//     }

//     const out = new Map();
//     for (const u of users) {
//       const list = docsByUser.get(String(u._id)) || [];
//       const byCourse = new Map(list.map((d) => [String(d.courseId), d]));
//       const perCourse = new Map();
//       let completedCourses = 0;
//       const pcts = [];

//       for (const cid of (u.enrolledCourses || []).map(String)) {
//         const total = totalByCourse.get(cid) || 0;
//         if (!total) {
//           perCourse.set(cid, null);
//           continue;
//         }
//         const done = byCourse.get(cid)?.completedChapters?.length || 0;
//         const pct = Math.min(100, round1((done / total) * 100));
//         perCourse.set(cid, pct);
//         pcts.push(pct);
//         if (done >= total) completedCourses += 1;
//       }

//       const quizPcts = [];
//       let lastActivity = null;
//       for (const d of list) {
//         const results = d.chapterResults || {};
//         // .lean() returns a Map field as a plain object.
//         const values =
//           results instanceof Map ? [...results.values()] : Object.values(results);
//         for (const r of values) {
//           if (r && Number.isFinite(r.percentage)) quizPcts.push(r.percentage);
//         }
//         if (d.updatedAt && (!lastActivity || d.updatedAt > lastActivity)) {
//           lastActivity = d.updatedAt;
//         }
//       }

//       out.set(String(u._id), {
//         perCourse,
//         completedCourses,
//         overall: avg(pcts),
//         quizPcts,
//         lastActivity,
//       });
//     }
//     return out;
//   },

//   async exams(users) {
//     const attempts = await Attempt.find({
//       studentId: { $in: toIds(users) },
//       status: { $in: ["submitted", "expired"] },
//     })
//       .select("studentId examId attemptNumber result.percentage submittedAt")
//       .sort({ submittedAt: 1 })
//       .lean();
//     const examIds = [...new Set(attempts.map((a) => String(a.examId)))];
//     const exams = examIds.length
//       ? await Exam.find({ _id: { $in: examIds } }).select("title").lean()
//       : [];
//     const titleById = new Map(exams.map((e) => [String(e._id), e.title]));

//     const out = new Map();
//     for (const a of attempts) {
//       const k = String(a.studentId);
//       if (!out.has(k)) out.set(k, { count: 0, items: [] });
//       const entry = out.get(k);
//       entry.count += 1;
//       const pct = Number(a.result?.percentage);
//       if (Number.isFinite(pct)) {
//         const title = titleById.get(String(a.examId)) || "Exam";
//         entry.items.push({
//           title: a.attemptNumber > 1 ? `${title} (attempt ${a.attemptNumber})` : title,
//           pct: round1(pct),
//         });
//       }
//     }
//     return out;
//   },

//   async submissions(users) {
//     const subs = await Submission.find({
//       studentId: { $in: toIds(users) },
//       status: { $ne: "not_submitted" },
//     })
//       .select("studentId assignmentId totalScore")
//       .lean();
//     const assignmentIds = [...new Set(subs.map((s) => String(s.assignmentId)))];
//     const assignments = assignmentIds.length
//       ? await Assignment.find({ _id: { $in: assignmentIds } })
//           .select("title totalMarks")
//           .lean()
//       : [];
//     const aById = new Map(assignments.map((a) => [String(a._id), a]));

//     const out = new Map();
//     for (const s of subs) {
//       const k = String(s.studentId);
//       if (!out.has(k)) out.set(k, { count: 0, items: [] });
//       const entry = out.get(k);
//       entry.count += 1;
//       const a = aById.get(String(s.assignmentId));
//       const total = Number(a?.totalMarks);
//       const score = Number(s.totalScore);
//       if (s.totalScore != null && Number.isFinite(score) && total > 0) {
//         entry.items.push({
//           title: a?.title || "Assignment",
//           score,
//           total,
//           pct: round1((score / total) * 100),
//         });
//       }
//     }
//     return out;
//   },

//   async quizzes(users) {
//     const rows = await QuizAttempt.aggregate([
//       { $match: { studentId: { $in: toIds(users) } } },
//       { $group: { _id: "$studentId", n: { $sum: 1 } } },
//     ]);
//     return new Map(rows.map((r) => [String(r._id), r.n]));
//   },

//   async scenario(users) {
//     const rows = await ScenarioExamAttempt.aggregate([
//       {
//         $match: {
//           studentId: { $in: toIds(users) },
//           status: { $in: ["submitted", "reviewed"] },
//         },
//       },
//       { $group: { _id: "$studentId", n: { $sum: 1 } } },
//     ]);
//     return new Map(rows.map((r) => [String(r._id), r.n]));
//   },

//   async certificates(users) {
//     const certs = await Certificate.find({
//       studentId: { $in: toIds(users) },
//       status: "issued",
//     })
//       .select("studentId certificateNumber issuedAt")
//       .sort({ issuedAt: 1 })
//       .lean();
//     const out = new Map();
//     for (const c of certs) {
//       const k = String(c.studentId);
//       if (!out.has(k)) out.set(k, []);
//       out.get(k).push(c);
//     }
//     return out;
//   },

//   async attendance(users) {
//     const rows = await Attendance.aggregate([
//       { $match: { student: { $in: toIds(users) } } },
//       {
//         $group: {
//           _id: "$student",
//           total: { $sum: 1 },
//           attended: {
//             $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] },
//           },
//         },
//       },
//     ]);
//     return new Map(
//       rows.map((r) => [String(r._id), { total: r.total, attended: r.attended }]),
//     );
//   },

//   async registrations(users) {
//     const regs = await Registration.find({ student: { $in: toIds(users) } })
//       .select("student course requestedCourses status paymentStatus createdAt")
//       .sort({ createdAt: -1 })
//       .lean();
//     const out = new Map();
//     for (const r of regs) {
//       const k = String(r.student);
//       if (!out.has(k)) out.set(k, []);
//       out.get(k).push(r);
//     }
//     return out;
//   },

//   async orgs(users) {
//     const pIds = [...new Set(users.map((u) => u.partnerInstitute).filter(Boolean).map(String))];
//     const aIds = [...new Set(users.map((u) => u.awardingOrganisation).filter(Boolean).map(String))];
//     const [p, a] = await Promise.all([
//       pIds.length
//         ? PartnerInstitute.find({ _id: { $in: pIds } }).select("name").lean()
//         : [],
//       aIds.length
//         ? AwardingOrganisation.find({ _id: { $in: aIds } }).select("name").lean()
//         : [],
//     ]);
//     return {
//       partner: new Map(p.map((d) => [String(d._id), d.name])),
//       ao: new Map(a.map((d) => [String(d._id), d.name])),
//     };
//   },
// };

// // `courses` must run after `registrations` so registration course titles
// // can be resolved in the same lookup.
// const LOADER_ORDER = [
//   "registrations",
//   "orgs",
//   "progress",
//   "exams",
//   "submissions",
//   "quizzes",
//   "scenario",
//   "certificates",
//   "attendance",
//   "courses",
// ];

// const EMPTY_FOR = {
//   orgs: () => ({ partner: new Map(), ao: new Map() }),
// };

// /**
//  * Loads only the relationship data the selected columns need, for one
//  * batch of users. A failing loader (e.g. a collection that doesn't exist
//  * in this deployment) degrades to empty data for that group instead of
//  * failing the whole export.
//  */
// const loadBatchData = async (users, needs) => {
//   const data = {};
//   for (const name of LOADER_ORDER) {
//     if (!needs.has(name)) {
//       data[name] = EMPTY_FOR[name] ? EMPTY_FOR[name]() : new Map();
//       continue;
//     }
//     try {
//       data[name] = await LOADERS[name].call(data, users);
//     } catch (err) {
//       console.warn(`[learnerExport] "${name}" data unavailable:`, err.message);
//       data[name] = EMPTY_FOR[name] ? EMPTY_FOR[name]() : new Map();
//     }
//   }
//   return data;
// };

// // ═══════════════════════════════════════════════════════════════════════
// //  3. Workbook generation
// // ═══════════════════════════════════════════════════════════════════════

// /** Validates/normalises the requested column keys, preserving order. */
// export const resolveColumns = (keys) => {
//   if (!Array.isArray(keys)) return [];
//   const byKey = new Map(getExportColumnCatalog().map((c) => [c.key, c]));
//   const seen = new Set();
//   const out = [];
//   for (const k of keys) {
//     if (typeof k !== "string" || seen.has(k) || !byKey.has(k)) continue;
//     seen.add(k);
//     out.push(byKey.get(k));
//   }
//   return out;
// };

// const cellTextLength = (value, type) => {
//   if (value == null || value === "") return 0;
//   if (type === "date") return 10; // MM/DD/YYYY
//   return String(value).length;
// };

// /**
//  * Counts matching users (used to reject empty / oversized exports before
//  * doing any heavy work).
//  */
// export const countExportRows = (filter) => User.countDocuments(filter);

// /**
//  * Builds the .xlsx and returns it as a Buffer.
//  *
//  * @param {object}   opts
//  * @param {object}   opts.filter    Mongo filter from buildUserFilter()
//  * @param {object}   opts.sortSpec  result of buildSort()
//  * @param {object[]} opts.columns   result of resolveColumns() (ordered)
//  * @param {number}   opts.tzOffset  admin's browser timezone offset
//  */
// export const buildLearnersWorkbook = async ({
//   filter,
//   sortSpec,
//   columns,
//   tzOffset = 0,
// }) => {
//   const needs = new Set(columns.flatMap((c) => c.needs || []));

//   const projection = Object.fromEntries(SENSITIVE_USER_FIELDS.map((f) => [f, 0]));
//   const pipeline = [{ $match: filter }];
//   if (sortSpec.addFields) pipeline.push({ $addFields: sortSpec.addFields });
//   pipeline.push({ $sort: sortSpec.sort });
//   pipeline.push({ $limit: MAX_EXPORT_ROWS });
//   pipeline.push({
//     $project: sortSpec.addFields
//       ? { ...projection, [SORT_KEY_FIELD]: 0 }
//       : projection,
//   });

//   const users = await User.aggregate(pipeline)
//     .collation(SORT_COLLATION)
//     .allowDiskUse(true);

//   const workbook = new ExcelJS.Workbook();
//   workbook.creator = "1A HK International LMS";
//   workbook.created = new Date();

//   const sheet = workbook.addWorksheet(EXPORT_SHEET_NAME, {
//     views: [{ state: "frozen", ySplit: 1 }],
//   });

//   sheet.columns = columns.map((c) => ({ header: c.label, key: c.key }));

//   const header = sheet.getRow(1);
//   header.font = { bold: true, color: { argb: "FF1F2937" } };
//   header.alignment = { vertical: "middle" };
//   header.height = 20;
//   header.eachCell((cell) => {
//     cell.fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: { argb: "FFEEF2FF" }, // indigo-50, matches the admin theme
//     };
//     cell.border = { bottom: { style: "thin", color: { argb: "FFC7D2FE" } } };
//   });

//   const widths = columns.map((c) => c.label.length);

//   for (let i = 0; i < users.length; i += BATCH_SIZE) {
//     const batch = users.slice(i, i + BATCH_SIZE);
//     const data = await loadBatchData(batch, needs);
//     const ctx = { data, tzOffset };

//     for (const u of batch) {
//       const values = columns.map((c, idx) => {
//         let v;
//         try {
//           v = c.get(u, ctx);
//         } catch {
//           v = null; // one bad value never breaks the whole export
//         }
//         if (v === undefined || v === null || Number.isNaN(v)) v = "";
//         if (v instanceof Date && Number.isNaN(v.getTime())) v = "";
//         widths[idx] = Math.max(widths[idx], cellTextLength(v, c.type));
//         return v;
//       });
//       sheet.addRow(values);
//     }
//   }

//   columns.forEach((c, idx) => {
//     const col = sheet.getColumn(idx + 1);
//     col.width = Math.min(Math.max(widths[idx] + 2, 10), 60);
//     if (c.type === "date") col.numFmt = "mm/dd/yyyy";
//     if (c.type === "percent") col.numFmt = "0.0";
//     if (c.type === "string") col.alignment = { wrapText: false };
//   });

//   if (columns.length) {
//     sheet.autoFilter = {
//       from: { row: 1, column: 1 },
//       to: { row: 1, column: columns.length },
//     };
//   }

//   const buffer = await workbook.xlsx.writeBuffer();
//   return { buffer: Buffer.from(buffer), rowCount: users.length };
// };

// /** "Learners_MM-DD-YYYY.xlsx" using the admin's local export date. */
// export const buildExportFilename = (tzOffset = 0, now = new Date()) => {
//   const local = new Date(now.getTime() - tzOffset * 60 * 1000);
//   const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
//   const dd = String(local.getUTCDate()).padStart(2, "0");
//   const yyyy = local.getUTCFullYear();
//   return `Learners_${mm}-${dd}-${yyyy}.xlsx`;
// };






/**
 * learnerExportService
 *
 * Enterprise "Export Learners" (.xlsx) for the admin Learners page.
 *
 *  - The column catalog is generated from the live User schema (so any
 *    field added to User later shows up automatically), plus derived
 *    columns and columns computed from collections that ALREADY reference
 *    the user (Course, ChapterProgress, Chapter, Attempt, Submission,
 *    Assignment, QuizAttempt, ScenarioExamAttempt, Certificate,
 *    Attendance, Registration, PartnerInstitute, AwardingOrganisation).
 *    No schema is invented — fields that don't exist are reported back as
 *    `unavailableColumns` so the UI can say so explicitly.
 *
 *  - PER-ASSESSMENT MARKS: every Exam and every Assignment in the system is
 *    offered as its own column (named after the exam / assignment), so a
 *    learner's mark for one specific assessment can be exported on its own.
 *    These columns are dynamic (read from the Exam / Assignment collections
 *    at request time) and use keys `exam:<id>` / `assignment:<id>`.
 *
 *  - Related data is loaded in BATCHES keyed by user id ($in queries /
 *    $group aggregations), never one query per user (no N+1), and ONLY for
 *    the relationship groups the selected columns actually need.
 *
 *  - The workbook is built fully in memory and only sent once it has been
 *    generated successfully, so a generation failure turns into a clean
 *    JSON error instead of a half-written download.
 */
import ExcelJS from "exceljs";
import mongoose from "mongoose";

import User from "../models/User.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import ChapterProgress from "../models/ChapterProgress.js";
import Attempt from "../models/Attempt.js";
import Exam from "../models/Exam.js";
import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import QuizAttempt from "../models/QuizAttempt.js";
import ScenarioExamAttempt from "../models/ScenarioExamAttempt.js";
import Certificate from "../models/Certificate.js";
import Attendance from "../models/Attendance.js";
import Registration from "../models/Registration.js";
import PartnerInstitute from "../models/PartnerInstitute.js";
import AwardingOrganisation from "../models/AwardingOrganisation.js";

import { deriveFullName } from "../utils/nameUtils.js";
import {
  SENSITIVE_USER_FIELDS,
  SORT_COLLATION,
  SORT_KEY_FIELD,
  toLocalCalendarDate,
  toUtcCalendarDate,
} from "../utils/learnerFilters.js";

export const EXPORT_SHEET_NAME = "Learners Export";
export const MAX_EXPORT_ROWS = 50000;
const BATCH_SIZE = 1000;

// ═══════════════════════════════════════════════════════════════════════
//  1. Column catalog
// ═══════════════════════════════════════════════════════════════════════

// Friendly labels / groups for User schema paths we know about. Any User
// path NOT listed here is still exported (auto-labelled from its name).
const USER_FIELD_META = {
  firstName: { label: "First Name", group: "Personal", order: 10 },
  middleName: { label: "Middle Name", group: "Personal", order: 11 },
  lastName: { label: "Last Name", group: "Personal", order: 12 },
  dateOfBirth: { label: "Date of Birth", group: "Personal", order: 14 },
  email: { label: "Email", group: "Contact", order: 20 },
  countryCode: { label: "Country Code", group: "Contact", order: 21 },
  mobile: { label: "Mobile", group: "Contact", order: 22 },
  address: { label: "Address", group: "Address", order: 30 },
  addressLine1: { label: "Address Line 1", group: "Address", order: 31 },
  addressLine2: { label: "Address Line 2", group: "Address", order: 32 },
  city: { label: "City", group: "Address", order: 33 },
  state: { label: "State", group: "Address", order: 34 },
  postalCode: { label: "Pincode / Postal Code", group: "Address", order: 35 },
  country: { label: "Country", group: "Address", order: 36 },
  role: { label: "Role", group: "Account", order: 40 },
  createdAt: { label: "Registration Date", group: "Account", order: 41 },
  registeredVia: { label: "Registration Source", group: "Account", order: 42 },
  lastLoginAt: { label: "Last Login", group: "Account", order: 43 },
  isFirstLogin: { label: "First Login Pending", group: "Account", order: 45 },
  updatedAt: { label: "Updated At", group: "Account", order: 46 },
  avatar: { label: "Avatar URL", group: "Account", order: 47 },
};

// Paths that are never exported directly: secrets, internals, and refs
// that are exported through a friendlier derived/relationship column.
const USER_PATHS_EXCLUDED = new Set([
  ...SENSITIVE_USER_FIELDS,
  "_id",
  "__v",
  "id",
  "name", // legacy single name — covered by "Full Name" (falls back to it)
  "enrolledCourses", // → Courses Enrolled In / Total Courses Enrolled
  "assignedCourses", // → Assigned Courses (title lookup)
  "partnerInstitute", // → Organization (Partner Institute)
  "awardingOrganisation", // → Awarding Organisation
]);

// Requested columns that do NOT exist anywhere in the current schema /
// relationships. Surfaced to the UI so it can say so explicitly rather
// than silently inventing data. (If a field with one of these names is
// ever added to User, it is auto-included and dropped from this list.)
const REQUESTED_BUT_UNSUPPORTED = [
  { label: "Gender", path: "gender" },
  { label: "Parent Name", path: "parentName" },
  { label: "Parent Mobile", path: "parentMobile" },
  { label: "Qualification", path: "qualification" },
  { label: "College", path: "college" },
  { label: "Email Verified", path: "emailVerified" },
  { label: "Created By", path: "createdBy" },
  { label: "Course Categories", path: null },
  { label: "Learning Hours", path: null },
  { label: "Total Learning Time", path: null },
];

const humanize = (path) =>
  path
    .replace(/\./g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const schemaTypeOf = (schemaType) => {
  const inst = schemaType?.instance;
  if (inst === "Date") return "date";
  if (inst === "Boolean") return "boolean";
  if (inst === "Number") return "number";
  return "string";
};

const getPath = (obj, path) =>
  path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);

/** Columns generated from the live User schema. */
const buildUserSchemaColumns = () => {
  const cols = [];
  User.schema.eachPath((path, schemaType) => {
    if (USER_PATHS_EXCLUDED.has(path)) return;
    if (path.startsWith("_")) return;
    if (schemaType?.options?.select === false) return;
    // Arrays / sub-documents / ObjectId refs aren't meaningful as raw cells.
    if (["Array", "ObjectId", "Embedded", "Mixed", "Map"].includes(schemaType?.instance)) return;

    const meta = USER_FIELD_META[path] || {};
    const type = schemaTypeOf(schemaType);
    cols.push({
      key: path,
      label: meta.label || humanize(path),
      group: meta.group || "Other Profile Fields",
      order: meta.order ?? 100,
      type,
      source: "user",
      // DOB is a calendar date (stored UTC-midnight); everything else is a
      // timestamp displayed in the admin's local timezone.
      get: (u, ctx) => {
        const v = getPath(u, path);
        if (type === "date") {
          return path === "dateOfBirth"
            ? toUtcCalendarDate(v)
            : toLocalCalendarDate(v, ctx.tzOffset);
        }
        if (type === "boolean") return v == null ? null : v ? "Yes" : "No";
        if (path === "role" && v) return String(v).replace(/_/g, " ");
        return v;
      },
    });
  });
  return cols;
};

// Derived + relationship columns. `needs` lists the batch loaders the
// column depends on (see LOADERS below).
const DERIVED_COLUMNS = [
  {
    key: "learnerId",
    label: "Learner ID",
    group: "Account",
    order: 39,
    type: "string",
    get: (u) => String(u._id),
  },
  {
    key: "fullName",
    label: "Full Name",
    group: "Personal",
    order: 13,
    type: "string",
    // Same derivation used everywhere else (never "John  Smith"; falls
    // back to the legacy `name` for pre-existing users).
    get: (u) => deriveFullName(u),
  },
  {
    key: "accountStatus",
    label: "Account Status",
    group: "Account",
    order: 44,
    type: "string",
    // Identical rule to the existing Candidate History export
    // (adminController.exportLearnerHistory) so both exports agree.
    get: (u) => (u.isFirstLogin ? "Not yet logged in" : "Active"),
  },
  {
    key: "organization",
    label: "Organization (Partner Institute)",
    group: "Account",
    order: 48,
    type: "string",
    needs: ["orgs"],
    get: (u, ctx) =>
      u.partnerInstitute
        ? ctx.data.orgs.partner.get(String(u.partnerInstitute)) || ""
        : "",
  },
  {
    key: "awardingOrganisationName",
    label: "Awarding Organisation",
    group: "Account",
    order: 49,
    type: "string",
    needs: ["orgs"],
    get: (u, ctx) =>
      u.awardingOrganisation
        ? ctx.data.orgs.ao.get(String(u.awardingOrganisation)) || ""
        : "",
  },

  // ── Courses & progress ────────────────────────────────────────────────
  {
    key: "coursesEnrolled",
    label: "Courses Enrolled In",
    group: "Courses & Progress",
    order: 200,
    type: "string",
    needs: ["courses"],
    get: (u, ctx) =>
      (u.enrolledCourses || [])
        .map((id) => ctx.data.courses.get(String(id)))
        .filter(Boolean)
        .join("; "),
  },
  {
    key: "totalCoursesEnrolled",
    label: "Total Courses Enrolled",
    group: "Courses & Progress",
    order: 201,
    type: "number",
    get: (u) => (u.enrolledCourses || []).length,
  },
  {
    key: "activeCourses",
    label: "Active Courses",
    group: "Courses & Progress",
    order: 202,
    type: "number",
    needs: ["progress"],
    get: (u, ctx) => {
      const p = ctx.data.progress.get(String(u._id));
      const total = (u.enrolledCourses || []).length;
      return Math.max(total - (p?.completedCourses || 0), 0);
    },
  },
  {
    key: "completedCourses",
    label: "Completed Courses",
    group: "Courses & Progress",
    order: 203,
    type: "number",
    needs: ["progress"],
    get: (u, ctx) => ctx.data.progress.get(String(u._id))?.completedCourses || 0,
  },
  {
    key: "courseProgress",
    label: "Course Progress (per course)",
    group: "Courses & Progress",
    order: 204,
    type: "string",
    needs: ["courses", "progress"],
    get: (u, ctx) => {
      const p = ctx.data.progress.get(String(u._id));
      return (u.enrolledCourses || [])
        .map((cid) => {
          const title = ctx.data.courses.get(String(cid));
          if (!title) return null;
          const pct = p?.perCourse.get(String(cid));
          return `${title}: ${pct == null ? "n/a" : `${pct}%`}`;
        })
        .filter(Boolean)
        .join("; ");
    },
  },
  {
    key: "overallProgress",
    label: "Overall Course Progress (%)",
    group: "Courses & Progress",
    order: 205,
    type: "percent",
    needs: ["progress"],
    get: (u, ctx) => ctx.data.progress.get(String(u._id))?.overall ?? null,
  },
  {
    key: "lastCourseActivity",
    label: "Last Course Activity",
    group: "Courses & Progress",
    order: 206,
    type: "date",
    needs: ["progress"],
    get: (u, ctx) =>
      toLocalCalendarDate(
        ctx.data.progress.get(String(u._id))?.lastActivity,
        ctx.tzOffset,
      ),
  },
  {
    key: "assignedCoursesList",
    label: "Assigned Courses (Tutors)",
    group: "Courses & Progress",
    order: 207,
    type: "string",
    needs: ["courses"],
    get: (u, ctx) =>
      (u.assignedCourses || [])
        .map((id) => ctx.data.courses.get(String(id)))
        .filter(Boolean)
        .join("; "),
  },

  // ── Assessments & scores ──────────────────────────────────────────────
  {
    key: "examsAttempted",
    label: "Total Exams Attempted",
    group: "Assessments & Scores",
    order: 300,
    type: "number",
    needs: ["exams"],
    get: (u, ctx) => ctx.data.exams.get(String(u._id))?.count || 0,
  },
  {
    key: "examScores",
    label: "Exam Scores",
    group: "Assessments & Scores",
    order: 301,
    type: "string",
    needs: ["exams"],
    get: (u, ctx) =>
      (ctx.data.exams.get(String(u._id))?.items || [])
        .map((e) => `${e.title}: ${e.pct}%`)
        .join("; "),
  },
  {
    key: "averageExamScore",
    label: "Average Exam Score (%)",
    group: "Assessments & Scores",
    order: 302,
    type: "percent",
    needs: ["exams"],
    get: (u, ctx) => avg(ctx.data.exams.get(String(u._id))?.items.map((i) => i.pct)),
  },
  {
    key: "assignmentsSubmitted",
    label: "Total Assignments Submitted",
    group: "Assessments & Scores",
    order: 303,
    type: "number",
    needs: ["submissions"],
    get: (u, ctx) => ctx.data.submissions.get(String(u._id))?.count || 0,
  },
  {
    key: "assignmentScores",
    label: "Assignment Scores",
    group: "Assessments & Scores",
    order: 304,
    type: "string",
    needs: ["submissions"],
    get: (u, ctx) =>
      (ctx.data.submissions.get(String(u._id))?.items || [])
        .map((s) => `${s.title}: ${s.score}/${s.total} (${s.pct}%)`)
        .join("; "),
  },
  {
    key: "averageAssignmentScore",
    label: "Average Assignment Score (%)",
    group: "Assessments & Scores",
    order: 305,
    type: "percent",
    needs: ["submissions"],
    get: (u, ctx) =>
      avg(ctx.data.submissions.get(String(u._id))?.items.map((i) => i.pct)),
  },
  {
    key: "chapterQuizAverage",
    label: "Average Chapter Quiz Score (%)",
    group: "Assessments & Scores",
    order: 306,
    type: "percent",
    needs: ["progress"],
    get: (u, ctx) => avg(ctx.data.progress.get(String(u._id))?.quizPcts),
  },
  {
    key: "quizzesAttempted",
    label: "Total Quizzes Attempted",
    group: "Assessments & Scores",
    order: 307,
    type: "number",
    needs: ["quizzes"],
    get: (u, ctx) => ctx.data.quizzes.get(String(u._id)) || 0,
  },
  {
    key: "scenarioExamsAttempted",
    label: "Total Scenario Exams Attempted",
    group: "Assessments & Scores",
    order: 308,
    type: "number",
    needs: ["scenario"],
    get: (u, ctx) => ctx.data.scenario.get(String(u._id)) || 0,
  },
  {
    key: "totalAssessmentsAttempted",
    label: "Total Assessments Attempted",
    group: "Assessments & Scores",
    order: 309,
    type: "number",
    needs: ["exams", "submissions", "quizzes", "scenario"],
    get: (u, ctx) => {
      const id = String(u._id);
      return (
        (ctx.data.exams.get(id)?.count || 0) +
        (ctx.data.submissions.get(id)?.count || 0) +
        (ctx.data.quizzes.get(id) || 0) +
        (ctx.data.scenario.get(id) || 0)
      );
    },
  },
  {
    key: "overallAverageScore",
    label: "Overall Average Score (%)",
    group: "Assessments & Scores",
    order: 310,
    type: "percent",
    needs: ["exams", "submissions", "progress"],
    get: (u, ctx) => avg(allScorePcts(u, ctx)),
  },
  {
    key: "highestScore",
    label: "Highest Score (%)",
    group: "Assessments & Scores",
    order: 311,
    type: "percent",
    needs: ["exams", "submissions", "progress"],
    get: (u, ctx) => {
      const s = allScorePcts(u, ctx);
      return s.length ? Math.max(...s) : null;
    },
  },
  {
    key: "lowestScore",
    label: "Lowest Score (%)",
    group: "Assessments & Scores",
    order: 312,
    type: "percent",
    needs: ["exams", "submissions", "progress"],
    get: (u, ctx) => {
      const s = allScorePcts(u, ctx);
      return s.length ? Math.min(...s) : null;
    },
  },

  // ── Certificates ──────────────────────────────────────────────────────
  {
    key: "certificatesEarned",
    label: "Certificates Earned",
    group: "Certificates",
    order: 400,
    type: "number",
    needs: ["certificates"],
    get: (u, ctx) => ctx.data.certificates.get(String(u._id))?.length || 0,
  },
  {
    key: "certificateNumbers",
    label: "Certificate Numbers",
    group: "Certificates",
    order: 401,
    type: "string",
    needs: ["certificates"],
    get: (u, ctx) =>
      (ctx.data.certificates.get(String(u._id)) || [])
        .map((c) => c.certificateNumber)
        .join("; "),
  },
  {
    key: "certificateCompletionDate",
    label: "Certificate Completion Date (Latest)",
    group: "Certificates",
    order: 402,
    type: "date",
    needs: ["certificates"],
    get: (u, ctx) => {
      const list = ctx.data.certificates.get(String(u._id)) || [];
      if (!list.length) return null;
      const latest = list.reduce((a, b) =>
        new Date(a.issuedAt || 0) > new Date(b.issuedAt || 0) ? a : b,
      );
      return toLocalCalendarDate(latest.issuedAt, ctx.tzOffset);
    },
  },

  // ── Attendance (orientation sessions) ─────────────────────────────────
  {
    key: "attendanceSessions",
    label: "Attendance — Sessions Marked",
    group: "Attendance",
    order: 500,
    type: "number",
    needs: ["attendance"],
    get: (u, ctx) => ctx.data.attendance.get(String(u._id))?.total || 0,
  },
  {
    key: "attendanceAttended",
    label: "Attendance — Sessions Attended",
    group: "Attendance",
    order: 501,
    type: "number",
    needs: ["attendance"],
    get: (u, ctx) => ctx.data.attendance.get(String(u._id))?.attended || 0,
  },
  {
    key: "attendanceRate",
    label: "Attendance Rate (%)",
    group: "Attendance",
    order: 502,
    type: "percent",
    needs: ["attendance"],
    get: (u, ctx) => {
      const a = ctx.data.attendance.get(String(u._id));
      return a && a.total ? round1((a.attended / a.total) * 100) : null;
    },
  },

  // ── Registration ──────────────────────────────────────────────────────
  {
    key: "registrationCourses",
    label: "Registration — Requested Courses",
    group: "Registration",
    order: 600,
    type: "string",
    needs: ["registrations", "courses"],
    get: (u, ctx) => {
      const regs = ctx.data.registrations.get(String(u._id)) || [];
      const ids = new Set();
      for (const r of regs) {
        if (r.course) ids.add(String(r.course));
        for (const rc of r.requestedCourses || []) {
          if (rc?.course) ids.add(String(rc.course));
        }
      }
      return [...ids]
        .map((id) => ctx.data.courses.get(id))
        .filter(Boolean)
        .join("; ");
    },
  },
  {
    key: "latestRegistrationStatus",
    label: "Registration — Latest Status",
    group: "Registration",
    order: 601,
    type: "string",
    needs: ["registrations"],
    get: (u, ctx) => ctx.data.registrations.get(String(u._id))?.[0]?.status || "",
  },
  {
    key: "latestPaymentStatus",
    label: "Registration — Latest Payment Status",
    group: "Registration",
    order: 602,
    type: "string",
    needs: ["registrations"],
    get: (u, ctx) =>
      ctx.data.registrations.get(String(u._id))?.[0]?.paymentStatus || "",
  },
];

function round1(n) {
  return Math.round(n * 10) / 10;
}

function avg(list) {
  const nums = (list || []).filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  return round1(nums.reduce((a, b) => a + b, 0) / nums.length);
}

// Every percentage-normalised score we can trust: exam attempts
// (Attempt.result.percentage), graded assignments (score / totalMarks) and
// chapter quizzes (ChapterProgress.chapterResults[].percentage).
// QuizAttempt.score is intentionally NOT mixed in: depending on the code
// path that wrote it, it holds either a percentage (orientation quiz) or
// raw marks (course quiz), so it cannot be compared reliably.
function allScorePcts(u, ctx) {
  const id = String(u._id);
  return [
    ...(ctx.data.exams.get(id)?.items.map((i) => i.pct) || []),
    ...(ctx.data.submissions.get(id)?.items.map((i) => i.pct) || []),
    ...(ctx.data.progress.get(id)?.quizPcts || []),
  ].filter((n) => Number.isFinite(n));
}

let cachedCatalog = null;

/** Full ordered column catalog (cached — the schema can't change at runtime). */
export const getExportColumnCatalog = () => {
  if (cachedCatalog) return cachedCatalog;
  const userCols = buildUserSchemaColumns();
  const userKeys = new Set(userCols.map((c) => c.key));
  const all = [...userCols, ...DERIVED_COLUMNS.filter((c) => !userKeys.has(c.key))];
  all.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  cachedCatalog = all;
  return all;
};

/** Public (JSON-safe) version of the catalog for the UI. */
export const getPublicExportColumns = () =>
  getExportColumnCatalog().map(({ key, label, group, type }) => ({
    key,
    label,
    group,
    type,
  }));

/** Requested columns that the current schema cannot provide. */
export const getUnavailableExportColumns = () =>
  REQUESTED_BUT_UNSUPPORTED.filter(
    (c) => !c.path || !User.schema.path(c.path),
  ).map((c) => c.label);

// ── Per-assessment (dynamic) columns ────────────────────────────────────
//
// One column per Exam and per Assignment, named after the assessment.
//   • Exam columns       → the learner's BEST submitted attempt, in %
//                          (Attempt.result.percentage — the only exam score
//                          that is stored on every attempt).
//   • Assignment columns → marks awarded (Submission.totalScore); the header
//                          carries the maximum, e.g. "Risk Assignment (/50)".
// Blank cell = learner has not attempted / not been graded yet.

const ASSESSMENT_KEY_RE = /^(exam|assignment):([0-9a-fA-F]{24})$/;
const EXAM_GROUP = "Exam Marks";
const ASSIGNMENT_GROUP = "Assignment Marks";

// Every item in the Assignment section (assignments, assessments, practicals,
// … whatever `Assignment.assessmentType` holds) is exported as its own
// column, grouped by that type in the picker.
const assignmentGroupFor = (type) => {
  const t = String(type || "").trim();
  return t ? `Assignment Section — ${humanize(t)}` : ASSIGNMENT_GROUP;
};

const cleanTitle = (t, fallback) =>
  String(t || "").replace(/\s+/g, " ").trim() || fallback;

// Two assessments with the same title would produce identical headers, so
// the later ones get a short id suffix to stay distinguishable.
const withUniqueTitles = (docs, fallback) => {
  const counts = new Map();
  for (const d of docs) {
    const t = cleanTitle(d.title, fallback);
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  return docs.map((d) => {
    const t = cleanTitle(d.title, fallback);
    return {
      doc: d,
      title: counts.get(t) > 1 ? `${t} [${String(d._id).slice(-4)}]` : t,
    };
  });
};

const markKey = (studentId, kind, id) => `${studentId}:${kind}:${id}`;

/** All dynamic assessment columns (full definitions, incl. getters). */
const getAssessmentColumnDefs = async () => {
  // Each source fails independently: a problem reading exams must never hide
  // the assignment/assessment columns (and vice versa).
  const [examRes, assignRes] = await Promise.allSettled([
    (async () => Exam.find().select("title").sort({ title: 1 }).lean())(),
    (async () =>
      Assignment.find()
        .select("title totalMarks assessmentType")
        .sort({ title: 1 })
        .lean())(),
  ]);
  if (examRes.status === "rejected")
    console.warn("[learnerExport] exam columns unavailable:", examRes.reason?.message);
  if (assignRes.status === "rejected")
    console.warn("[learnerExport] assignment columns unavailable:", assignRes.reason?.message);

  const exams = examRes.status === "fulfilled" ? examRes.value : [];
  const assignments = assignRes.status === "fulfilled" ? assignRes.value : [];

  const cols = [];

  withUniqueTitles(exams, "Untitled Exam").forEach(({ doc, title }, i) => {
    const id = String(doc._id);
    cols.push({
      key: `exam:${id}`,
      label: `${title} (%)`,
      group: EXAM_GROUP,
      order: 700 + i,
      type: "percent",
      needs: ["assessmentMarks"],
      assessment: { kind: "exam", id },
      get: (u, ctx) =>
        ctx.data.assessmentMarks.get(markKey(u._id, "exam", id)) ?? null,
    });
  });

  // Sorted by type then title so each group lists neatly.
  const sortedAssignments = [...assignments].sort(
    (a, b) =>
      String(a.assessmentType || "").localeCompare(String(b.assessmentType || "")) ||
      String(a.title || "").localeCompare(String(b.title || "")),
  );
  withUniqueTitles(sortedAssignments, "Untitled Assignment").forEach(
    ({ doc, title }, i) => {
      const id = String(doc._id);
      const max = Number(doc.totalMarks);
      cols.push({
        key: `assignment:${id}`,
        label: Number.isFinite(max) && max > 0 ? `${title} (/${max})` : title,
        group: assignmentGroupFor(doc.assessmentType),
        order: 800 + i,
        type: "number",
        needs: ["assessmentMarks"],
        assessment: { kind: "assignment", id },
        get: (u, ctx) =>
          ctx.data.assessmentMarks.get(markKey(u._id, "assignment", id)) ??
          null,
      });
    },
  );

  return cols;
};

/** JSON-safe per-assessment columns for the column picker. */
export const getAssessmentExportColumns = async () => {
  try {
    return (await getAssessmentColumnDefs()).map(
      ({ key, label, group, type }) => ({ key, label, group, type }),
    );
  } catch (err) {
    // Never let a problem here take the whole export dialog down.
    console.warn("[learnerExport] assessment columns unavailable:", err.message);
    return [];
  }
};

// ═══════════════════════════════════════════════════════════════════════
//  2. Batch loaders (one round-trip per collection per batch of users)
// ═══════════════════════════════════════════════════════════════════════

const toIds = (users) => users.map((u) => u._id);

const LOADERS = {
  async courses(users) {
    const ids = new Set();
    for (const u of users) {
      for (const c of u.enrolledCourses || []) ids.add(String(c));
      for (const c of u.assignedCourses || []) ids.add(String(c));
    }
    // Registration courses are added by the registrations loader below
    // (it runs first when both are needed).
    for (const regs of this.registrations?.values?.() || []) {
      for (const r of regs) {
        if (r.course) ids.add(String(r.course));
        for (const rc of r.requestedCourses || []) {
          if (rc?.course) ids.add(String(rc.course));
        }
      }
    }
    if (!ids.size) return new Map();
    const docs = await Course.find({ _id: { $in: [...ids] } })
      .select("title")
      .lean();
    return new Map(docs.map((d) => [String(d._id), d.title]));
  },

  async progress(users) {
    const userIds = toIds(users);
    const docs = await ChapterProgress.find({ studentId: { $in: userIds } })
      .select("studentId courseId completedChapters chapterResults updatedAt")
      .lean();

    const courseIds = [
      ...new Set([
        ...docs.map((d) => String(d.courseId)),
        ...users.flatMap((u) => (u.enrolledCourses || []).map(String)),
      ]),
    ].map((id) => new mongoose.Types.ObjectId(id));

    const totals = courseIds.length
      ? await Chapter.aggregate([
          { $match: { courseId: { $in: courseIds } } },
          { $group: { _id: "$courseId", total: { $sum: 1 } } },
        ])
      : [];
    const totalByCourse = new Map(totals.map((t) => [String(t._id), t.total]));

    const docsByUser = new Map();
    for (const d of docs) {
      const k = String(d.studentId);
      if (!docsByUser.has(k)) docsByUser.set(k, []);
      docsByUser.get(k).push(d);
    }

    const out = new Map();
    for (const u of users) {
      const list = docsByUser.get(String(u._id)) || [];
      const byCourse = new Map(list.map((d) => [String(d.courseId), d]));
      const perCourse = new Map();
      let completedCourses = 0;
      const pcts = [];

      for (const cid of (u.enrolledCourses || []).map(String)) {
        const total = totalByCourse.get(cid) || 0;
        if (!total) {
          perCourse.set(cid, null);
          continue;
        }
        const done = byCourse.get(cid)?.completedChapters?.length || 0;
        const pct = Math.min(100, round1((done / total) * 100));
        perCourse.set(cid, pct);
        pcts.push(pct);
        if (done >= total) completedCourses += 1;
      }

      const quizPcts = [];
      let lastActivity = null;
      for (const d of list) {
        const results = d.chapterResults || {};
        // .lean() returns a Map field as a plain object.
        const values =
          results instanceof Map ? [...results.values()] : Object.values(results);
        for (const r of values) {
          if (r && Number.isFinite(r.percentage)) quizPcts.push(r.percentage);
        }
        if (d.updatedAt && (!lastActivity || d.updatedAt > lastActivity)) {
          lastActivity = d.updatedAt;
        }
      }

      out.set(String(u._id), {
        perCourse,
        completedCourses,
        overall: avg(pcts),
        quizPcts,
        lastActivity,
      });
    }
    return out;
  },

  async exams(users) {
    const attempts = await Attempt.find({
      studentId: { $in: toIds(users) },
      status: { $in: ["submitted", "expired"] },
    })
      .select("studentId examId attemptNumber result.percentage submittedAt")
      .sort({ submittedAt: 1 })
      .lean();
    const examIds = [...new Set(attempts.map((a) => String(a.examId)))];
    const exams = examIds.length
      ? await Exam.find({ _id: { $in: examIds } }).select("title").lean()
      : [];
    const titleById = new Map(exams.map((e) => [String(e._id), e.title]));

    const out = new Map();
    for (const a of attempts) {
      const k = String(a.studentId);
      if (!out.has(k)) out.set(k, { count: 0, items: [] });
      const entry = out.get(k);
      entry.count += 1;
      const pct = Number(a.result?.percentage);
      if (Number.isFinite(pct)) {
        const title = titleById.get(String(a.examId)) || "Exam";
        entry.items.push({
          title: a.attemptNumber > 1 ? `${title} (attempt ${a.attemptNumber})` : title,
          pct: round1(pct),
        });
      }
    }
    return out;
  },

  async submissions(users) {
    const subs = await Submission.find({
      studentId: { $in: toIds(users) },
      status: { $ne: "not_submitted" },
    })
      .select("studentId assignmentId totalScore")
      .lean();
    const assignmentIds = [...new Set(subs.map((s) => String(s.assignmentId)))];
    const assignments = assignmentIds.length
      ? await Assignment.find({ _id: { $in: assignmentIds } })
          .select("title totalMarks")
          .lean()
      : [];
    const aById = new Map(assignments.map((a) => [String(a._id), a]));

    const out = new Map();
    for (const s of subs) {
      const k = String(s.studentId);
      if (!out.has(k)) out.set(k, { count: 0, items: [] });
      const entry = out.get(k);
      entry.count += 1;
      const a = aById.get(String(s.assignmentId));
      const total = Number(a?.totalMarks);
      const score = Number(s.totalScore);
      if (s.totalScore != null && Number.isFinite(score) && total > 0) {
        entry.items.push({
          title: a?.title || "Assignment",
          score,
          total,
          pct: round1((score / total) * 100),
        });
      }
    }
    return out;
  },

  // Marks for ONLY the exams / assignments the admin ticked as columns.
  // `scope` = { examIds: string[], assignmentIds: string[] }.
  async assessmentMarks(users, scope = {}) {
    const out = new Map();
    const studentIds = toIds(users);
    const examIds = scope.examIds || [];
    const assignmentIds = scope.assignmentIds || [];

    if (examIds.length) {
      const attempts = await Attempt.find({
        studentId: { $in: studentIds },
        examId: { $in: examIds },
        status: { $in: ["submitted", "expired"] },
      })
        .select("studentId examId result.percentage")
        .lean();
      for (const a of attempts) {
        const pct = Number(a.result?.percentage);
        if (!Number.isFinite(pct)) continue;
        const k = markKey(a.studentId, "exam", a.examId);
        const prev = out.get(k);
        // Best attempt wins when a learner has retaken the exam.
        if (prev === undefined || pct > prev) out.set(k, round1(pct));
      }
    }

    if (assignmentIds.length) {
      const subs = await Submission.find({
        studentId: { $in: studentIds },
        assignmentId: { $in: assignmentIds },
        status: { $ne: "not_submitted" },
        totalScore: { $ne: null },
      })
        .select("studentId assignmentId totalScore")
        .sort({ _id: 1 }) // oldest → newest, so a resubmission overwrites
        .lean();
      for (const s of subs) {
        const score = Number(s.totalScore);
        if (!Number.isFinite(score)) continue;
        out.set(markKey(s.studentId, "assignment", s.assignmentId), score);
      }
    }
    return out;
  },

  async quizzes(users) {
    const rows = await QuizAttempt.aggregate([
      { $match: { studentId: { $in: toIds(users) } } },
      { $group: { _id: "$studentId", n: { $sum: 1 } } },
    ]);
    return new Map(rows.map((r) => [String(r._id), r.n]));
  },

  async scenario(users) {
    const rows = await ScenarioExamAttempt.aggregate([
      {
        $match: {
          studentId: { $in: toIds(users) },
          status: { $in: ["submitted", "reviewed"] },
        },
      },
      { $group: { _id: "$studentId", n: { $sum: 1 } } },
    ]);
    return new Map(rows.map((r) => [String(r._id), r.n]));
  },

  async certificates(users) {
    const certs = await Certificate.find({
      studentId: { $in: toIds(users) },
      status: "issued",
    })
      .select("studentId certificateNumber issuedAt")
      .sort({ issuedAt: 1 })
      .lean();
    const out = new Map();
    for (const c of certs) {
      const k = String(c.studentId);
      if (!out.has(k)) out.set(k, []);
      out.get(k).push(c);
    }
    return out;
  },

  async attendance(users) {
    const rows = await Attendance.aggregate([
      { $match: { student: { $in: toIds(users) } } },
      {
        $group: {
          _id: "$student",
          total: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] },
          },
        },
      },
    ]);
    return new Map(
      rows.map((r) => [String(r._id), { total: r.total, attended: r.attended }]),
    );
  },

  async registrations(users) {
    const regs = await Registration.find({ student: { $in: toIds(users) } })
      .select("student course requestedCourses status paymentStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const out = new Map();
    for (const r of regs) {
      const k = String(r.student);
      if (!out.has(k)) out.set(k, []);
      out.get(k).push(r);
    }
    return out;
  },

  async orgs(users) {
    const pIds = [...new Set(users.map((u) => u.partnerInstitute).filter(Boolean).map(String))];
    const aIds = [...new Set(users.map((u) => u.awardingOrganisation).filter(Boolean).map(String))];
    const [p, a] = await Promise.all([
      pIds.length
        ? PartnerInstitute.find({ _id: { $in: pIds } }).select("name").lean()
        : [],
      aIds.length
        ? AwardingOrganisation.find({ _id: { $in: aIds } }).select("name").lean()
        : [],
    ]);
    return {
      partner: new Map(p.map((d) => [String(d._id), d.name])),
      ao: new Map(a.map((d) => [String(d._id), d.name])),
    };
  },
};

// `courses` must run after `registrations` so registration course titles
// can be resolved in the same lookup.
const LOADER_ORDER = [
  "registrations",
  "orgs",
  "progress",
  "exams",
  "submissions",
  "quizzes",
  "scenario",
  "certificates",
  "attendance",
  "assessmentMarks",
  "courses",
];

const EMPTY_FOR = {
  orgs: () => ({ partner: new Map(), ao: new Map() }),
};

/**
 * Loads only the relationship data the selected columns need, for one
 * batch of users. A failing loader (e.g. a collection that doesn't exist
 * in this deployment) degrades to empty data for that group instead of
 * failing the whole export.
 */
const loadBatchData = async (users, needs, scope = {}) => {
  const data = {};
  for (const name of LOADER_ORDER) {
    if (!needs.has(name)) {
      data[name] = EMPTY_FOR[name] ? EMPTY_FOR[name]() : new Map();
      continue;
    }
    try {
      data[name] = await LOADERS[name].call(data, users, scope);
    } catch (err) {
      console.warn(`[learnerExport] "${name}" data unavailable:`, err.message);
      data[name] = EMPTY_FOR[name] ? EMPTY_FOR[name]() : new Map();
    }
  }
  return data;
};

// ═══════════════════════════════════════════════════════════════════════
//  3. Workbook generation
// ═══════════════════════════════════════════════════════════════════════

/** Validates/normalises the requested column keys, preserving order. */
export const resolveColumns = (keys) => {
  if (!Array.isArray(keys)) return [];
  const byKey = new Map(getExportColumnCatalog().map((c) => [c.key, c]));
  const seen = new Set();
  const out = [];
  for (const k of keys) {
    if (typeof k !== "string" || seen.has(k) || !byKey.has(k)) continue;
    seen.add(k);
    out.push(byKey.get(k));
  }
  return out;
};

/**
 * Async version of resolveColumns() that ALSO understands the dynamic
 * per-assessment keys (`exam:<id>`, `assignment:<id>`). Order is preserved;
 * unknown / deleted assessments are silently dropped (same as unknown keys).
 */
export const resolveExportColumns = async (keys) => {
  if (!Array.isArray(keys)) return [];
  const wantsAssessments = keys.some(
    (k) => typeof k === "string" && ASSESSMENT_KEY_RE.test(k),
  );
  const dynamic = wantsAssessments
    ? new Map((await getAssessmentColumnDefs()).map((c) => [c.key, c]))
    : new Map();
  const staticByKey = new Map(getExportColumnCatalog().map((c) => [c.key, c]));

  const seen = new Set();
  const out = [];
  for (const k of keys) {
    if (typeof k !== "string" || seen.has(k)) continue;
    const col = staticByKey.get(k) || dynamic.get(k);
    if (!col) continue;
    seen.add(k);
    out.push(col);
  }
  return out;
};

const cellTextLength = (value, type) => {
  if (value == null || value === "") return 0;
  if (type === "date") return 10; // MM/DD/YYYY
  return String(value).length;
};

/**
 * Counts matching users (used to reject empty / oversized exports before
 * doing any heavy work).
 */
export const countExportRows = (filter) => User.countDocuments(filter);

/**
 * Builds the .xlsx and returns it as a Buffer.
 *
 * @param {object}   opts
 * @param {object}   opts.filter    Mongo filter from buildUserFilter()
 * @param {object}   opts.sortSpec  result of buildSort()
 * @param {object[]} opts.columns   result of resolveColumns() (ordered)
 * @param {number}   opts.tzOffset  admin's browser timezone offset
 */
export const buildLearnersWorkbook = async ({
  filter,
  sortSpec,
  columns,
  tzOffset = 0,
}) => {
  const needs = new Set(columns.flatMap((c) => c.needs || []));
  const scope = {
    examIds: columns
      .filter((c) => c.assessment?.kind === "exam")
      .map((c) => c.assessment.id),
    assignmentIds: columns
      .filter((c) => c.assessment?.kind === "assignment")
      .map((c) => c.assessment.id),
  };

  const projection = Object.fromEntries(SENSITIVE_USER_FIELDS.map((f) => [f, 0]));
  const pipeline = [{ $match: filter }];
  if (sortSpec.addFields) pipeline.push({ $addFields: sortSpec.addFields });
  pipeline.push({ $sort: sortSpec.sort });
  pipeline.push({ $limit: MAX_EXPORT_ROWS });
  pipeline.push({
    $project: sortSpec.addFields
      ? { ...projection, [SORT_KEY_FIELD]: 0 }
      : projection,
  });

  const users = await User.aggregate(pipeline)
    .collation(SORT_COLLATION)
    .allowDiskUse(true);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "1A HK International LMS";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(EXPORT_SHEET_NAME, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = columns.map((c) => ({ header: c.label, key: c.key }));

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FF1F2937" } };
  header.alignment = { vertical: "middle" };
  header.height = 20;
  header.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEF2FF" }, // indigo-50, matches the admin theme
    };
    cell.border = { bottom: { style: "thin", color: { argb: "FFC7D2FE" } } };
  });

  const widths = columns.map((c) => c.label.length);

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const data = await loadBatchData(batch, needs, scope);
    const ctx = { data, tzOffset };

    for (const u of batch) {
      const values = columns.map((c, idx) => {
        let v;
        try {
          v = c.get(u, ctx);
        } catch {
          v = null; // one bad value never breaks the whole export
        }
        if (v === undefined || v === null || Number.isNaN(v)) v = "";
        if (v instanceof Date && Number.isNaN(v.getTime())) v = "";
        widths[idx] = Math.max(widths[idx], cellTextLength(v, c.type));
        return v;
      });
      sheet.addRow(values);
    }
  }

  columns.forEach((c, idx) => {
    const col = sheet.getColumn(idx + 1);
    col.width = Math.min(Math.max(widths[idx] + 2, 10), 60);
    if (c.type === "date") col.numFmt = "mm/dd/yyyy";
    if (c.type === "percent") col.numFmt = "0.0";
    if (c.assessment) col.alignment = { horizontal: "center" };
    if (c.type === "string") col.alignment = { wrapText: false };
  });

  if (columns.length) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer), rowCount: users.length };
};

/** "Learners_MM-DD-YYYY.xlsx" using the admin's local export date. */
export const buildExportFilename = (tzOffset = 0, now = new Date()) => {
  const local = new Date(now.getTime() - tzOffset * 60 * 1000);
  const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(local.getUTCDate()).padStart(2, "0");
  const yyyy = local.getUTCFullYear();
  return `Learners_${mm}-${dd}-${yyyy}.xlsx`;
};