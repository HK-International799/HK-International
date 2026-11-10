/**
 * registrationQueryService
 *
 * Server-side filtering / searching / pagination for the admin
 * Registrations page and its CSV export. ONE filter builder is shared by
 * the list, the stat cards and the export so the three can never disagree
 * about which registrations "match the current filters".
 *
 * Why this exists (root cause of "missing registrations"):
 *   GET /api/admin/registrations defaulted to `limit=50` and the admin page
 *   never sent `page`/`limit`, so only the newest 50 registrations were
 *   ever loaded. Search and the stat cards then ran in the browser over
 *   those 50 rows only. Everything is now done in the database.
 *
 * Every parser is defensive: unknown / malformed params are ignored rather
 * than thrown, and every user-supplied string used in a regex is escaped
 * and length-capped (no ReDoS / operator injection — values are never
 * spread into the query object).
 */
import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import PartnerInstitute from "../models/PartnerInstitute.js";
import Registration from "../models/Registration.js";
import {
  escapeRegex,
  buildLocalDayRange,
  parseTzOffset,
} from "../utils/learnerFilters.js";
import {
  OTHER_COURSE_FILTER,
  NO_COURSE_FILTER,
} from "../utils/registrationCourse.js";

export const REGISTRATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "completed",
  "withdrawn",
];
export const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "verified"];
export const REGISTRATION_SOURCES = ["self", "institute", "admin"];

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 50; // unchanged legacy default
export const MAX_PAGE_SIZE = 200;
export const MAX_EXPORT_ROWS = 50000;

const SEARCH_MAX_LEN = 100;
const SEARCH_MAX_TOKENS = 6;

const isObjectId = (v) =>
  typeof v === "string" &&
  /^[a-f0-9]{24}$/i.test(v) &&
  mongoose.Types.ObjectId.isValid(v);

const toObjectId = (v) => new mongoose.Types.ObjectId(String(v));

export const clampInt = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

const pickEnum = (value, allowed) =>
  typeof value === "string" && allowed.includes(value) ? value : null;

// ── Search ────────────────────────────────────────────────────────────────

/**
 * One search term → a Registration clause that matches when the term
 * appears (case-insensitive, partial) in the learner's name / email /
 * mobile, the course title, the OTHERS course name, the partner institute
 * name, or equals a registration / learner id.
 */
const buildTermClause = async (term) => {
  const regex = new RegExp(escapeRegex(term), "i");

  const [studentIds, courseIds, instituteIds] = await Promise.all([
    User.distinct("_id", {
      $or: [
        { name: regex },
        { firstName: regex },
        { middleName: regex },
        { lastName: regex },
        { email: regex },
        { mobile: regex },
      ],
    }),
    Course.distinct("_id", { title: regex }),
    PartnerInstitute.distinct("_id", { name: regex }),
  ]);

  const or = [{ otherCourseName: regex }];
  if (studentIds.length) or.push({ student: { $in: studentIds } });
  if (courseIds.length) or.push({ course: { $in: courseIds } });
  if (instituteIds.length) or.push({ partnerInstitute: { $in: instituteIds } });
  if (isObjectId(term)) {
    or.push({ _id: toObjectId(term) }, { student: toObjectId(term) });
  }
  return { $or: or };
};

export const buildRegistrationSearch = async (rawSearch) => {
  if (typeof rawSearch !== "string") return null;
  const search = rawSearch.trim().slice(0, SEARCH_MAX_LEN);
  if (!search) return null;

  const tokens = [...new Set(search.split(/\s+/).filter(Boolean))].slice(
    0,
    SEARCH_MAX_TOKENS,
  );

  const phraseClause = await buildTermClause(search);
  if (tokens.length <= 1) return phraseClause;

  // "john smith" must also match a learner stored as firstName "John" +
  // lastName "Smith": every word has to match somewhere.
  const tokenClauses = await Promise.all(tokens.map(buildTermClause));
  return { $or: [phraseClause, { $and: tokenClauses }] };
};

// ── Full filter ───────────────────────────────────────────────────────────

/**
 * Supported params (all optional):
 *   status         pending | approved | rejected | completed | withdrawn
 *   paymentStatus  unpaid | partial | paid | verified
 *   source         self | institute | admin
 *   course         <Course id> | "others" (OTHERS registrations)
 *                  | "none" (no usable catalogue course: missing/deleted)
 *   dateFrom/dateTo  "YYYY-MM-DD" on createdAt, admin's local timezone
 *   tzOffset       browser getTimezoneOffset() minutes
 *   search         free text
 */
export const buildRegistrationFilter = async (params = {}) => {
  const and = [];

  const status = pickEnum(params.status, REGISTRATION_STATUSES);
  if (status) and.push({ status });

  const paymentStatus = pickEnum(params.paymentStatus, PAYMENT_STATUSES);
  if (paymentStatus) {
    // Legacy records created before paymentStatus existed have no value
    // and are treated as "unpaid" everywhere else in the UI.
    and.push(
      paymentStatus === "unpaid"
        ? { $or: [{ paymentStatus: "unpaid" }, { paymentStatus: { $exists: false } }, { paymentStatus: null }] }
        : { paymentStatus },
    );
  }

  const source = pickEnum(params.source, REGISTRATION_SOURCES);
  if (source) and.push({ source });

  const course = typeof params.course === "string" ? params.course.trim() : "";
  if (course === OTHER_COURSE_FILTER) {
    and.push({ isOtherCourse: true });
  } else if (course === NO_COURSE_FILTER) {
    const existingCourseIds = await Course.distinct("_id");
    and.push({
      isOtherCourse: { $ne: true },
      $or: [
        { course: null },
        { course: { $exists: false } },
        { course: { $nin: existingCourseIds } },
      ],
    });
  } else if (isObjectId(course)) {
    and.push({ course: toObjectId(course) });
  }

  const tzOffset = parseTzOffset(params.tzOffset);
  const range = buildLocalDayRange(params.dateFrom, params.dateTo, tzOffset);
  if (range) and.push({ createdAt: range });

  const searchFilter = await buildRegistrationSearch(params.search);
  if (searchFilter) and.push(searchFilter);

  if (!and.length) return {};
  if (and.length === 1) return and[0];
  return { $and: and };
};

/** Newest first by default; `_id` tiebreaker keeps page boundaries stable. */
export const buildRegistrationSort = (sortOrder) => {
  const dir = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;
  return { sort: { createdAt: dir, _id: dir }, sortOrder: dir === 1 ? "asc" : "desc" };
};

/** Stat cards for the CURRENT filter set, computed in one round-trip. */
export const getRegistrationStats = async (filter) => {
  const [result] = await Registration.aggregate([
    { $match: filter },
    {
      $facet: {
        total: [{ $count: "n" }],
        byStatus: [{ $group: { _id: "$status", n: { $sum: 1 } } }],
        paymentPending: [
          {
            $match: {
              $or: [
                { paymentStatus: { $in: ["unpaid", "partial", null] } },
                { paymentStatus: { $exists: false } },
              ],
            },
          },
          { $count: "n" },
        ],
        lmsActivated: [{ $match: { lmsAccessGranted: true } }, { $count: "n" }],
        others: [{ $match: { isOtherCourse: true } }, { $count: "n" }],
      },
    },
  ]);

  const n = (arr) => arr?.[0]?.n || 0;
  const byStatus = Object.fromEntries(
    (result?.byStatus || []).map((r) => [r._id || "unknown", r.n]),
  );
  return {
    total: n(result?.total),
    pending: byStatus.pending || 0,
    approved: byStatus.approved || 0,
    rejected: byStatus.rejected || 0,
    completed: byStatus.completed || 0,
    withdrawn: byStatus.withdrawn || 0,
    paymentPending: n(result?.paymentPending),
    lmsActivated: n(result?.lmsActivated),
    others: n(result?.others),
  };
};

/** Adds `student.displayName` exactly as the page always expected. */
export const withDisplayName = (reg) => {
  if (!reg?.student) return reg;
  const first = reg.student.firstName?.trim() || "";
  const middle = reg.student.middleName?.trim() || "";
  const last = reg.student.lastName?.trim() || "";
  reg.student.displayName =
    !first && !last
      ? (reg.student.name || "").trim()
      : [first, middle, last].filter(Boolean).join(" ");
  return reg;
};

export default {
  REGISTRATION_STATUSES,
  PAYMENT_STATUSES,
  REGISTRATION_SOURCES,
  PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_EXPORT_ROWS,
  clampInt,
  buildRegistrationSearch,
  buildRegistrationFilter,
  buildRegistrationSort,
  getRegistrationStats,
  withDisplayName,
};
