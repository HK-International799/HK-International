/**
 * labelPrinterController
 *
 * GET /api/admin/label-printer/learners
 *
 * Feeds the Label Printer's "Auto" mode: a paginated, server-side,
 * case-insensitive partial search over learners (role "student"), returning
 * ONLY the fields a shipping label needs — never passwords, tokens or other
 * account data. Admin / super_admin only (enforced by adminRoutes).
 *
 * Query params:
 *   search  free text — name, email, mobile, registration ID / learner ID
 *           (full or partial id), course title or OTHERS course name
 *   page    1-based (default 1)
 *   limit   1..200 (default 25)
 *
 * Large learner bases are never loaded at once: the UI requests one page
 * at a time ("Load more"), and "Select all filtered" walks pages.
 */
import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Registration from "../models/Registration.js";
import asyncHandler from "../utils/asyncHandler.js";
import { escapeRegex } from "../utils/learnerFilters.js";
import { getRegistrationCourseLabel } from "../utils/registrationCourse.js";
import { deriveFullName } from "../utils/nameUtils.js";

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 25;
const SEARCH_MAX_LEN = 100;
const SEARCH_MAX_TOKENS = 6;

const LABEL_FIELDS =
  "name firstName middleName lastName email mobile countryCode address addressLine1 addressLine2 city state postalCode country createdAt";

const clampInt = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

/** Students whose registration id (or own id) contains the hex fragment. */
const studentIdsByIdFragment = async (term) => {
  if (!/^[a-f0-9]{4,24}$/i.test(term)) return [];
  const fragment = term.toLowerCase();

  if (fragment.length === 24 && mongoose.Types.ObjectId.isValid(fragment)) {
    const oid = new mongoose.Types.ObjectId(fragment);
    const regs = await Registration.find({ _id: oid }).select("student").lean();
    return [oid, ...regs.map((r) => r.student)];
  }

  const [regs, users] = await Promise.all([
    Registration.aggregate([
      {
        $match: {
          $expr: {
            $regexMatch: { input: { $toString: "$_id" }, regex: escapeRegex(fragment) },
          },
        },
      },
      { $limit: 500 },
      { $project: { student: 1 } },
    ]),
    User.aggregate([
      {
        $match: {
          role: "student",
          $expr: {
            $regexMatch: { input: { $toString: "$_id" }, regex: escapeRegex(fragment) },
          },
        },
      },
      { $limit: 500 },
      { $project: { _id: 1 } },
    ]),
  ]);
  return [...regs.map((r) => r.student), ...users.map((u) => u._id)].filter(Boolean);
};

const buildTermClause = async (term) => {
  const regex = new RegExp(escapeRegex(term), "i");
  const [idMatches, courseIds, otherRegs] = await Promise.all([
    studentIdsByIdFragment(term),
    Course.distinct("_id", { title: regex }),
    Registration.find({ isOtherCourse: true, otherCourseName: regex })
      .select("student")
      .limit(500)
      .lean(),
  ]);

  const courseStudentIds = courseIds.length
    ? await Registration.distinct("student", { course: { $in: courseIds } })
    : [];

  const or = [
    { name: regex },
    { firstName: regex },
    { middleName: regex },
    { lastName: regex },
    { email: regex },
    { mobile: regex },
  ];
  const extraIds = [
    ...idMatches,
    ...courseStudentIds,
    ...otherRegs.map((r) => r.student),
  ].filter(Boolean);
  if (extraIds.length) or.push({ _id: { $in: extraIds } });
  if (courseIds.length) or.push({ enrolledCourses: { $in: courseIds } });
  return { $or: or };
};

const buildSearch = async (raw) => {
  if (typeof raw !== "string") return null;
  const search = raw.trim().slice(0, SEARCH_MAX_LEN);
  if (!search) return null;
  const tokens = [...new Set(search.split(/\s+/).filter(Boolean))].slice(
    0,
    SEARCH_MAX_TOKENS,
  );
  const phrase = await buildTermClause(search);
  if (tokens.length <= 1) return phrase;
  const perToken = await Promise.all(tokens.map(buildTermClause));
  return { $or: [phrase, { $and: perToken }] };
};

export const searchLabelLearners = asyncHandler(async (req, res) => {
  const page = clampInt(req.query.page, 1, 1, 100000);
  const limit = clampInt(req.query.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);

  const and = [{ role: "student" }];
  const search = await buildSearch(req.query.search);
  if (search) and.push(search);
  const filter = and.length === 1 ? and[0] : { $and: and };

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select(LABEL_FIELDS)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  const regs = users.length
    ? await Registration.find({ student: { $in: users.map((u) => u._id) } })
        .select("student course status isOtherCourse otherCourseName createdAt")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .lean()
    : [];

  const regsByStudent = new Map();
  for (const r of regs) {
    const key = String(r.student);
    if (!regsByStudent.has(key)) regsByStudent.set(key, []);
    regsByStudent.get(key).push({
      _id: r._id,
      status: r.status,
      courseLabel: getRegistrationCourseLabel(r),
      isOtherCourse: Boolean(r.isOtherCourse),
    });
  }

  const learners = users.map((u) => ({
    _id: u._id,
    fullName: deriveFullName(u) || u.email || "",
    email: u.email || "",
    mobile: u.mobile || "",
    countryCode: u.countryCode || "",
    address: u.address || "",
    addressLine1: u.addressLine1 || "",
    addressLine2: u.addressLine2 || "",
    city: u.city || "",
    state: u.state || "",
    postalCode: u.postalCode || "",
    country: u.country || "",
    registrations: regsByStudent.get(String(u._id)) || [],
  }));

  res.json({
    success: true,
    data: {
      learners,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      hasMore: page * limit < total,
    },
  });
});

export default { searchLabelLearners };
