import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

/**
 * Accessible searchable single-select (combobox pattern), styled like the
 * admin panel's <Select>. Used for the Course filter.
 *
 * props:
 *   label, value, onChange(value), options [{ value, label, hint? }],
 *   placeholder, emptyLabel (label of the "nothing selected" option)
 */
export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  emptyLabel = "All",
  disabled = false,
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => o.value === value) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // While searching, only real matches are listed so Enter picks the
    // first match; the "nothing selected" option is shown when idle.
    if (q) return options.filter((o) => o.label.toLowerCase().includes(q));
    return [{ value: "", label: emptyLabel }, ...options];
  }, [options, query, emptyLabel]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      const idx = filtered.findIndex((o) => o.value === value);
      setActive(idx >= 0 ? idx : 0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  const choose = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      {label && (
        <label
          htmlFor={`${id}-btn`}
          className="text-sm font-medium text-gray-600 mb-1 block"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={`${id}-btn`}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition disabled:opacity-60"
        >
          <span className={`truncate ${selected ? "text-gray-800" : "text-gray-400"}`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {selected && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => onChange("")}
            className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search…"
                role="combobox"
                aria-controls={`${id}-list`}
                aria-expanded="true"
                aria-activedescendant={`${id}-opt-${active}`}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>
          </div>
          <ul
            id={`${id}-list`}
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-400">No matches</li>
            )}
            {filtered.map((opt, idx) => {
              const isSel = opt.value === value;
              return (
                <li
                  key={opt.value || "__empty"}
                  id={`${id}-opt-${idx}`}
                  data-idx={idx}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(opt);
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer ${
                    idx === active ? "bg-indigo-50 text-indigo-700" : "text-gray-700"
                  } ${opt.value === "" ? "text-gray-500" : ""}`}
                >
                  <span className="truncate">
                    {opt.label}
                    {opt.hint && (
                      <span className="ml-2 text-xs text-gray-400">{opt.hint}</span>
                    )}
                  </span>
                  {isSel && <Check size={14} className="shrink-0 text-indigo-600" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
