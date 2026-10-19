
// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import AdminLayout from "../../components/layout/AdminLayout";

// import {
//   PageHeader,
//   Button,
//   Modal,
//   Input,
//   Select,
// } from "../../components/ui";

// import {
//   getAllUsers,
//   createUser,
//   deleteUser,
//   getUserStats,
//   getUserFilterMeta,
// } from "../../services/adminService";

// import {
//   Search,
//   X,
//   SlidersHorizontal,
//   FileSpreadsheet,
//   AlertCircle,
//   RotateCcw,
// } from "lucide-react";

// import LearnersTable from "./components/LearnersTable";
// import LearnerStatsCards from "./components/LearnerStatsCards";
// import LearnerFilterDrawer from "./components/LearnerFilterDrawer";
// import ExportLearnersModal from "./components/ExportLearnersModal";
// import {
//   EMPTY_FILTERS,
//   ROLE_FILTER_OPTIONS,
//   readStateFromParams,
//   stateToParams,
//   toApiFilters,
//   countActiveFilters,
//   roleFilterLabel,
//   describeRange,
// } from "./learnerUtils";

// const SEARCH_DEBOUNCE_MS = 350;

// export default function Learners() {
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();

//   // ── Page state lives in the URL, so returning from a learner's detail
//   //    page (or sharing the link) restores the exact same view. ─────────
//   const paramsKey = searchParams.toString();
//   const state = useMemo(
//     () => readStateFromParams(new URLSearchParams(paramsKey)),
//     [paramsKey],
//   );
//   const { filters, page, limit, sortBy, sortOrder } = state;

//   // Functional update: always merges into the LATEST URL state, so a
//   // debounced search can never overwrite a page/sort change made meanwhile.
//   const updateState = useCallback(
//     (patch, { resetPage = true } = {}) => {
//       setSearchParams(
//         (prev) => {
//           const cur = readStateFromParams(prev);
//           const next = { ...cur, ...patch };
//           if (patch.filters) next.filters = { ...cur.filters, ...patch.filters };
//           if (resetPage && patch.page === undefined) next.page = 1;
//           return stateToParams(next);
//         },
//         { replace: true },
//       );
//     },
//     [setSearchParams],
//   );

//   // ── Data ────────────────────────────────────────────────────────────────
//   const [users, setUsers] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [listError, setListError] = useState("");

//   const [stats, setStats] = useState(null);
//   const [statsLoading, setStatsLoading] = useState(true);
//   const [statsError, setStatsError] = useState(false);

//   const [meta, setMeta] = useState({ courses: [], exportColumns: [], unavailableColumns: [] });
//   const [metaLoading, setMetaLoading] = useState(true);

//   const [reloadKey, setReloadKey] = useState(0);
//   const listReq = useRef(0);
//   const statsReq = useRef(0);

//   const apiFilters = useMemo(() => toApiFilters(filters), [filters]);
//   const filtersKey = JSON.stringify(apiFilters);

//   // Users list (server-side search / filter / sort / pagination).
//   useEffect(() => {
//     const id = ++listReq.current;
//     setLoading(true);
//     setListError("");
//     (async () => {
//       try {
//         const data = await getAllUsers({ ...apiFilters, page, limit, sortBy, sortOrder });
//         if (listReq.current !== id) return;
//         const list = data?.users || (Array.isArray(data) ? data : []);
//         const t = Number(data?.total) || 0;
//         const tp = Number(data?.totalPages) || Math.max(Math.ceil(t / limit), 1);
//         // Current page no longer exists (e.g. after a delete) → last page.
//         if (t > 0 && page > tp) {
//           updateState({ page: tp }, { resetPage: false });
//           return;
//         }
//         setUsers(list);
//         setTotal(t);
//         setTotalPages(tp);
//       } catch (err) {
//         if (listReq.current !== id) return;
//         setUsers([]);
//         setTotal(0);
//         setTotalPages(1);
//         setListError(err.response?.data?.message || "Could not load users. Please try again.");
//       } finally {
//         if (listReq.current === id) setLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filtersKey, page, limit, sortBy, sortOrder, reloadKey]);

//   // Stat cards — depend on filters only (not paging/sorting).
//   useEffect(() => {
//     const id = ++statsReq.current;
//     setStatsLoading(true);
//     setStatsError(false);
//     (async () => {
//       try {
//         const data = await getUserStats(apiFilters);
//         if (statsReq.current === id) setStats(data);
//       } catch {
//         if (statsReq.current === id) setStatsError(true);
//       } finally {
//         if (statsReq.current === id) setStatsLoading(false);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filtersKey, reloadKey]);

//   // Filter / export metadata — once.
//   useEffect(() => {
//     let alive = true;
//     getUserFilterMeta()
//       .then((data) => {
//         if (!alive) return;
//         setMeta({
//           courses: data?.courses || [],
//           exportColumns: data?.exportColumns || [],
//           unavailableColumns: data?.unavailableColumns || [],
//         });
//       })
//       .catch(() => {})
//       .finally(() => alive && setMetaLoading(false));
//     return () => {
//       alive = false;
//     };
//   }, []);

//   const reload = () => setReloadKey((k) => k + 1);

//   // ── Search (debounced, server-side) ─────────────────────────────────────
//   const [searchInput, setSearchInput] = useState(filters.search);
//   useEffect(() => {
//     setSearchInput(filters.search);
//   }, [filters.search]);

//   useEffect(() => {
//     if (searchInput.trim() === filters.search.trim()) return;
//     const t = setTimeout(() => {
//       updateState({ filters: { search: searchInput.trim() } });
//     }, SEARCH_DEBOUNCE_MS);
//     return () => clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchInput]);

//   // ── Sorting / paging ────────────────────────────────────────────────────
//   const handleSort = (key) => {
//     if (sortBy === key) {
//       updateState({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
//     } else {
//       // Dates default to newest first; text columns to A→Z.
//       const dateCol = key === "createdAt" || key === "dateOfBirth";
//       updateState({ sortBy: key, sortOrder: dateCol ? "desc" : "asc" });
//     }
//   };

//   // ── Filters UI ──────────────────────────────────────────────────────────
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [exportOpen, setExportOpen] = useState(false);
//   const activeCount = countActiveFilters(filters);
//   const hasAnyFilter = activeCount > 0 || Boolean(filters.search);

//   const clearAllFilters = () => {
//     setSearchInput("");
//     updateState({ filters: { ...EMPTY_FILTERS } });
//   };

//   const courseTitle = (id) =>
//     meta.courses.find((c) => c._id === id)?.title || "Selected course";

//   const chips = [
//     filters.search && {
//       key: "search",
//       label: `Search: “${filters.search}”`,
//       clear: () => {
//         setSearchInput("");
//         updateState({ filters: { search: "" } });
//       },
//     },
//     filters.role !== "all" && {
//       key: "role",
//       label: `Role: ${roleFilterLabel(filters.role)}`,
//       clear: () => updateState({ filters: { role: "all" } }),
//     },
//     (filters.regFrom || filters.regTo) && {
//       key: "reg",
//       label: `Registered ${describeRange(filters.regFrom, filters.regTo)}`,
//       clear: () => updateState({ filters: { regFrom: "", regTo: "" } }),
//     },
//     (filters.dobFrom || filters.dobTo) && {
//       key: "dob",
//       label: `DOB ${describeRange(filters.dobFrom, filters.dobTo)}`,
//       clear: () => updateState({ filters: { dobFrom: "", dobTo: "" } }),
//     },
//     filters.course && {
//       key: "course",
//       label: `Course: ${courseTitle(filters.course)}`,
//       clear: () => updateState({ filters: { course: "" } }),
//     },
//   ].filter(Boolean);

//   // ── Existing behaviour: create user (modal kept exactly as before; its
//   //    "Add User" trigger remains hidden, as it was in the previous page) ──
//   const [showCreate, setShowCreate] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     role: "student",
//   });

//   const handleCreate = async () => {
//     try {
//       const res = await createUser(form);

//       const credentials = res.data.credentials;

//       alert(
//         `User Created Successfully\n\nEmail: ${credentials.email}\nPassword: ${credentials.password}`,
//       );

//       setShowCreate(false);

//       setForm({
//         name: "",
//         email: "",
//         mobile: "",
//         role: "student",
//       });

//       reload();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error creating user");
//     }
//   };

//   // ── Existing behaviour: delete user ─────────────────────────────────────
//   const handleDelete = async (id) => {
//     if (!confirm("Delete user?")) return;

//     try {
//       await deleteUser(id);
//       reload();
//     } catch {
//       // Same as before: a failed delete leaves the list unchanged.
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="animate-fadeIn">
//         <PageHeader
//           title="Learners & Users"
//           subtitle={
//             loading && !users.length && !listError
//               ? "Loading users…"
//               : `${total.toLocaleString()} ${total === 1 ? "user" : "users"}${hasAnyFilter ? " match the current filters" : " in total"}`
//           }
//           actions={
//             <>
//               {/* <Button onClick={() => setShowCreate(true)}>
//                 <Plus size={16} />
//                 Add User
//               </Button> */}
//               <Button onClick={() => setExportOpen(true)}>
//                 <FileSpreadsheet size={16} />
//                 Export Learners
//               </Button>
//             </>
//           }
//         />

//         <LearnerStatsCards stats={stats} loading={statsLoading} error={statsError} />

//         {/* Toolbar */}
//         <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
//           <div className="relative flex-1 md:max-w-md">
//             <Search
//               size={16}
//               className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//             />
//             <input
//               type="search"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") updateState({ filters: { search: searchInput.trim() } });
//               }}
//               placeholder="Search name, email, mobile, role, course, city…"
//               aria-label="Search users"
//               className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition [&::-webkit-search-cancel-button]:hidden"
//             />
//             {searchInput && (
//               <button
//                 type="button"
//                 aria-label="Clear search"
//                 onClick={() => {
//                   setSearchInput("");
//                   updateState({ filters: { search: "" } });
//                 }}
//                 className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
//               >
//                 <X size={14} />
//               </button>
//             )}
//           </div>

//           <div className="flex items-center gap-3">
//             <Select
//               aria-label="Filter by role"
//               value={filters.role}
//               onChange={(e) => updateState({ filters: { role: e.target.value } })}
//               options={ROLE_FILTER_OPTIONS}
//               className="min-w-[9.5rem]"
//             />

//             <Button
//               variant="outline"
//               onClick={() => setDrawerOpen(true)}
//               className="bg-white whitespace-nowrap"
//               aria-haspopup="dialog"
//             >
//               <SlidersHorizontal size={16} />
//               Filters
//               {activeCount > 0 && (
//                 <span className="ml-0.5 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold inline-flex items-center justify-center">
//                   {activeCount}
//                 </span>
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* Active filter chips */}
//         {chips.length > 0 && (
//           <div className="flex flex-wrap items-center gap-2 mb-3">
//             {chips.map((c) => (
//               <span
//                 key={c.key}
//                 className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium"
//               >
//                 {c.label}
//                 <button
//                   type="button"
//                   onClick={c.clear}
//                   aria-label={`Remove filter ${c.label}`}
//                   className="p-0.5 rounded-full hover:bg-indigo-100"
//                 >
//                   <X size={12} />
//                 </button>
//               </span>
//             ))}
//             <button
//               type="button"
//               onClick={clearAllFilters}
//               className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
//             >
//               <RotateCcw size={12} />
//               Clear all
//             </button>
//           </div>
//         )}

//         {listError && (
//           <div role="alert" className="flex items-center justify-between gap-3 p-3 mb-3 rounded-xl bg-red-50 text-red-700 text-sm">
//             <span className="flex items-center gap-2">
//               <AlertCircle size={16} />
//               {listError}
//             </span>
//             <Button size="sm" variant="outline" className="bg-white" onClick={reload}>
//               Retry
//             </Button>
//           </div>
//         )}

//         <LearnersTable
//           users={users}
//           loading={loading && !users.length}
//           refreshing={loading && users.length > 0}
//           total={total}
//           page={page}
//           limit={limit}
//           totalPages={totalPages}
//           sortBy={sortBy}
//           sortOrder={sortOrder}
//           onSort={handleSort}
//           onPageChange={(p) => updateState({ page: Math.min(Math.max(p, 1), totalPages) }, { resetPage: false })}
//           onLimitChange={(n) => updateState({ limit: n })}
//           onRowClick={(r) => navigate(`/admin/learners/${r._id}`)}
//           onDelete={handleDelete}
//           hasFilters={hasAnyFilter}
//           emptyAction={
//             <Button variant="outline" onClick={clearAllFilters}>
//               <RotateCcw size={15} />
//               Clear All Filters
//             </Button>
//           }
//         />

//         <LearnerFilterDrawer
//           open={drawerOpen}
//           onClose={() => setDrawerOpen(false)}
//           filters={filters}
//           courses={meta.courses}
//           coursesLoading={metaLoading}
//           onApply={(draft) => {
//             setDrawerOpen(false);
//             updateState({ filters: { ...draft, search: filters.search } });
//           }}
//         />

//         <ExportLearnersModal
//           open={exportOpen}
//           onClose={() => setExportOpen(false)}
//           filters={filters}
//           sortBy={sortBy}
//           sortOrder={sortOrder}
//           columns={meta.exportColumns}
//           unavailableColumns={meta.unavailableColumns}
//           metaLoading={metaLoading}
//           courses={meta.courses}
//         />

//         <Modal
//           open={showCreate}
//           onClose={() => setShowCreate(false)}
//           title="Create User"
//         >
//           <div className="space-y-4">
//             <Input
//               label="Full Name"
//               value={form.name}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   name: e.target.value,
//                 })
//               }
//             />

//             <Input
//               label="Email"
//               type="email"
//               value={form.email}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   email: e.target.value,
//                 })
//               }
//             />

//             <Input
//               label="Mobile"
//               value={form.mobile}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   mobile: e.target.value,
//                 })
//               }
//             />

//             <Select
//               label="Role"
//               value={form.role}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   role: e.target.value,
//                 })
//               }
//               options={[
//                 {
//                   value: "student",
//                   label: "Student",
//                 },
//                 {
//                   value: "tutor",
//                   label: "Tutor",
//                 },
//               ]}
//             />

//             <div className="flex justify-end gap-3 pt-2">
//               <Button variant="secondary" onClick={() => setShowCreate(false)}>
//                 Cancel
//               </Button>

//               <Button onClick={handleCreate}>Create User</Button>
//             </div>
//           </div>
//         </Modal>
//       </div>
//     </AdminLayout>
//   );
// }





import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";

import {
  PageHeader,
  Button,
  Modal,
  Input,
  Select,
} from "../../components/ui";

import {
  getAllUsers,
  createUser,
  deleteUser,
  getUserStats,
  getUserFilterMeta,
} from "../../services/adminService";

import {
  Search,
  X,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
} from "lucide-react";

import LearnersTable from "./components/LearnersTable";
import LearnerStatsCards from "./components/LearnerStatsCards";
import LearnerFilterDrawer from "./components/LearnerFilterDrawer";
import ExportLearnersModal from "./components/ExportLearnersModal";
import {
  EMPTY_FILTERS,
  ROLE_FILTER_OPTIONS,
  readStateFromParams,
  stateToParams,
  toApiFilters,
  countActiveFilters,
  roleFilterLabel,
  describeRange,
} from "./learnerUtils";

const SEARCH_DEBOUNCE_MS = 350;
const FOCUS_KEY = "learners.focusMode";

export default function Learners() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Page state lives in the URL, so returning from a learner's detail
  //    page (or sharing the link) restores the exact same view. ─────────
  const paramsKey = searchParams.toString();
  const state = useMemo(
    () => readStateFromParams(new URLSearchParams(paramsKey)),
    [paramsKey],
  );
  const { filters, page, limit, sortBy, sortOrder } = state;

  // Functional update: always merges into the LATEST URL state, so a
  // debounced search can never overwrite a page/sort change made meanwhile.
  const updateState = useCallback(
    (patch, { resetPage = true } = {}) => {
      setSearchParams(
        (prev) => {
          const cur = readStateFromParams(prev);
          const next = { ...cur, ...patch };
          if (patch.filters) next.filters = { ...cur.filters, ...patch.filters };
          if (resetPage && patch.page === undefined) next.page = 1;
          return stateToParams(next);
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // ── Data ────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const [meta, setMeta] = useState({ courses: [], exportColumns: [], unavailableColumns: [] });
  const [metaLoading, setMetaLoading] = useState(true);

  const [reloadKey, setReloadKey] = useState(0);
  const listReq = useRef(0);
  const statsReq = useRef(0);
  const searchRef = useRef(null);

  // "Focus mode": hides the stats cards so the table gets the whole screen.
  const [focusMode, setFocusMode] = useState(() => {
    try {
      return localStorage.getItem(FOCUS_KEY) === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(FOCUS_KEY, focusMode ? "1" : "0");
    } catch {
      /* storage unavailable — preference just won't persist */
    }
  }, [focusMode]);

  // Press "/" anywhere (outside a field) to jump to the search box.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t?.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const apiFilters = useMemo(() => toApiFilters(filters), [filters]);
  const filtersKey = JSON.stringify(apiFilters);

  // Users list (server-side search / filter / sort / pagination).
  useEffect(() => {
    const id = ++listReq.current;
    setLoading(true);
    setListError("");
    (async () => {
      try {
        const data = await getAllUsers({ ...apiFilters, page, limit, sortBy, sortOrder });
        if (listReq.current !== id) return;
        const list = data?.users || (Array.isArray(data) ? data : []);
        const t = Number(data?.total) || 0;
        const tp = Number(data?.totalPages) || Math.max(Math.ceil(t / limit), 1);
        // Current page no longer exists (e.g. after a delete) → last page.
        if (t > 0 && page > tp) {
          updateState({ page: tp }, { resetPage: false });
          return;
        }
        setUsers(list);
        setTotal(t);
        setTotalPages(tp);
      } catch (err) {
        if (listReq.current !== id) return;
        setUsers([]);
        setTotal(0);
        setTotalPages(1);
        setListError(err.response?.data?.message || "Could not load users. Please try again.");
      } finally {
        if (listReq.current === id) setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, page, limit, sortBy, sortOrder, reloadKey]);

  // Stat cards — depend on filters only (not paging/sorting).
  useEffect(() => {
    const id = ++statsReq.current;
    setStatsLoading(true);
    setStatsError(false);
    (async () => {
      try {
        const data = await getUserStats(apiFilters);
        if (statsReq.current === id) setStats(data);
      } catch {
        if (statsReq.current === id) setStatsError(true);
      } finally {
        if (statsReq.current === id) setStatsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, reloadKey]);

  // Filter / export metadata — once.
  useEffect(() => {
    let alive = true;
    getUserFilterMeta()
      .then((data) => {
        if (!alive) return;
        setMeta({
          courses: data?.courses || [],
          exportColumns: data?.exportColumns || [],
          unavailableColumns: data?.unavailableColumns || [],
        });
      })
      .catch(() => {})
      .finally(() => alive && setMetaLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const reload = () => setReloadKey((k) => k + 1);

  // ── Search (debounced, server-side) ─────────────────────────────────────
  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (searchInput.trim() === filters.search.trim()) return;
    const t = setTimeout(() => {
      updateState({ filters: { search: searchInput.trim() } });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // ── Sorting / paging ────────────────────────────────────────────────────
  const handleSort = (key) => {
    if (sortBy === key) {
      updateState({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
    } else {
      // Dates default to newest first; text columns to A→Z.
      const dateCol = key === "createdAt" || key === "dateOfBirth";
      updateState({ sortBy: key, sortOrder: dateCol ? "desc" : "asc" });
    }
  };

  // ── Filters UI ──────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  const hasAnyFilter = activeCount > 0 || Boolean(filters.search);

  const clearAllFilters = () => {
    setSearchInput("");
    updateState({ filters: { ...EMPTY_FILTERS } });
  };

  const courseTitle = (id) =>
    meta.courses.find((c) => c._id === id)?.title || "Selected course";

  const chips = [
    filters.search && {
      key: "search",
      label: `Search: “${filters.search}”`,
      clear: () => {
        setSearchInput("");
        updateState({ filters: { search: "" } });
      },
    },
    filters.role !== "all" && {
      key: "role",
      label: `Role: ${roleFilterLabel(filters.role)}`,
      clear: () => updateState({ filters: { role: "all" } }),
    },
    (filters.regFrom || filters.regTo) && {
      key: "reg",
      label: `Registered ${describeRange(filters.regFrom, filters.regTo)}`,
      clear: () => updateState({ filters: { regFrom: "", regTo: "" } }),
    },
    (filters.dobFrom || filters.dobTo) && {
      key: "dob",
      label: `DOB ${describeRange(filters.dobFrom, filters.dobTo)}`,
      clear: () => updateState({ filters: { dobFrom: "", dobTo: "" } }),
    },
    filters.course && {
      key: "course",
      label: `Course: ${courseTitle(filters.course)}`,
      clear: () => updateState({ filters: { course: "" } }),
    },
  ].filter(Boolean);

  // ── Existing behaviour: create user (modal kept exactly as before; its
  //    "Add User" trigger remains hidden, as it was in the previous page) ──
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "student",
  });

  const handleCreate = async () => {
    try {
      const res = await createUser(form);

      const credentials = res.data.credentials;

      alert(
        `User Created Successfully\n\nEmail: ${credentials.email}\nPassword: ${credentials.password}`,
      );

      setShowCreate(false);

      setForm({
        name: "",
        email: "",
        mobile: "",
        role: "student",
      });

      reload();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  // ── Existing behaviour: delete user ─────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Delete user?")) return;

    try {
      await deleteUser(id);
      reload();
    } catch {
      // Same as before: a failed delete leaves the list unchanged.
    }
  };

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader
          title="Learners & Users"
          subtitle={
            loading && !users.length && !listError
              ? "Loading users…"
              : `${total.toLocaleString()} ${total === 1 ? "user" : "users"}${hasAnyFilter ? " match the current filters" : " in total"}`
          }
          actions={
            <>
              {/* <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                Add User
              </Button> */}
              <Button onClick={() => setExportOpen(true)}>
                <FileSpreadsheet size={16} />
                Export Learners
              </Button>
            </>
          }
        />

        {!focusMode && (
          <LearnerStatsCards stats={stats} loading={statsLoading} error={statsError} />
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
          <div className="relative flex-1 md:max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              ref={searchRef}
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateState({ filters: { search: searchInput.trim() } });
              }}
              placeholder="Search name, email, mobile, role, course, city…  ( / )"
              aria-label="Search users"
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition [&::-webkit-search-cancel-button]:hidden"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchInput("");
                  updateState({ filters: { search: "" } });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Select
              aria-label="Filter by role"
              value={filters.role}
              onChange={(e) => updateState({ filters: { role: e.target.value } })}
              options={ROLE_FILTER_OPTIONS}
              className="min-w-[9.5rem]"
            />

            <Button
              variant="outline"
              onClick={() => setDrawerOpen(true)}
              className="bg-white whitespace-nowrap"
              aria-haspopup="dialog"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeCount > 0 && (
                <span className="ml-0.5 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold inline-flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setFocusMode((v) => !v)}
              className="bg-white whitespace-nowrap"
              aria-pressed={focusMode}
              title={focusMode ? "Show statistics cards" : "Hide statistics and enlarge the table"}
            >
              {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="hidden lg:inline">{focusMode ? "Show stats" : "Expand table"}</span>
            </Button>
          </div>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {chips.map((c) => (
              <span
                key={c.key}
                className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium"
              >
                {c.label}
                <button
                  type="button"
                  onClick={c.clear}
                  aria-label={`Remove filter ${c.label}`}
                  className="p-0.5 rounded-full hover:bg-indigo-100"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <RotateCcw size={12} />
              Clear all
            </button>
          </div>
        )}

        {listError && (
          <div role="alert" className="flex items-center justify-between gap-3 p-3 mb-3 rounded-xl bg-red-50 text-red-700 text-sm">
            <span className="flex items-center gap-2">
              <AlertCircle size={16} />
              {listError}
            </span>
            <Button size="sm" variant="outline" className="bg-white" onClick={reload}>
              Retry
            </Button>
          </div>
        )}

        <LearnersTable
          users={users}
          loading={loading && !users.length}
          refreshing={loading && users.length > 0}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onPageChange={(p) => updateState({ page: Math.min(Math.max(p, 1), totalPages) }, { resetPage: false })}
          onLimitChange={(n) => updateState({ limit: n })}
          onRowClick={(r) => navigate(`/admin/learners/${r._id}`)}
          onDelete={handleDelete}
          hasFilters={hasAnyFilter}
          expanded={focusMode}
          emptyAction={
            <Button variant="outline" onClick={clearAllFilters}>
              <RotateCcw size={15} />
              Clear All Filters
            </Button>
          }
        />

        <LearnerFilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          filters={filters}
          courses={meta.courses}
          coursesLoading={metaLoading}
          onApply={(draft) => {
            setDrawerOpen(false);
            updateState({ filters: { ...draft, search: filters.search } });
          }}
        />

        <ExportLearnersModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          columns={meta.exportColumns}
          unavailableColumns={meta.unavailableColumns}
          metaLoading={metaLoading}
          courses={meta.courses}
        />

        <Modal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          title="Create User"
        >
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

            <Input
              label="Mobile"
              value={form.mobile}
              onChange={(e) =>
                setForm({
                  ...form,
                  mobile: e.target.value,
                })
              }
            />

            <Select
              label="Role"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value,
                })
              }
              options={[
                {
                  value: "student",
                  label: "Student",
                },
                {
                  value: "tutor",
                  label: "Tutor",
                },
              ]}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>

              <Button onClick={handleCreate}>Create User</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}