import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * Server-side pagination bar used by list pages.
 *
 * Shows "Showing X–Y of N", a rows-per-page selector and
 * First / Previous / numbered pages / Next / Last controls. Purely
 * presentational — the parent owns page / pageSize and refetches.
 */
const buildPageList = (page, totalPages) => {
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 1, totalPages - 2, totalPages - 3].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
};

export default function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = "records",
  disabled = false,
}) {
  const safeTotalPages = Math.max(totalPages || 1, 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const go = (p) => {
    if (disabled) return;
    const next = Math.min(Math.max(p, 1), safeTotalPages);
    if (next !== page) onPageChange(next);
  };

  const btn =
    "inline-flex items-center justify-center min-w-[34px] h-[34px] px-2 rounded-lg text-sm border transition disabled:opacity-40 disabled:cursor-not-allowed";
  const idle = "bg-white border-gray-200 text-gray-600 hover:bg-gray-50";
  const active = "bg-indigo-600 border-indigo-600 text-white font-semibold";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span aria-live="polite">
          Showing{" "}
          <strong className="text-gray-800">
            {from.toLocaleString()}–{to.toLocaleString()}
          </strong>{" "}
          of <strong className="text-gray-800">{total.toLocaleString()}</strong> {itemLabel}
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav className="flex flex-wrap items-center gap-1.5" aria-label="Pagination">
        <button type="button" className={`${btn} ${idle}`} onClick={() => go(1)} disabled={disabled || page <= 1} title="First page" aria-label="First page">
          <ChevronsLeft size={15} />
        </button>
        <button type="button" className={`${btn} ${idle}`} onClick={() => go(page - 1)} disabled={disabled || page <= 1} title="Previous page" aria-label="Previous page">
          <ChevronLeft size={15} />
        </button>
        {buildPageList(page, safeTotalPages).map((p) =>
          typeof p === "string" ? (
            <span key={p} className="px-1 text-gray-400 select-none">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${btn} ${p === page ? active : idle}`}
              onClick={() => go(p)}
              disabled={disabled}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" className={`${btn} ${idle}`} onClick={() => go(page + 1)} disabled={disabled || page >= safeTotalPages} title="Next page" aria-label="Next page">
          <ChevronRight size={15} />
        </button>
        <button type="button" className={`${btn} ${idle}`} onClick={() => go(safeTotalPages)} disabled={disabled || page >= safeTotalPages} title="Last page" aria-label="Last page">
          <ChevronsRight size={15} />
        </button>
      </nav>
    </div>
  );
}
