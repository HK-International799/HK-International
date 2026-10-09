/**
 * learnerFilters
 *
 * Shared, side-effect-free helpers that turn the Learners page query
 * parameters into a MongoDB filter / sort spec. Used by:
 *   - GET  /api/admin/users          (advanced list mode)
 *   - GET  /api/admin/users/stats    (stat cards — same filter set)
 *   - POST /api/admin/users/export   (Excel export — same filter set)
 *
 * Keeping ONE builder guarantees the table, the stat cards and the export
 * can never disagree about which users "match the current filters".
 *
 * Every parser is defensive: invalid / missing / reversed values are
 * ignored or normalised rather than thrown, so a bad query string can
 * never crash the page or the server.
 */
import mongoose from "mongoose";
import Course from "../models/Course.js";
import PartnerInstitute from "../models/PartnerInstitute.js";
import AwardingOrganisation from "../models/AwardingOrganisation.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Mirrors the enum on User.role — anything else is silently dropped.
export const USER_ROLES = [
  "student",
  "tutor",
  "admin",
  "super_admin",
  "partner_institute",
  "ao",
  "sales_agent",
  "finance",
];

// Fields that are NEVER returned from the advanced list / export paths.
// (`.find()` honours `select: false`, but aggregation pipelines do not, so
// these are excluded explicitly.)
export const SENSITIVE_USER_FIELDS = [
  "passwordHash",
  "passwordResetToken",
  "passwordResetExpires",
];

// Query keys that switch GET /admin/users into "advanced" mode. When none
// of them is present the original (legacy) code path runs untouched, so
// every existing caller (Batches, Certificates, LiveClasses, RecordPayment,
// CourseDetails…) receives exactly the same response as before.
export const ADVANCED_QUERY_KEYS = [
  "search",
  "regFrom",
  "regTo",
  "dobFrom",
  "dobTo",
  "course",
  "sortBy",
  "sortOrder",
  "tzOffset",
];

export const isAdvancedQuery = (query = {}) =>
  ADVANCED_QUERY_KEYS.some(
    (k) => query[k] !== undefined && query[k] !== null && query[k] !== "",
  ) ||
  // Comma-separated / "all" role values only exist in the new UI.
  (typeof query.role === "string" &&
    (query.role.includes(",") || query.role === "all"));

// ── Primitive parsers ────────────────────────────────────────────────────

export const escapeRegex = (s = "") =>
  String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Browser `Date#getTimezoneOffset()` value (minutes, UTC − local; IST is
 * -330). Clamped to the real-world range; anything invalid → 0 (UTC).
 */
export const parseTzOffset = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < -840 || n > 840) return 0;
  return Math.trunc(n);
};

/**
 * Parses "YYYY-MM-DD" (the value an <input type="date"> produces) into
 * { y, m, d }. Returns null for anything else, including impossible dates
 * like 2026-02-31.
 */
export const parseYmd = (value) => {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  const probe = new Date(Date.UTC(y, m, d));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m ||
    probe.getUTCDate() !== d
  ) {
    return null;
  }
  return { y, m, d };
};

/** Start of the given calendar day in the admin's local timezone, as UTC. */
const localDayStart = ({ y, m, d }, tzOffset) =>
  new Date(Date.UTC(y, m, d) + tzOffset * 60 * 1000);

/**
 * Builds a { $gte, $lt } range for a timestamp field (createdAt) where the
 * admin picked whole calendar days in THEIR timezone. `to` is inclusive of
 * the whole day. A reversed range is swapped instead of rejected.
 */
export const buildLocalDayRange = (fromStr, toStr, tzOffset) => {
  let from = parseYmd(fromStr);
  let to = parseYmd(toStr);
  if (!from && !to) return null;
  if (from && to) {
    const a = Date.UTC(from.y, from.m, from.d);
    const b = Date.UTC(to.y, to.m, to.d);
    if (a > b) [from, to] = [to, from];
  }
  const range = {};
  if (from) range.$gte = localDayStart(from, tzOffset);
  if (to) range.$lt = new Date(localDayStart(to, tzOffset).getTime() + DAY_MS);
  return range;
};

/**
 * Date-of-birth range. DOBs are calendar dates stored as UTC midnight
 * (`new Date("YYYY-MM-DD")` in the registration flow), so the range is
 * built in UTC — no timezone shifting, otherwise boundary birthdays would
 * fall on the wrong side.
 */
export const buildDobRange = (fromStr, toStr) =>
  buildLocalDayRange(fromStr, toStr, 0);

export const isValidObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;

export const parseRoles = (role) => {
  if (!role || typeof role !== "string" || role === "all") return [];
  return [
    ...new Set(
      role
        .split(",")
        .map((r) => r.trim())
        .filter((r) => USER_ROLES.includes(r)),
    ),
  ];
};

// ── Search ───────────────────────────────────────────────────────────────

// Plain string fields on User that the search box looks at.
const SEARCH_FIELDS = [
  "name",
  "firstName",
  "middleName",
  "lastName",
  "email",
  "mobile",
  "role",
  "city",
  "state",
  "country",
];

const anyFieldMatches = (regex, courseIds, orgIds) => {
  const or = SEARCH_FIELDS.map((f) => ({ [f]: regex }));
  if (courseIds.length) or.push({ enrolledCourses: { $in: courseIds } });
  if (orgIds.partner.length)
    or.push({ partnerInstitute: { $in: orgIds.partner } });
  if (orgIds.ao.length)
    or.push({ awardingOrganisation: { $in: orgIds.ao } });
  return { $or: or };
};

/**
 * Case-insensitive partial-match search across name parts, email, mobile,
 * role, location, enrolled course title and organisation (Partner
 * Institute / Awarding Organisation name).
 *
 * Course / organisation names are resolved to ids first (both are small
 * collections, ≤ 2 indexed-size queries in total) so the user query itself
 * stays a single $match with no $lookup.
 *
 * Multi-word input ("john smith") matches when EVERY word matches some
 * field — so first-name + last-name searches work for both structured and
 * legacy single-`name` users.
 */
export const buildSearchFilter = async (rawSearch) => {
  if (typeof rawSearch !== "string") return null;
  const search = rawSearch.trim().slice(0, 100);
  if (!search) return null;

  const tokens = [...new Set(search.split(/\s+/).filter(Boolean))].slice(0, 6);
  const terms = [search, ...tokens.filter((t) => t !== search)];

  const lookups = await Promise.all(
    terms.map(async (term) => {
      const regex = new RegExp(escapeRegex(term), "i");
      const [courses, partners, aos] = await Promise.all([
        Course.find({ title: regex }).select("_id").limit(200).lean(),
        PartnerInstitute.find({ name: regex }).select("_id").limit(200).lean(),
        AwardingOrganisation.find({ name: regex })
          .select("_id")
          .limit(200)
          .lean(),
      ]);
      return {
        term,
        regex,
        courseIds: courses.map((c) => c._id),
        orgIds: {
          partner: partners.map((p) => p._id),
          ao: aos.map((a) => a._id),
        },
      };
    }),
  );

  const byTerm = new Map(lookups.map((l) => [l.term, l]));
  const phrase = byTerm.get(search);
  const phraseClause = anyFieldMatches(
    phrase.regex,
    phrase.courseIds,
    phrase.orgIds,
  );

  if (tokens.length <= 1) return phraseClause;

  const tokenClause = {
    $and: tokens.map((t) => {
      const l = byTerm.get(t) || phrase;
      return anyFieldMatches(l.regex, l.courseIds, l.orgIds);
    }),
  };

  return { $or: [phraseClause, tokenClause] };
};

// ── Full filter ──────────────────────────────────────────────────────────

/**
 * Builds the Mongo filter for the Learners page from a flat params object
 * (req.query for GET, req.body.filters for the export POST).
 *
 * Supported params (all optional):
 *   role       "student" | "student,tutor" | "admin,super_admin" | "all"
 *   search     free text
 *   regFrom / regTo   "YYYY-MM-DD" registration (createdAt) range, local tz
 *   dobFrom / dobTo   "YYYY-MM-DD" date-of-birth range
 *   course     Course ObjectId — users whose enrolledCourses contains it
 *   tzOffset   browser getTimezoneOffset() in minutes
 */
export const buildUserFilter = async (params = {}) => {
  const tzOffset = parseTzOffset(params.tzOffset);
  const and = [];

  const roles = parseRoles(params.role);
  if (roles.length === 1) and.push({ role: roles[0] });
  else if (roles.length > 1) and.push({ role: { $in: roles } });

  const regRange = buildLocalDayRange(params.regFrom, params.regTo, tzOffset);
  if (regRange) and.push({ createdAt: regRange });

  const dobRange = buildDobRange(params.dobFrom, params.dobTo);
  if (dobRange) and.push({ dateOfBirth: dobRange });

  if (params.course && isValidObjectId(String(params.course))) {
    and.push({
      enrolledCourses: new mongoose.Types.ObjectId(String(params.course)),
    });
  }

  const searchFilter = await buildSearchFilter(params.search);
  if (searchFilter) and.push(searchFilter);

  if (!and.length) return {};
  if (and.length === 1) return and[0];
  return { $and: and };
};

// ── Sorting ──────────────────────────────────────────────────────────────

// Whitelisted sortable columns → how to sort them.
// firstName falls back to the legacy `name` field so legacy users (who have
// an empty firstName) sort alphabetically with everyone else instead of
// all clumping at the top.
const SORTABLE = {
  firstName: {
    computed: {
      $cond: [
        { $gt: [{ $strLenCP: { $ifNull: ["$firstName", ""] } }, 0] },
        "$firstName",
        { $ifNull: ["$name", ""] },
      ],
    },
  },
  lastName: { field: "lastName" },
  name: { field: "name" },
  email: { field: "email" },
  mobile: { field: "mobile" },
  role: { field: "role" },
  dateOfBirth: { field: "dateOfBirth" },
  createdAt: { field: "createdAt" },
};

export const SORT_KEY_FIELD = "__sortKey";

/**
 * Returns { addFields, sort } for an aggregation pipeline. `_id` is always
 * the final tiebreaker so pagination is stable across pages.
 */
export const buildSort = (sortBy, sortOrder) => {
  const key = Object.prototype.hasOwnProperty.call(SORTABLE, sortBy)
    ? sortBy
    : "createdAt";
  const dir = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;
  const def = SORTABLE[key];

  if (def.computed) {
    return {
      addFields: { [SORT_KEY_FIELD]: def.computed },
      sort: { [SORT_KEY_FIELD]: dir, _id: dir },
      sortBy: key,
      sortOrder: dir === 1 ? "asc" : "desc",
    };
  }
  return {
    addFields: null,
    sort: { [def.field]: dir, _id: dir },
    sortBy: key,
    sortOrder: dir === 1 ? "asc" : "desc",
  };
};

// Case-insensitive ordering for string sorts (and harmless for dates).
export const SORT_COLLATION = { locale: "en", strength: 2 };

// ── Stat-card boundaries ─────────────────────────────────────────────────

/**
 * Start-of-today / week (Monday) / month / year, in the admin's local
 * timezone, expressed as UTC Date objects for $gte comparisons.
 */
export const getPeriodBoundaries = (tzOffset = 0, now = new Date()) => {
  // Shift "now" into the admin's wall-clock, then read UTC parts.
  const local = new Date(now.getTime() - tzOffset * 60 * 1000);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = local.getUTCDate();
  const dow = (local.getUTCDay() + 6) % 7; // Monday = 0

  const toUtc = (yy, mm, dd) =>
    new Date(Date.UTC(yy, mm, dd) + tzOffset * 60 * 1000);

  return {
    today: toUtc(y, m, d),
    week: toUtc(y, m, d - dow),
    month: toUtc(y, m, 1),
    year: toUtc(y, 0, 1),
  };
};

/**
 * Converts a stored timestamp to a timezone-free Date representing the
 * admin's LOCAL calendar day at UTC midnight — what Excel needs to show
 * the correct MM/DD/YYYY regardless of the server's own timezone.
 */
export const toLocalCalendarDate = (value, tzOffset = 0) => {
  if (!value) return null;
  const t = new Date(value);
  if (Number.isNaN(t.getTime())) return null;
  const local = new Date(t.getTime() - tzOffset * 60 * 1000);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()),
  );
};

/** For date-only values (DOB) already stored as UTC midnight. */
export const toUtcCalendarDate = (value) => toLocalCalendarDate(value, 0);
