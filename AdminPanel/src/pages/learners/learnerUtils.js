/**
 * Pure helpers for the Learners page (no React, no side effects).
 */

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Role filter options. "Admin" covers both admin and super_admin, matching
// the "Admins" stat card.
export const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "student", label: "Students" },
  { value: "tutor", label: "Tutors" },
  { value: "admin,super_admin", label: "Admins" },
];

export const roleFilterLabel = (value) =>
  ROLE_FILTER_OPTIONS.find((o) => o.value === value)?.label || value;

export const ROLE_BADGE = {
  student: "primary",
  tutor: "accent",
  admin: "danger",
  super_admin: "danger",
};

export const formatRole = (role) =>
  role ? String(role).replace(/_/g, " ") : "—";

// Keys of the filter object that live in the URL.
export const FILTER_KEYS = [
  "search",
  "role",
  "regFrom",
  "regTo",
  "dobFrom",
  "dobTo",
  "course",
];

export const EMPTY_FILTERS = {
  search: "",
  role: "all",
  regFrom: "",
  regTo: "",
  dobFrom: "",
  dobTo: "",
  course: "",
};

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;
export const isYmd = (v) => typeof v === "string" && YMD_RE.test(v);

/** Reads filters / paging / sorting from URLSearchParams, defensively. */
export const readStateFromParams = (params) => {
  const get = (k) => params.get(k) || "";
  const role = get("role");
  const validRole = ROLE_FILTER_OPTIONS.some((o) => o.value === role)
    ? role
    : "all";
  const limit = Number(get("limit"));
  const page = Number(get("page"));
  const sortOrder = get("sortOrder") === "asc" ? "asc" : "desc";

  return {
    filters: {
      search: get("search"),
      role: validRole,
      regFrom: isYmd(get("regFrom")) ? get("regFrom") : "",
      regTo: isYmd(get("regTo")) ? get("regTo") : "",
      dobFrom: isYmd(get("dobFrom")) ? get("dobFrom") : "",
      dobTo: isYmd(get("dobTo")) ? get("dobTo") : "",
      course: /^[a-f0-9]{24}$/i.test(get("course")) ? get("course") : "",
    },
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: PAGE_SIZE_OPTIONS.includes(limit) ? limit : DEFAULT_PAGE_SIZE,
    sortBy: get("sortBy") || "createdAt",
    sortOrder,
  };
};

/** Inverse of readStateFromParams — omits defaults to keep URLs short. */
export const stateToParams = ({ filters, page, limit, sortBy, sortOrder }) => {
  const out = {};
  for (const k of FILTER_KEYS) {
    const v = filters[k];
    if (!v || (k === "role" && v === "all")) continue;
    out[k] = v;
  }
  if (page > 1) out.page = String(page);
  if (limit !== DEFAULT_PAGE_SIZE) out.limit = String(limit);
  if (sortBy && sortBy !== "createdAt") out.sortBy = sortBy;
  if (sortOrder === "asc") out.sortOrder = "asc";
  return out;
};

export const getTzOffset = () => new Date().getTimezoneOffset();

/** Filter object → API params (drops empties, adds tzOffset). */
export const toApiFilters = (filters) => {
  const params = { tzOffset: getTzOffset() };
  for (const k of FILTER_KEYS) {
    const v = typeof filters[k] === "string" ? filters[k].trim() : filters[k];
    if (!v) continue;
    params[k] = v;
  }
  // "all" is still sent so the server always runs the advanced code path.
  if (!params.role) params.role = "all";
  return params;
};

// A date range counts as ONE filter, whether one or both ends are set.
export const countActiveFilters = (filters) =>
  [
    filters.role && filters.role !== "all",
    filters.regFrom || filters.regTo,
    filters.dobFrom || filters.dobTo,
    filters.course,
  ].filter(Boolean).length;

/** Returns an error message when from > to, otherwise "". */
export const rangeError = (from, to) =>
  isYmd(from) && isYmd(to) && from > to
    ? "“From” date must be on or before the “To” date."
    : "";

// ── Display formatting ─────────────────────────────────────────────────

/**
 * First / last name for the table. Structured names are shown as-is;
 * legacy users (no firstName/lastName) show their full `name` under First
 * Name and "-" under Last Name.
 */
export const splitName = (u) => {
  const first = (u?.firstName || "").trim();
  const last = (u?.lastName || "").trim();
  if (first || last) {
    return { firstName: first || "-", lastName: last || "-" };
  }
  return { firstName: (u?.name || "").trim() || "-", lastName: "-" };
};

export const displayName = (u) => {
  const parts = [u?.firstName, u?.middleName, u?.lastName]
    .map((p) => (p || "").trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : (u?.name || "").trim();
};

const pad = (n) => String(n).padStart(2, "0");

/**
 * Date of birth → MM/DD/YYYY. DOBs are calendar dates stored at UTC
 * midnight, so UTC parts are used (local parts would show the previous day
 * for admins west of UTC). Null / invalid → "—".
 */
export const formatDob = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}/${d.getUTCFullYear()}`;
};

/** "Oct 5, 2026" in the admin's local timezone. */
export const formatJoined = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/** "YYYY-MM-DD" (date input value) → "MM/DD/YYYY" for chips. */
export const ymdToUs = (ymd) => {
  if (!isYmd(ymd)) return ymd || "";
  const [y, m, d] = ymd.split("-");
  return `${m}/${d}/${y}`;
};

/** Learners_MM-DD-YYYY.xlsx using the admin's local date. */
export const exportFilename = (now = new Date()) =>
  `Learners_${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${now.getFullYear()}.xlsx`;

/** Triggers a browser download for a Blob. */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const describeRange = (from, to) => {
  if (from && to) return `${ymdToUs(from)} – ${ymdToUs(to)}`;
  if (from) return `from ${ymdToUs(from)}`;
  if (to) return `until ${ymdToUs(to)}`;
  return "";
};
