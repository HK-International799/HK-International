import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  FileSpreadsheet,
  X,
  AlertCircle,
  Info,
  Loader2,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Modal, Button } from "../../../components/ui";
import { exportUsersExcel, getUserStats } from "../../../services/adminService";
import {
  rangeError,
  toApiFilters,
  roleFilterLabel,
  describeRange,
  exportFilename,
  downloadBlob,
} from "../learnerUtils";

const STORAGE_KEY = "learnersExport.columns.v1";

// Sensible starting selection (in this order) when nothing is remembered.
const DEFAULT_COLUMNS = [
  "firstName",
  "lastName",
  "email",
  "mobile",
  "dateOfBirth",
  "role",
  "createdAt",
  "coursesEnrolled",
];

const readRemembered = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((k) => typeof k === "string") : null;
  } catch {
    return null;
  }
};

const remember = (keys) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    /* storage unavailable — not critical */
  }
};

/**
 * "Export Learners" modal.
 *  1. Registration date range (pre-filled from the page's filter).
 *  2. Every other active page filter (role, DOB, course, search) is applied
 *     automatically and listed for transparency.
 *  3. Searchable, grouped column picker. Columns are exported in the exact
 *     order they were checked (shown as a numbered list).
 */
export default function ExportLearnersModal({
  open,
  onClose,
  filters,
  sortBy,
  sortOrder,
  columns = [],
  unavailableColumns = [],
  metaLoading = false,
  courses = [],
}) {
  const [regFrom, setRegFrom] = useState("");
  const [regTo, setRegTo] = useState("");
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(null);
  const [counting, setCounting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const countReq = useRef(0);

  const columnKeys = useMemo(() => new Set(columns.map((c) => c.key)), [columns]);
  const byKey = useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);

  // Initialise each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setRegFrom(filters.regFrom || "");
    setRegTo(filters.regTo || "");
    setQuery("");
    setError("");
    setSuccess("");
  }, [open, filters.regFrom, filters.regTo]);

  // Initial column selection once the catalog is available.
  useEffect(() => {
    if (!open || !columns.length) return;
    setSelected((cur) => {
      const valid = cur.filter((k) => columnKeys.has(k));
      if (valid.length) return valid;
      const base = readRemembered() || DEFAULT_COLUMNS;
      return base.filter((k) => columnKeys.has(k));
    });
  }, [open, columns, columnKeys]);

  const dateErr = rangeError(regFrom, regTo);

  const exportFilters = useMemo(
    () => ({ ...filters, regFrom, regTo }),
    [filters, regFrom, regTo],
  );

  // Live "N learners will be exported" count (reuses the stats endpoint so
  // it is guaranteed to match the server-side export filter).
  useEffect(() => {
    if (!open || dateErr) return;
    const id = ++countReq.current;
    setCounting(true);
    const t = setTimeout(async () => {
      try {
        const s = await getUserStats(toApiFilters(exportFilters));
        if (countReq.current === id) setCount(s?.total ?? 0);
      } catch {
        if (countReq.current === id) setCount(null);
      } finally {
        if (countReq.current === id) setCounting(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [open, exportFilters, dateErr]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map();
    for (const c of columns) {
      if (q && !c.label.toLowerCase().includes(q) && !c.group.toLowerCase().includes(q)) continue;
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group).push(c);
    }
    return [...map.entries()];
  }, [columns, query]);

  const visibleKeys = groups.flatMap(([, cols]) => cols.map((c) => c.key));

  const toggle = (key) =>
    setSelected((cur) =>
      cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key],
    );

  const selectKeys = (keys) =>
    setSelected((cur) => [...cur, ...keys.filter((k) => !cur.includes(k))]);

  const unselectKeys = (keys) =>
    setSelected((cur) => cur.filter((k) => !keys.includes(k)));

  const courseTitle = courses.find((c) => c._id === filters.course)?.title;
  const appliedChips = [
    filters.search && `Search: “${filters.search}”`,
    filters.role && filters.role !== "all" && `Role: ${roleFilterLabel(filters.role)}`,
    (filters.dobFrom || filters.dobTo) &&
      `DOB: ${describeRange(filters.dobFrom, filters.dobTo)}`,
    filters.course && `Course: ${courseTitle || "Selected course"}`,
  ].filter(Boolean);

  const canExport =
    !exporting && !dateErr && selected.length > 0 && count !== 0 && !metaLoading;

  const handleExport = async () => {
    if (!canExport) return;
    setExporting(true);
    setError("");
    setSuccess("");
    try {
      const { blob, rowCount } = await exportUsersExcel({
        filters: toApiFilters(exportFilters),
        columns: selected,
        sortBy,
        sortOrder,
      });
      downloadBlob(blob, exportFilename());
      remember(selected);
      setSuccess(
        `Exported ${rowCount ?? count ?? ""} learner${(rowCount ?? count) === 1 ? "" : "s"} to ${exportFilename()}`,
      );
    } catch (err) {
      setError(err.message || "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal open={open} onClose={exporting ? () => {} : onClose} title="Export Learners" size="xl">
      <div className="space-y-6">
        {/* 1. Date range */}
        <section aria-labelledby="exp-range">
          <h3 id="exp-range" className="text-sm font-semibold text-gray-700 mb-2">
            1. Registration date range
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div>
              <label htmlFor="exp-from" className="text-xs font-medium text-gray-500 mb-1 block">
                From
              </label>
              <input
                id="exp-from"
                type="date"
                value={regFrom}
                max={regTo || undefined}
                onChange={(e) => setRegFrom(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="exp-to" className="text-xs font-medium text-gray-500 mb-1 block">
                To
              </label>
              <input
                id="exp-to"
                type="date"
                value={regTo}
                min={regFrom || undefined}
                onChange={(e) => setRegTo(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>
          </div>
          {dateErr ? (
            <p role="alert" className="text-xs text-red-500 mt-1.5">{dateErr}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1.5">Leave empty to include all registration dates.</p>
          )}
        </section>

        {/* 2. Applied filters */}
        <section aria-labelledby="exp-filters">
          <h3 id="exp-filters" className="text-sm font-semibold text-gray-700 mb-2">
            2. Filters applied from the page
          </h3>
          {appliedChips.length ? (
            <div className="flex flex-wrap gap-2">
              {appliedChips.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium"
                >
                  <Filter size={12} />
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No other filters — all users in the date range are included.</p>
          )}
          <div className="mt-3 inline-flex items-center gap-2 text-sm" aria-live="polite">
            {counting ? (
              <span className="inline-flex items-center gap-2 text-gray-400">
                <Loader2 size={14} className="animate-spin" /> Counting matching learners…
              </span>
            ) : count === null ? null : count === 0 ? (
              <span className="inline-flex items-center gap-2 text-orange-600">
                <AlertCircle size={14} /> No learners match these filters — nothing to export.
              </span>
            ) : (
              <span className="text-gray-600">
                <strong className="text-gray-800">{count.toLocaleString()}</strong>{" "}
                learner{count === 1 ? "" : "s"} will be exported.
              </span>
            )}
          </div>
        </section>

        {/* 3. Columns */}
        <section aria-labelledby="exp-cols">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
            <h3 id="exp-cols" className="text-sm font-semibold text-gray-700">
              3. Columns{" "}
              <span className="font-normal text-gray-400">
                ({selected.length} selected — exported in the order checked)
              </span>
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectKeys(visibleKeys)}
                disabled={!visibleKeys.length}
              >
                Select {query ? "shown" : "all"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (query ? unselectKeys(visibleKeys) : setSelected([]))}
                disabled={!selected.length}
              >
                Clear {query ? "shown" : "all"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Picker */}
            <div className="lg:col-span-3 border border-gray-100 rounded-xl overflow-hidden">
              <div className="p-2.5 border-b border-gray-100 bg-gray-50/60">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search columns…"
                    aria-label="Search columns"
                    className="w-full pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                  {query && (
                    <button
                      type="button"
                      aria-label="Clear column search"
                      onClick={() => setQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto p-2">
                {metaLoading ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-7 bg-gray-100 rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : !groups.length ? (
                  <p className="text-sm text-gray-400 p-3">No columns match “{query}”.</p>
                ) : (
                  groups.map(([group, cols]) => {
                    const keys = cols.map((c) => c.key);
                    const all = keys.every((k) => selected.includes(k));
                    return (
                      <div key={group} className="mb-2 last:mb-0">
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            {group}
                          </span>
                          <button
                            type="button"
                            onClick={() => (all ? unselectKeys(keys) : selectKeys(keys))}
                            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus:underline"
                          >
                            {all ? "Unselect group" : "Select group"}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                          {cols.map((c) => {
                            const idx = selected.indexOf(c.key);
                            const checked = idx !== -1;
                            return (
                              <label
                                key={c.key}
                                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                                  checked ? "bg-indigo-50/70 text-indigo-800" : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggle(c.key)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 accent-indigo-600 focus:ring-2 focus:ring-indigo-200"
                                />
                                <span className="truncate flex-1">{c.label}</span>
                                {checked && (
                                  <span className="text-[10px] font-semibold text-indigo-500 tabular-nums">
                                    #{idx + 1}
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Order preview */}
            <div className="lg:col-span-2 border border-gray-100 rounded-xl overflow-hidden flex flex-col">
              <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Export order
              </div>
              <ol className="max-h-72 overflow-y-auto p-2 space-y-1 flex-1">
                {!selected.length && (
                  <li className="text-sm text-gray-400 p-2">
                    No columns selected yet. Tick columns on the left — they’ll appear here in order.
                  </li>
                )}
                {selected.map((k, i) => (
                  <li
                    key={k}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white border border-gray-100 text-sm text-gray-700"
                  >
                    <span className="w-6 text-xs font-semibold text-gray-400 tabular-nums">{i + 1}.</span>
                    <span className="flex-1 truncate">{byKey.get(k)?.label || k}</span>
                    <button
                      type="button"
                      onClick={() => toggle(k)}
                      aria-label={`Remove ${byKey.get(k)?.label || k}`}
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {unavailableColumns.length > 0 && (
            <p className="mt-3 flex items-start gap-2 text-xs text-gray-400">
              <Info size={14} className="shrink-0 mt-px" />
              <span>
                Not available in the current data model, so not offered:{" "}
                {unavailableColumns.join(", ")}.
              </span>
            </p>
          )}
        </section>

        {/* Footer */}
        <div className="sticky bottom-0 -mx-6 -mb-5 px-6 py-4 bg-white border-t border-gray-100 space-y-3">
          {error && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div role="status" className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-gray-400">
              File: <span className="font-medium text-gray-500">{exportFilename()}</span> · Sheet “Learners Export”
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={onClose} disabled={exporting}>
                {success ? "Close" : "Cancel"}
              </Button>
              <Button
                onClick={handleExport}
                disabled={!canExport}
                className={!canExport ? "opacity-50 cursor-not-allowed" : ""}
              >
                {exporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={16} />
                    Export to Excel
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
