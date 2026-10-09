import { useEffect, useRef, useState } from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button, Select } from "../../../components/ui";
import SearchableSelect from "./SearchableSelect";
import { EMPTY_FILTERS, ROLE_FILTER_OPTIONS, rangeError } from "../learnerUtils";

function DateField({ id, label, value, onChange, min, max }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        min={min || undefined}
        max={max || undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
      />
    </div>
  );
}

function RangeGroup({ title, idPrefix, from, to, onFrom, onTo, error }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-600 mb-2">{title}</legend>
      <div className="grid grid-cols-2 gap-3">
        <DateField id={`${idPrefix}-from`} label="From" value={from} onChange={onFrom} max={to} />
        <DateField id={`${idPrefix}-to`} label="To" value={to} onChange={onTo} min={from} />
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-500 mt-1.5">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/**
 * Slide-over filter panel. Edits a DRAFT copy of the filters; nothing is
 * applied (and no request is made) until "Apply Filters" is pressed.
 * Search is not edited here — it lives in the page's search box.
 *
 * Only filters backed by real schema fields are offered: Role, Registration
 * date, DOB, Course (User.enrolledCourses). There is no account-status or
 * email-verification field on User, so those filters are intentionally not
 * rendered.
 */
export default function LearnerFilterDrawer({
  open,
  onClose,
  filters,
  onApply,
  courses = [],
  coursesLoading = false,
}) {
  const [draft, setDraft] = useState(filters);
  const panelRef = useRef(null);

  // Lightweight enter/exit transition (CSS only — no animation library):
  // mount → next frame slide in; close → slide out → unmount.
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) {
      setRendered(true);
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = setTimeout(() => setRendered(false), 250);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => panelRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  const regErr = rangeError(draft.regFrom, draft.regTo);
  const dobErr = rangeError(draft.dobFrom, draft.dobTo);
  const invalid = Boolean(regErr || dobErr);

  const clearAll = () =>
    setDraft((d) => ({ ...EMPTY_FILTERS, search: d.search }));

  return (
    rendered && (
        <div className="fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="learner-filter-title"
            className={`absolute right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-2xl flex flex-col focus:outline-none transition-transform duration-250 ease-out ${
              visible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <SlidersHorizontal size={16} />
                </div>
                <h2 id="learner-filter-title" className="text-lg font-bold text-gray-800">
                  Filters
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close filters"
                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <Select
                label="Role"
                value={draft.role}
                onChange={(e) => set("role")(e.target.value)}
                options={ROLE_FILTER_OPTIONS}
              />

              <RangeGroup
                title="Registration Date"
                idPrefix="reg"
                from={draft.regFrom}
                to={draft.regTo}
                onFrom={set("regFrom")}
                onTo={set("regTo")}
                error={regErr}
              />

              <RangeGroup
                title="Date of Birth"
                idPrefix="dob"
                from={draft.dobFrom}
                to={draft.dobTo}
                onFrom={set("dobFrom")}
                onTo={set("dobTo")}
                error={dobErr}
              />

              <SearchableSelect
                label="Enrolled Course"
                value={draft.course}
                onChange={set("course")}
                options={courses.map((c) => ({
                  value: c._id,
                  label: c.title,
                  hint: c.status && c.status !== "published" ? c.status : "",
                }))}
                placeholder={coursesLoading ? "Loading courses…" : "All courses"}
                emptyLabel="All courses"
                disabled={coursesLoading}
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/60">
              <Button variant="ghost" onClick={clearAll} className="whitespace-nowrap -ml-2">
                <RotateCcw size={15} />
                Clear All Filters
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={onClose} className="whitespace-nowrap">
                  Cancel
                </Button>
                <Button
                  onClick={() => onApply(draft)}
                  disabled={invalid}
                  className={`whitespace-nowrap ${invalid ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )
  );
}
