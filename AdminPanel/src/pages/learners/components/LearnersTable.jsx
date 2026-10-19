// import { ArrowUp, ArrowDown, ChevronsUpDown, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
// import { Badge } from "../../../components/ui";
// import {
//   PAGE_SIZE_OPTIONS,
//   ROLE_BADGE,
//   splitName,
//   formatDob,
//   formatJoined,
//   formatDateTime,
//   formatRole,
// } from "../learnerUtils";

// const COLUMNS = [
//   { key: "firstName", label: "First Name", sortable: true },
//   { key: "lastName", label: "Last Name", sortable: true },
//   { key: "email", label: "Email", sortable: true },
//   { key: "mobile", label: "Mobile", sortable: true },
//   { key: "role", label: "Role", sortable: true },
//   { key: "dateOfBirth", label: "Date of Birth", sortable: true },
//   { key: "createdAt", label: "Joined", sortable: true },
//   { key: "actions", label: "", sortable: false, srLabel: "Actions" },
// ];

// function SortIcon({ active, order }) {
//   if (!active) return <ChevronsUpDown size={13} className="text-gray-300 group-hover:text-gray-400" />;
//   return order === "asc" ? (
//     <ArrowUp size={13} className="text-indigo-600" />
//   ) : (
//     <ArrowDown size={13} className="text-indigo-600" />
//   );
// }

// function SkeletonRows({ rows }) {
//   return Array.from({ length: rows }).map((_, i) => (
//     <tr key={i} className="animate-pulse">
//       <td className="px-4 py-3.5">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-full bg-gray-100" />
//           <div className="h-3.5 w-24 bg-gray-100 rounded" />
//         </div>
//       </td>
//       {[20, 40, 24, 16, 20, 20].map((w, j) => (
//         <td key={j} className="px-4 py-3.5">
//           <div className="h-3.5 bg-gray-100 rounded" style={{ width: `${w * 4}px` }} />
//         </td>
//       ))}
//       <td className="px-4 py-3.5">
//         <div className="h-7 w-7 bg-gray-100 rounded-lg ml-auto" />
//       </td>
//     </tr>
//   ));
// }

// function EmptyIllustration() {
//   return (
//     <svg width="140" height="104" viewBox="0 0 140 104" fill="none" aria-hidden="true">
//       <rect x="18" y="14" width="104" height="76" rx="12" fill="#EEF2FF" />
//       <rect x="30" y="28" width="80" height="10" rx="5" fill="#C7D2FE" />
//       <rect x="30" y="46" width="56" height="8" rx="4" fill="#E0E7FF" />
//       <rect x="30" y="60" width="68" height="8" rx="4" fill="#E0E7FF" />
//       <circle cx="98" cy="70" r="16" fill="#fff" stroke="#6366F1" strokeWidth="4" />
//       <path d="M110 82l10 10" stroke="#6366F1" strokeWidth="5" strokeLinecap="round" />
//       <path d="M92 70h12" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round" />
//     </svg>
//   );
// }

// function pageWindow(page, totalPages) {
//   const pages = new Set([1, totalPages, page - 1, page, page + 1]);
//   const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
//   const out = [];
//   list.forEach((p, i) => {
//     if (i > 0 && p - list[i - 1] > 1) out.push("…" + p);
//     out.push(p);
//   });
//   return out;
// }

// /**
//  * Server-paginated, sortable learners table with a sticky header.
//  * Row click → learner detail (same route as before); the delete button
//  * stops propagation exactly like the previous implementation.
//  */
// export default function LearnersTable({
//   users,
//   loading,
//   refreshing,
//   total,
//   page,
//   limit,
//   totalPages,
//   sortBy,
//   sortOrder,
//   onSort,
//   onPageChange,
//   onLimitChange,
//   onRowClick,
//   onDelete,
//   emptyAction,
//   hasFilters,
// }) {
//   const from = total === 0 ? 0 : (page - 1) * limit + 1;
//   const to = Math.min(page * limit, total);
//   const showSkeleton = loading && !users.length;
//   const showEmpty = !loading && !users.length;

//   return (
//     <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
//       {/* thin progress bar while refreshing existing data */}
//       <div className="h-0.5 bg-transparent overflow-hidden" aria-hidden="true">
//         <div
//           className={`h-full bg-indigo-500 transition-all duration-500 ${
//             refreshing ? "w-2/3 opacity-100" : "w-full opacity-0"
//           }`}
//         />
//       </div>

//       <div className="overflow-auto max-h-[calc(100vh-22rem)] min-h-[16rem]">
//         <table className="w-full min-w-[960px]" aria-busy={loading || refreshing}>
//           <thead>
//             <tr>
//               {COLUMNS.map((col) => {
//                 const active = sortBy === col.key;
//                 return (
//                   <th
//                     key={col.key}
//                     scope="col"
//                     aria-sort={active ? (sortOrder === "asc" ? "ascending" : "descending") : undefined}
//                     className={`sticky top-0 ${col.key === "actions" ? "right-0 z-20" : "z-10"} bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 whitespace-nowrap`}
//                   >
//                     {col.sortable ? (
//                       <button
//                         type="button"
//                         onClick={() => onSort(col.key)}
//                         className={`group inline-flex items-center gap-1.5 uppercase tracking-wide rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 ${
//                           active ? "text-indigo-600" : "hover:text-gray-600"
//                         }`}
//                       >
//                         {col.label}
//                         <SortIcon active={active} order={sortOrder} />
//                       </button>
//                     ) : (
//                       <span className="sr-only">{col.srLabel}</span>
//                     )}
//                   </th>
//                 );
//               })}
//             </tr>
//           </thead>

//           <tbody className={`divide-y divide-gray-100 transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
//             {showSkeleton && <SkeletonRows rows={Math.min(limit, 8)} />}

//             {showEmpty && (
//               <tr>
//                 <td colSpan={COLUMNS.length}>
//                   <div className="flex flex-col items-center justify-center py-16 text-center">
//                     <EmptyIllustration />
//                     <h3 className="text-lg font-semibold text-gray-700 mt-4">No users found</h3>
//                     <p className="text-sm text-gray-400 mt-1 max-w-sm">
//                       {hasFilters
//                         ? "No learners match your search or filters. Try adjusting or clearing them."
//                         : "There are no users yet."}
//                     </p>
//                     {hasFilters && emptyAction && <div className="mt-4">{emptyAction}</div>}
//                   </div>
//                 </td>
//               </tr>
//             )}

//             {users.map((r) => {
//               const { firstName, lastName } = splitName(r);
//               return (
//                 <tr
//                   key={r._id}
//                   onClick={() => onRowClick(r)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && e.target === e.currentTarget) onRowClick(r);
//                   }}
//                   tabIndex={0}
//                   className="group/row cursor-pointer hover:bg-indigo-50/40 focus:outline-none focus-visible:bg-indigo-50/60 transition-colors duration-150"
//                 >
//                   <td className="px-4 py-3.5 text-sm text-gray-700">
//                     <div className="flex items-center gap-3 min-w-0">
//                       <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
//                         {(firstName !== "-" ? firstName : r.email || "?").charAt(0).toUpperCase()}
//                       </div>
//                       <span className="font-medium text-gray-800 truncate max-w-[10rem]" title={firstName}>
//                         {firstName}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{lastName}</td>
//                   <td className="px-4 py-3.5 text-sm text-gray-600">
//                     <span className="truncate block max-w-[12rem]" title={r.email}>
//                       {r.email || "—"}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap tabular-nums">
//                     {r.mobile ? `${r.countryCode ? `${r.countryCode} ` : ""}${r.mobile}` : "—"}
//                   </td>
//                   <td className="px-4 py-3.5 text-sm whitespace-nowrap">
//                     <span className="capitalize">
//                       <Badge variant={ROLE_BADGE[r.role] || "default"}>{formatRole(r.role)}</Badge>
//                     </span>
//                   </td>
//                   <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap tabular-nums">
//                     {formatDob(r.dateOfBirth)}
//                   </td>
//                   <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap" title={formatDateTime(r.createdAt)}>
//                     {formatJoined(r.createdAt)}
//                   </td>
//                   <td className="sticky right-0 px-3 py-3.5 text-right bg-white group-hover/row:bg-[#f7f8ff] transition-colors duration-150">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onDelete(r._id);
//                       }}
//                       onKeyDown={(e) => e.stopPropagation()}
//                       aria-label={`Delete ${r.email || "user"}`}
//                       className="p-2 rounded-lg hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
//                     >
//                       <Trash2 size={16} className="text-red-500" />
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/40">
//         <div className="flex items-center gap-3 text-sm text-gray-500">
//           <label htmlFor="rows-per-page" className="whitespace-nowrap">Rows per page</label>
//           <select
//             id="rows-per-page"
//             value={limit}
//             onChange={(e) => onLimitChange(Number(e.target.value))}
//             className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
//           >
//             {PAGE_SIZE_OPTIONS.map((n) => (
//               <option key={n} value={n}>{n}</option>
//             ))}
//           </select>
//           <span className="hidden md:inline tabular-nums">
//             {total > 0 ? `${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}` : "0 results"}
//           </span>
//         </div>

//         <nav className="flex items-center gap-1" aria-label="Pagination">
//           <button
//             type="button"
//             onClick={() => onPageChange(page - 1)}
//             disabled={page <= 1 || loading}
//             aria-label="Previous page"
//             className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
//           >
//             <ChevronLeft size={16} />
//           </button>
//           {pageWindow(page, totalPages).map((p) =>
//             typeof p === "string" ? (
//               <span key={p} className="px-1.5 text-gray-400 text-sm">…</span>
//             ) : (
//               <button
//                 key={p}
//                 type="button"
//                 onClick={() => onPageChange(p)}
//                 aria-current={p === page ? "page" : undefined}
//                 className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 ${
//                   p === page ? "bg-indigo-600 text-white font-medium" : "text-gray-600 hover:bg-gray-100"
//                 }`}
//               >
//                 {p}
//               </button>
//             ),
//           )}
//           <button
//             type="button"
//             onClick={() => onPageChange(page + 1)}
//             disabled={page >= totalPages || loading}
//             aria-label="Next page"
//             className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
//           >
//             <ChevronRight size={16} />
//           </button>
//         </nav>
//       </div>
//     </div>
//   );
// }







import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, ChevronsUpDown, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../../../components/ui";
import {
  PAGE_SIZE_OPTIONS,
  ROLE_BADGE,
  splitName,
  formatDob,
  formatJoined,
  formatDateTime,
  formatRole,
} from "../learnerUtils";

// Scroll-area heights. Tweak here if your AdminLayout header is taller/shorter.
// (Full class strings so Tailwind can see them.)
const HEIGHT = {
  normal: "min-h-[28rem] max-h-[calc(100vh-18rem)]",
  expanded: "min-h-[28rem] max-h-[calc(100vh-10.5rem)]",
};

const DENSITY_KEY = "learners.tableDensity";
const DENSITY = {
  comfortable: { pad: "py-3.5", avatar: "w-9 h-9 text-sm" },
  compact: { pad: "py-2", avatar: "w-7 h-7 text-xs" },
};

const COLUMNS = [
  { key: "firstName", label: "First Name", sortable: true },
  { key: "lastName", label: "Last Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "mobile", label: "Mobile", sortable: true },
  { key: "role", label: "Role", sortable: true },
  { key: "dateOfBirth", label: "Date of Birth", sortable: true },
  { key: "createdAt", label: "Joined", sortable: true },
  { key: "actions", label: "", sortable: false, srLabel: "Actions" },
];

function SortIcon({ active, order }) {
  if (!active) return <ChevronsUpDown size={13} className="text-gray-300 group-hover:text-gray-400" />;
  return order === "asc" ? (
    <ArrowUp size={13} className="text-indigo-600" />
  ) : (
    <ArrowDown size={13} className="text-indigo-600" />
  );
}

function SkeletonRows({ rows }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100" />
          <div className="h-3.5 w-24 bg-gray-100 rounded" />
        </div>
      </td>
      {[20, 40, 24, 16, 20, 20].map((w, j) => (
        <td key={j} className="px-4 py-3.5">
          <div className="h-3.5 bg-gray-100 rounded" style={{ width: `${w * 4}px` }} />
        </td>
      ))}
      <td className="px-4 py-3.5">
        <div className="h-7 w-7 bg-gray-100 rounded-lg ml-auto" />
      </td>
    </tr>
  ));
}

function EmptyIllustration() {
  return (
    <svg width="140" height="104" viewBox="0 0 140 104" fill="none" aria-hidden="true">
      <rect x="18" y="14" width="104" height="76" rx="12" fill="#EEF2FF" />
      <rect x="30" y="28" width="80" height="10" rx="5" fill="#C7D2FE" />
      <rect x="30" y="46" width="56" height="8" rx="4" fill="#E0E7FF" />
      <rect x="30" y="60" width="68" height="8" rx="4" fill="#E0E7FF" />
      <circle cx="98" cy="70" r="16" fill="#fff" stroke="#6366F1" strokeWidth="4" />
      <path d="M110 82l10 10" stroke="#6366F1" strokeWidth="5" strokeLinecap="round" />
      <path d="M92 70h12" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function pageWindow(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out = [];
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) out.push("…" + p);
    out.push(p);
  });
  return out;
}

/**
 * Server-paginated, sortable learners table with a sticky header.
 * Row click → learner detail (same route as before); the delete button
 * stops propagation exactly like the previous implementation.
 */
export default function LearnersTable({
  users,
  loading,
  refreshing,
  total,
  page,
  limit,
  totalPages,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onLimitChange,
  onRowClick,
  onDelete,
  emptyAction,
  hasFilters,
  expanded = false,
}) {
  const [density, setDensity] = useState(() => {
    try {
      const v = localStorage.getItem(DENSITY_KEY);
      return v === "compact" ? "compact" : "comfortable";
    } catch {
      return "comfortable";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DENSITY_KEY, density);
    } catch {
      /* storage unavailable — preference just won't persist */
    }
  }, [density]);
  const d = DENSITY[density];

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const showSkeleton = loading && !users.length;
  const showEmpty = !loading && !users.length;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* thin progress bar while refreshing existing data */}
      <div className="h-0.5 bg-transparent overflow-hidden" aria-hidden="true">
        <div
          className={`h-full bg-indigo-500 transition-all duration-500 ${
            refreshing ? "w-2/3 opacity-100" : "w-full opacity-0"
          }`}
        />
      </div>

      <div className={`overflow-auto overscroll-contain ${expanded ? HEIGHT.expanded : HEIGHT.normal}`}>
        <table className="w-full min-w-[960px]" aria-busy={loading || refreshing}>
          <thead>
            <tr>
              {COLUMNS.map((col) => {
                const active = sortBy === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sortOrder === "asc" ? "ascending" : "descending") : undefined}
                    className={`sticky top-0 ${col.key === "actions" ? "right-0 z-20" : "z-10"} bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 whitespace-nowrap`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className={`group inline-flex items-center gap-1.5 uppercase tracking-wide rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 ${
                          active ? "text-indigo-600" : "hover:text-gray-600"
                        }`}
                      >
                        {col.label}
                        <SortIcon active={active} order={sortOrder} />
                      </button>
                    ) : (
                      <span className="sr-only">{col.srLabel}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className={`divide-y divide-gray-100 transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}>
            {showSkeleton && <SkeletonRows rows={Math.min(limit, 8)} />}

            {showEmpty && (
              <tr>
                <td colSpan={COLUMNS.length}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <EmptyIllustration />
                    <h3 className="text-lg font-semibold text-gray-700 mt-4">No users found</h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-sm">
                      {hasFilters
                        ? "No learners match your search or filters. Try adjusting or clearing them."
                        : "There are no users yet."}
                    </p>
                    {hasFilters && emptyAction && <div className="mt-4">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            )}

            {users.map((r) => {
              const { firstName, lastName } = splitName(r);
              return (
                <tr
                  key={r._id}
                  onClick={() => onRowClick(r)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) onRowClick(r);
                  }}
                  tabIndex={0}
                  className="group/row cursor-pointer hover:bg-indigo-50/40 focus:outline-none focus-visible:bg-indigo-50/60 transition-colors duration-150"
                >
                  <td className={`px-4 ${d.pad} text-sm text-gray-700`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`${d.avatar} shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold`}>
                        {(firstName !== "-" ? firstName : r.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800 truncate max-w-[12rem]" title={firstName}>
                        {firstName}
                      </span>
                    </div>
                  </td>
                  <td className={`px-4 ${d.pad} text-sm text-gray-700 whitespace-nowrap`}>{lastName}</td>
                  <td className={`px-4 ${d.pad} text-sm text-gray-600`}>
                    <span className="truncate block max-w-[18rem]" title={r.email}>
                      {r.email || "—"}
                    </span>
                  </td>
                  <td className={`px-4 ${d.pad} text-sm text-gray-600 whitespace-nowrap tabular-nums`}>
                    {r.mobile ? `${r.countryCode ? `${r.countryCode} ` : ""}${r.mobile}` : "—"}
                  </td>
                  <td className={`px-4 ${d.pad} text-sm whitespace-nowrap`}>
                    <span className="capitalize">
                      <Badge variant={ROLE_BADGE[r.role] || "default"}>{formatRole(r.role)}</Badge>
                    </span>
                  </td>
                  <td className={`px-4 ${d.pad} text-sm text-gray-600 whitespace-nowrap tabular-nums`}>
                    {formatDob(r.dateOfBirth)}
                  </td>
                  <td className={`px-4 ${d.pad} text-sm text-gray-600 whitespace-nowrap`} title={formatDateTime(r.createdAt)}>
                    {formatJoined(r.createdAt)}
                  </td>
                  <td className={`sticky right-0 px-3 ${d.pad} text-right bg-white group-hover/row:bg-[#f7f8ff] transition-colors duration-150`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(r._id);
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      aria-label={`Delete ${r.email || "user"}`}
                      className="p-2 rounded-lg hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/40">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <label htmlFor="rows-per-page" className="whitespace-nowrap">Rows per page</label>
          <select
            id="rows-per-page"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className="hidden md:inline tabular-nums">
            {total > 0 ? `${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}` : "0 results"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            role="group"
            aria-label="Row density"
            className="hidden sm:inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs"
          >
            {[
              ["comfortable", "Comfortable"],
              ["compact", "Compact"],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setDensity(k)}
                aria-pressed={density === k}
                className={`px-2.5 py-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 ${
                  density === k ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            aria-label="Previous page"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
          >
            <ChevronLeft size={16} />
          </button>
          {pageWindow(page, totalPages).map((p) =>
            typeof p === "string" ? (
              <span key={p} className="px-1.5 text-gray-400 text-sm">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 ${
                  p === page ? "bg-indigo-600 text-white font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            aria-label="Next page"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
        </div>
      </div>
    </div>
  );
}