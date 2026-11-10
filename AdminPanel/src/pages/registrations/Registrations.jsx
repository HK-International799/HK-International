

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminLayout from "../../components/layout/AdminLayout";
// import {
//   PageHeader,
//   DataTable,
//   Badge,
//   Button,
//   Modal,
//   Textarea,
//   Select,
//   Input,
// } from "../../components/ui";
// import {
//   getAllRegistrations,
//   processRegistration,
//   exportRegistrationsCSV,
//   confirmRegistrationPayment,
// } from "../../services/registrationService";
// import {
//   approveRequestedCourse,
//   rejectRequestedCourse,
// } from "../../services/learnerProfileService";
// import {
//   ClipboardCheck,
//   Search,
//   CheckCircle,
//   XCircle,
//   Download,
//   Filter,
//   IndianRupee,
// } from "lucide-react";

// const statusVariant = {
//   pending: "warning",
//   approved: "success",
//   rejected: "danger",
//   completed: "primary",
//   withdrawn: "default",
// };
// const paymentVariant = {
//   unpaid: "danger",
//   partial: "warning",
//   paid: "success",
//   verified: "primary",
// };

// export default function Registrations() {
//   const navigate = useNavigate();
//   const [registrations, setRegistrations] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [paymentFilter, setPaymentFilter] = useState("");
//   const [showAction, setShowAction] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [actionType, setActionType] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [actionLoading, setActionLoading] = useState(false);

//   // ── Additive: Confirm Payment modal state ─────────────────────────────
//   const [showPayment, setShowPayment] = useState(false);
//   const [paymentForm, setPaymentForm] = useState({
//     paymentStatus: "paid",
//     amount: "",
//     paymentMode: "bank_transfer",
//     referenceNumber: "",
//     notes: "",
//   });
//   const [paymentLoading, setPaymentLoading] = useState(false);

//   useEffect(() => {
//     load();
//   }, [statusFilter, paymentFilter]);

//   const load = async () => {
//     try {
//       setLoading(true);
//       const params = {};
//       if (statusFilter) params.status = statusFilter;
//       if (paymentFilter) params.paymentStatus = paymentFilter;
//       const data = await getAllRegistrations(params);
//       const list = data.registrations || (Array.isArray(data) ? data : []);
//       setRegistrations(list);
//       setTotal(data.total || list.length);
//     } catch {
//       setRegistrations([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtered = registrations.filter((r) => {
//     if (!search) return true;
//     const q = search.toLowerCase();
//     return (
//       r.student?.name?.toLowerCase().includes(q) ||
//       r.student?.email?.toLowerCase().includes(q) ||
//       r.course?.title?.toLowerCase().includes(q) ||
//       r.partnerInstitute?.name?.toLowerCase().includes(q)
//     );
//   });

//   const openAction = (reg, type) => {
//     setSelected(reg);
//     setActionType(type);
//     setRemarks("");
//     setShowAction(true);
//   };

//   const openPayment = (reg) => {
//     setSelected(reg);
//     setPaymentForm({
//       paymentStatus: "paid",
//       amount: "",
//       paymentMode: "bank_transfer",
//       referenceNumber: "",
//       notes: "",
//     });
//     setShowPayment(true);
//   };

//   const handleAction = async () => {
//     if (!selected) return;
//     try {
//       setActionLoading(true);
//       await processRegistration(selected._id, { status: actionType, remarks });
//       setShowAction(false);
//       load();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // Registration Requirement 3 — per-course decision on a candidate's
//   // requested courses, independent of the overall registration approve/
//   // reject action above. Only relevant when a candidate selected more
//   // than one course at registration time.
//   const [courseActionId, setCourseActionId] = useState(null);
//   const handleApproveCourse = async (courseId) => {
//     if (!selected) return;
//     try {
//       setCourseActionId(courseId);
//       const updated = await approveRequestedCourse(selected._id, courseId);
//       setSelected(updated.registration || selected);
//       load();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error approving course");
//     } finally {
//       setCourseActionId(null);
//     }
//   };
//   const handleRejectCourse = async (courseId) => {
//     if (!selected) return;
//     const reason = window.prompt("Reason for rejecting this course (optional):") || "";
//     try {
//       setCourseActionId(courseId);
//       const updated = await rejectRequestedCourse(selected._id, courseId, reason);
//       setSelected(updated || selected);
//       load();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error rejecting course");
//     } finally {
//       setCourseActionId(null);
//     }
//   };

//   const handleConfirmPayment = async () => {
//     if (!selected) return;
//     try {
//       setPaymentLoading(true);
//       await confirmRegistrationPayment(selected._id, {
//         paymentStatus: paymentForm.paymentStatus,
//         notes: paymentForm.notes,
//         recordPayment: Boolean(paymentForm.amount),
//         amount: paymentForm.amount ? Number(paymentForm.amount) : undefined,
//         paymentMode: paymentForm.paymentMode,
//         referenceNumber: paymentForm.referenceNumber,
//       });
//       setShowPayment(false);
//       load();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error confirming payment");
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   const handleExport = async () => {
//     try {
//       const blob = await exportRegistrationsCSV();
//       const url = window.URL.createObjectURL(new Blob([blob]));
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "registrations.csv";
//       a.click();
//       window.URL.revokeObjectURL(url);
//     } catch {
//       alert("Export failed");
//     }
//   };

//   const columns = [
//     {
//       key: "student",
//       label: "Student",
//       render: (r) => (
//         <div className="space-y-1 min-w-[240px]">
//           <p className="font-semibold text-gray-900">
//             {r.student?.name || "—"}
//           </p>

//           <p className="text-xs text-gray-500">{r.student?.email}</p>

//           <p className="text-xs text-gray-500">{r.student?.mobile}</p>

//           <div className="mt-2 rounded bg-indigo-50 px-2 py-1">
//             <span className="text-xs font-semibold text-indigo-700">
//               Default Password
//             </span>

//             <p className="font-mono text-sm text-indigo-900">
//               {r.defaultPassword || "—"}
//             </p>
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: "course",
//       label: "Course",
//       render: (r) => (
//         <div className="space-y-1 min-w-[260px]">
//           <p className="font-medium">{r.course?.title || "—"}</p>

//           <p className="text-xs text-gray-500">
//             Intake: {r.preferredIntake || "N/A"}
//           </p>

//           <p className="text-xs text-gray-500">Source: {r.source}</p>
//         </div>
//       ),
//     },

//     {
//       key: "status",
//       label: "Status",
//       render: (r) => (
//         <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
//       ),
//     },
//     {
//       key: "payment",
//       label: "Payment",
//       render: (r) => (
//         <div className="space-y-1">
//           <Badge variant={paymentVariant[r.paymentStatus] || "default"}>
//             {r.paymentStatus}
//           </Badge>

//           {r.paymentVerifiedAt && (
//             <p className="text-xs text-gray-500">
//               {new Date(r.paymentVerifiedAt).toLocaleDateString()}
//             </p>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "lms",
//       label: "LMS Access",
//       render: (r) =>
//         r.lmsAccessGranted ? (
//           <Badge variant="success">Granted</Badge>
//         ) : (
//           <Badge variant="default">No</Badge>
//         ),
//     },
//     {
//       key: "orientation",
//       label: "Orientation",
//       render: (r) =>
//         r.orientationCompleted ? (
//           <Badge variant="success">Done</Badge>
//         ) : (
//           <Badge variant="default">Pending</Badge>
//         ),
//     },
//     {
//       key: "quiz",
//       label: "Quiz",
//       render: (r) =>
//         r.quizPassed ? (
//           <Badge variant="success">{r.quizScore}%</Badge>
//         ) : (
//           <Badge variant="default">—</Badge>
//         ),
//     },
//     {
//       key: "date",
//       label: "Registered",
//       render: (r) => (
//         <div>
//           <p>{new Date(r.createdAt).toLocaleDateString()}</p>
//           <p className="text-xs text-gray-500">
//             {new Date(r.createdAt).toLocaleTimeString()}
//           </p>
//         </div>
//       ),
//     },
//     {
//       key: "actions",
//       label: "",
//       render: (r) => (
//         <div
//           className="flex items-center gap-1"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {r.paymentStatus !== "verified" && (
//             <button
//               onClick={() => openPayment(r)}
//               className="p-1.5 rounded-lg hover:bg-indigo-50"
//               title="Confirm Payment"
//             >
//               <IndianRupee size={16} className="text-indigo-600" />
//             </button>
//           )}
//           {r.status === "pending" && (
//             <>
//               <button
//                 onClick={() => openAction(r, "approved")}
//                 className="p-1.5 rounded-lg hover:bg-emerald-50"
//                 title="Approve"
//               >
//                 <CheckCircle size={16} className="text-emerald-600" />
//               </button>
//               <button
//                 onClick={() => openAction(r, "rejected")}
//                 className="p-1.5 rounded-lg hover:bg-red-50"
//                 title="Reject"
//               >
//                 <XCircle size={16} className="text-red-500" />
//               </button>
//             </>
//           )}
//         </div>
//       ),
//     },
//   ];

//   const pendingCount = registrations.filter(
//     (r) => r.status === "pending",
//   ).length;
//   const paymentPendingCount = registrations.filter(
//     (r) =>
//       !r.paymentStatus ||
//       r.paymentStatus === "unpaid" ||
//       r.paymentStatus === "partial",
//   ).length;
//   const lmsActivatedCount = registrations.filter(
//     (r) => r.lmsAccessGranted,
//   ).length;

//   return (
//     <AdminLayout>
//       <div className="space-y-6">
//         <PageHeader
//           title="Registrations"
//           subtitle={`${total} total · ${pendingCount} pending approval · ${paymentPendingCount} payment pending`}
//           actions={
//             <Button variant="outline" onClick={handleExport}>
//               <Download size={16} /> Export CSV
//             </Button>
//           }
//         />

//         <div className="flex flex-col sm:flex-row gap-3">
//           <div className="relative flex-1 max-w-sm">
//             <Search
//               size={16}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//             />
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search student, course, institute..."
//               className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
//             />
//           </div>
//           <Select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             options={[
//               { value: "", label: "All Status" },
//               { value: "pending", label: "Pending" },
//               { value: "approved", label: "Approved" },
//               { value: "rejected", label: "Rejected" },
//               { value: "completed", label: "Completed" },
//             ]}
//           />
//           <Select
//             value={paymentFilter}
//             onChange={(e) => setPaymentFilter(e.target.value)}
//             options={[
//               { value: "", label: "All Payments" },
//               { value: "unpaid", label: "Payment Pending" },
//               { value: "partial", label: "Partially Paid" },
//               { value: "paid", label: "Paid" },
//               { value: "verified", label: "Verified" },
//             ]}
//           />
//         </div>

//         {/* Stats row */}
//         <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
//           {[
//             { label: "Total", value: total, color: "text-gray-800" },
//             { label: "Pending", value: pendingCount, color: "text-yellow-600" },
//             {
//               label: "Approved",
//               value: registrations.filter((r) => r.status === "approved")
//                 .length,
//               color: "text-emerald-600",
//             },
//             {
//               label: "Rejected",
//               value: registrations.filter((r) => r.status === "rejected")
//                 .length,
//               color: "text-red-500",
//             },
//             {
//               label: "Payment Pending",
//               value: paymentPendingCount,
//               color: "text-orange-600",
//             },
//             {
//               label: "LMS Activated",
//               value: lmsActivatedCount,
//               color: "text-indigo-600",
//             },
//           ].map((s) => (
//             <div
//               key={s.label}
//               className="bg-white border border-gray-100 rounded-xl p-4"
//             >
//               <p className="text-xs text-gray-400">{s.label}</p>
//               <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
//             </div>
//           ))}
//         </div>

//         {loading ? (
//           <div className="flex justify-center py-20">
//             <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : (
//           <DataTable
//             columns={columns}
//             data={filtered}
//             emptyMessage="No registrations found"
//             onRowClick={(r) =>
//               r.student?._id && navigate(`/admin/learners/${r.student._id}`)
//             }
//           />
//         )}

//         <Modal
//           open={showAction}
//           onClose={() => setShowAction(false)}
//           title={`${actionType === "approved" ? "Approve" : "Reject"} Registration`}
//         >
//           <div className="space-y-4">
//             {selected && (
//               <div className="bg-gray-50 rounded-xl p-4 space-y-1">
//                 <p className="text-sm">
//                   <strong>Student:</strong> {selected.student?.name} (
//                   {selected.student?.email})
//                 </p>
//                 <p className="text-sm">
//                   <strong>Course:</strong> {selected.course?.title}
//                 </p>
//                 {selected.partnerInstitute && (
//                   <p className="text-sm">
//                     <strong>Institute:</strong>{" "}
//                     {selected.partnerInstitute?.name}
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Registration Requirement 3: when the candidate requested more
//                 than one course, let the admin decide each one independently
//                 — this never overwrites the original request. */}
//             {selected?.requestedCourses?.length > 1 && (
//               <div className="border border-gray-100 rounded-xl p-4 space-y-2">
//                 <p className="text-sm font-semibold text-gray-700">
//                   Requested Courses ({selected.requestedCourses.length})
//                 </p>
//                 {selected.requestedCourses.map((rc) => {
//                   const courseId = rc.course?._id || rc.course;
//                   const courseTitle = rc.course?.title || String(courseId);
//                   const isApproved = selected.approvedCourses?.some(
//                     (ac) => String(ac.course?._id || ac.course) === String(courseId),
//                   );
//                   const isRejected = selected.rejectedCourses?.some(
//                     (rj) => String(rj.course?._id || rj.course) === String(courseId),
//                   );
//                   return (
//                     <div
//                       key={String(courseId)}
//                       className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
//                     >
//                       <span>{courseTitle}</span>
//                       {isApproved ? (
//                         <Badge variant="success">Approved</Badge>
//                       ) : isRejected ? (
//                         <Badge variant="danger">Rejected</Badge>
//                       ) : (
//                         <div className="flex gap-2">
//                           <Button
//                             size="sm"
//                             variant="success"
//                             loading={courseActionId === courseId}
//                             onClick={() => handleApproveCourse(courseId)}
//                           >
//                             Approve
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="danger"
//                             loading={courseActionId === courseId}
//                             onClick={() => handleRejectCourse(courseId)}
//                           >
//                             Reject
//                           </Button>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//             <Textarea
//               label="Remarks (optional)"
//               value={remarks}
//               onChange={(e) => setRemarks(e.target.value)}
//               placeholder="Add remarks for the student..."
//             />
//             <div className="flex justify-end gap-3 pt-2">
//               <Button variant="secondary" onClick={() => setShowAction(false)}>
//                 Cancel
//               </Button>
//               <Button
//                 variant={actionType === "approved" ? "success" : "danger"}
//                 onClick={handleAction}
//                 loading={actionLoading}
//               >
//                 {actionType === "approved"
//                   ? "Approve Registration"
//                   : "Reject Registration"}
//               </Button>
//             </div>
//           </div>
//         </Modal>

//         {/* ── Additive: Confirm Payment Modal ─────────────────────────────── */}
//         <Modal
//           open={showPayment}
//           onClose={() => setShowPayment(false)}
//           title="Confirm Payment"
//         >
//           <div className="space-y-4">
//             {selected && (
//               <div className="bg-gray-50 rounded-xl p-4 space-y-1">
//                 <p className="text-sm">
//                   <strong>Student:</strong> {selected.student?.name}
//                 </p>
//                 <p className="text-sm">
//                   <strong>Course:</strong> {selected.course?.title}
//                 </p>
//               </div>
//             )}
//             <Select
//               label="Payment Status"
//               value={paymentForm.paymentStatus}
//               onChange={(e) =>
//                 setPaymentForm((f) => ({ ...f, paymentStatus: e.target.value }))
//               }
//               options={[
//                 { value: "partial", label: "Partially Paid" },
//                 { value: "paid", label: "Fully Paid" },
//                 { value: "verified", label: "Verified" },
//               ]}
//             />
//             <Input
//               label="Amount Received (optional — records a payment entry)"
//               type="number"
//               value={paymentForm.amount}
//               onChange={(e) =>
//                 setPaymentForm((f) => ({ ...f, amount: e.target.value }))
//               }
//             />
//             <Select
//               label="Payment Mode"
//               value={paymentForm.paymentMode}
//               onChange={(e) =>
//                 setPaymentForm((f) => ({ ...f, paymentMode: e.target.value }))
//               }
//               options={[
//                 { value: "bank_transfer", label: "Bank Transfer" },
//                 { value: "upi", label: "UPI" },
//                 { value: "razorpay", label: "Razorpay" },
//                 { value: "cash", label: "Cash" },
//                 { value: "cheque", label: "Cheque" },
//                 { value: "wise", label: "Wise" },
//                 { value: "other", label: "Other" },
//               ]}
//             />
//             <Input
//               label="Reference Number"
//               value={paymentForm.referenceNumber}
//               onChange={(e) =>
//                 setPaymentForm((f) => ({
//                   ...f,
//                   referenceNumber: e.target.value,
//                 }))
//               }
//             />
//             <Textarea
//               label="Notes (optional)"
//               value={paymentForm.notes}
//               onChange={(e) =>
//                 setPaymentForm((f) => ({ ...f, notes: e.target.value }))
//               }
//             />
//             <div className="flex justify-end gap-3 pt-2">
//               <Button variant="secondary" onClick={() => setShowPayment(false)}>
//                 Cancel
//               </Button>
//               <Button
//                 variant="success"
//                 onClick={handleConfirmPayment}
//                 loading={paymentLoading}
//               >
//                 Confirm Payment
//               </Button>
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
  DataTable,
  Badge,
  Button,
  Modal,
  Textarea,
  Select,
  Input,
} from "../../components/ui";
import Pagination from "../../components/ui/Pagination";
import {
  getAllRegistrations,
  processRegistration,
  exportRegistrationsCSV,
  confirmRegistrationPayment,
} from "../../services/registrationService";
import {
  approveRequestedCourse,
  rejectRequestedCourse,
} from "../../services/learnerProfileService";
import { getUserFilterMeta } from "../../services/adminService";
import {
  OTHER_COURSE_FILTER,
  NO_COURSE_FILTER,
  getRegistrationCourseLabel,
  getRegistrationCourseType,
} from "../../utils/registrationCourse";
import {
  Search,
  CheckCircle,
  XCircle,
  Download,
  IndianRupee,
  RotateCcw,
  AlertTriangle,
  X,
} from "lucide-react";

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  completed: "primary",
  withdrawn: "default",
};
const paymentVariant = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
  verified: "primary",
};

// ── URL-backed list state (survives refresh / back / shared links) ────────
const PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;
const FILTER_KEYS = ["q", "status", "payment", "course", "from", "to", "sort"];

const readInt = (v, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const readListState = (sp) => {
  const limit = readInt(sp.get("limit"), DEFAULT_PAGE_SIZE);
  return {
    page: readInt(sp.get("page"), 1),
    limit: PAGE_SIZES.includes(limit) ? limit : DEFAULT_PAGE_SIZE,
    q: sp.get("q") || "",
    status: sp.get("status") || "",
    payment: sp.get("payment") || "",
    course: sp.get("course") || "",
    from: sp.get("from") || "",
    to: sp.get("to") || "",
    sort: sp.get("sort") === "asc" ? "asc" : "desc",
  };
};

/** List state → API params (shared by the table, stat cards and export). */
const toApiParams = (s) => {
  const params = { sortOrder: s.sort, tzOffset: new Date().getTimezoneOffset() };
  if (s.q.trim()) params.search = s.q.trim();
  if (s.status) params.status = s.status;
  if (s.payment) params.paymentStatus = s.payment;
  if (s.course) params.course = s.course;
  if (s.from) params.dateFrom = s.from;
  if (s.to) params.dateTo = s.to;
  return params;
};

const EMPTY_STATS = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  paymentPending: 0,
  lmsActivated: 0,
  others: 0,
};

export default function Registrations() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const listState = useMemo(() => readListState(searchParams), [searchParams]);

  const [registrations, setRegistrations] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searchInput, setSearchInput] = useState(listState.q);
  const [courseOptions, setCourseOptions] = useState([]);
  const [exporting, setExporting] = useState(false);

  const [showAction, setShowAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [linkCourseId, setLinkCourseId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── Additive: Confirm Payment modal state ─────────────────────────────
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: "paid",
    amount: "",
    paymentMode: "bank_transfer",
    referenceNumber: "",
    notes: "",
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  /** Merge changes into the URL. Any filter change returns to page 1. */
  const updateListState = useCallback(
    (changes) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const touchesFilter = Object.keys(changes).some(
            (k) => FILTER_KEYS.includes(k) || k === "limit",
          );
          for (const [k, v] of Object.entries(changes)) {
            if (v === "" || v === null || v === undefined) next.delete(k);
            else next.set(k, String(v));
          }
          if (touchesFilter && !("page" in changes)) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Keep the search box in sync when the URL changes (back/forward/clear).
  useEffect(() => {
    setSearchInput(listState.q);
  }, [listState.q]);

  // Debounced server-side search.
  useEffect(() => {
    if (searchInput === listState.q) return undefined;
    const t = setTimeout(() => updateListState({ q: searchInput }), 350);
    return () => clearTimeout(t);
  }, [searchInput, listState.q, updateListState]);

  // Course filter options (lightweight list: id + title only).
  useEffect(() => {
    getUserFilterMeta()
      .then((meta) =>
        setCourseOptions(
          (meta?.courses || []).filter((c) => c._id !== OTHER_COURSE_FILTER),
        ),
      )
      .catch(() => setCourseOptions([]));
  }, []);

  // Only the newest request may update the table (fast typing / paging).
  const requestSeq = useRef(0);

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setLoadError("");
    try {
      const data = await getAllRegistrations({
        ...toApiParams(listState),
        page: listState.page,
        limit: listState.limit,
      });
      if (seq !== requestSeq.current) return;
      const list = data.registrations || (Array.isArray(data) ? data : []);
      setRegistrations(list);
      setTotal(data.total ?? list.length);
      setTotalPages(data.totalPages || 1);
      setStats({ ...EMPTY_STATS, ...(data.stats || {}) });
      // The server clamps a page past the end to the real last page.
      if (data.page && data.page !== listState.page) {
        updateListState({ page: data.page === 1 ? "" : data.page });
      }
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setRegistrations([]);
      setLoadError(
        err?.response?.data?.message ||
          (err?.request && !err?.response
            ? "Network error — could not reach the server."
            : "Could not load registrations."),
      );
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [listState, updateListState]);

  useEffect(() => {
    load();
  }, [load]);

  const hasActiveFilters =
    Boolean(listState.q || listState.status || listState.payment || listState.course || listState.from || listState.to);

  const clearFilters = () => {
    setSearchInput("");
    updateListState({ q: "", status: "", payment: "", course: "", from: "", to: "" });
  };

  const openAction = (reg, type) => {
    setSelected(reg);
    setActionType(type);
    setRemarks("");
    setLinkCourseId("");
    setShowAction(true);
  };

  const openPayment = (reg) => {
    setSelected(reg);
    setPaymentForm({
      paymentStatus: "paid",
      amount: "",
      paymentMode: "bank_transfer",
      referenceNumber: "",
      notes: "",
    });
    setShowPayment(true);
  };

  const handleAction = async () => {
    if (!selected || actionLoading) return;
    try {
      setActionLoading(true);
      const payload = { status: actionType, remarks };
      if (actionType === "approved" && linkCourseId) payload.courseId = linkCourseId;
      await processRegistration(selected._id, payload);
      setShowAction(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setActionLoading(false);
    }
  };

  // Registration Requirement 3 — per-course decision on a candidate's
  // requested courses, independent of the overall registration approve/
  // reject action above. Only relevant when a candidate selected more
  // than one course at registration time.
  const [courseActionId, setCourseActionId] = useState(null);
  const handleApproveCourse = async (courseId) => {
    if (!selected) return;
    try {
      setCourseActionId(courseId);
      const updated = await approveRequestedCourse(selected._id, courseId);
      setSelected(updated.registration || selected);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error approving course");
    } finally {
      setCourseActionId(null);
    }
  };
  const handleRejectCourse = async (courseId) => {
    if (!selected) return;
    const reason = window.prompt("Reason for rejecting this course (optional):") || "";
    try {
      setCourseActionId(courseId);
      const updated = await rejectRequestedCourse(selected._id, courseId, reason);
      setSelected(updated || selected);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error rejecting course");
    } finally {
      setCourseActionId(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selected || paymentLoading) return;
    try {
      setPaymentLoading(true);
      await confirmRegistrationPayment(selected._id, {
        paymentStatus: paymentForm.paymentStatus,
        notes: paymentForm.notes,
        recordPayment: Boolean(paymentForm.amount),
        amount: paymentForm.amount ? Number(paymentForm.amount) : undefined,
        paymentMode: paymentForm.paymentMode,
        referenceNumber: paymentForm.referenceNumber,
      });
      setShowPayment(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error confirming payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Export = ALL registrations matching the current search + filters.
  const handleExport = async () => {
    if (exporting) return;
    try {
      setExporting(true);
      const blob = await exportRegistrationsCSV(toApiParams(listState));
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations${hasActiveFilters ? "-filtered" : ""}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const renderCourse = (r) => {
    const type = getRegistrationCourseType(r);
    if (type === "catalogue") {
      return (
        <div className="space-y-1">
          <p className="font-medium">{r.course.title}</p>
          {r.isOtherCourse && r.otherCourseName && (
            <p className="text-xs text-indigo-600">
              Originally requested (OTHERS): {r.otherCourseName}
            </p>
          )}
        </div>
      );
    }
    if (type === "others") {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="accent">OTHERS</Badge>
            <span className="font-medium">{r.otherCourseName}</span>
          </div>
          <p className="text-xs text-gray-500">Not in the course catalogue</p>
          {r.otherCourseDetails && (
            <p
              className="text-xs text-gray-500 line-clamp-2 max-w-[260px] whitespace-pre-line"
              title={r.otherCourseDetails}
            >
              {r.otherCourseDetails}
            </p>
          )}
        </div>
      );
    }
    return (
      <p className="text-sm italic text-gray-400" title="The linked course is missing or was deleted">
        Course unavailable
      </p>
    );
  };

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (r) => (
        <div className="space-y-1 min-w-[240px]">
          <p className="font-semibold text-gray-900">
            {r.student?.name || (r.student ? "—" : "Learner account removed")}
          </p>

          <p className="text-xs text-gray-500">{r.student?.email}</p>

          <p className="text-xs text-gray-500">{r.student?.mobile}</p>

          <div className="mt-2 rounded bg-indigo-50 px-2 py-1">
            <span className="text-xs font-semibold text-indigo-700">
              Default Password
            </span>

            <p className="font-mono text-sm text-indigo-900">
              {r.defaultPassword || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      render: (r) => (
        <div className="space-y-1 min-w-[260px]">
          {renderCourse(r)}

          <p className="text-xs text-gray-500">
            Intake: {r.preferredIntake || "N/A"}
          </p>

          <p className="text-xs text-gray-500">Source: {r.source || "—"}</p>
        </div>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
      ),
    },
    {
      key: "payment",
      label: "Payment",
      render: (r) => (
        <div className="space-y-1">
          <Badge variant={paymentVariant[r.paymentStatus] || "default"}>
            {r.paymentStatus || "unpaid"}
          </Badge>

          {r.paymentVerifiedAt && (
            <p className="text-xs text-gray-500">
              {new Date(r.paymentVerifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "lms",
      label: "LMS Access",
      render: (r) =>
        r.lmsAccessGranted ? (
          <Badge variant="success">Granted</Badge>
        ) : (
          <Badge variant="default">No</Badge>
        ),
    },
    {
      key: "orientation",
      label: "Orientation",
      render: (r) =>
        r.orientationCompleted ? (
          <Badge variant="success">Done</Badge>
        ) : (
          <Badge variant="default">Pending</Badge>
        ),
    },
    {
      key: "quiz",
      label: "Quiz",
      render: (r) =>
        r.quizPassed ? (
          <Badge variant="success">{r.quizScore}%</Badge>
        ) : (
          <Badge variant="default">—</Badge>
        ),
    },
    {
      key: "date",
      label: "Registered",
      render: (r) =>
        r.createdAt ? (
          <div>
            <p>{new Date(r.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">
              {new Date(r.createdAt).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {r.paymentStatus !== "verified" && (
            <button
              onClick={() => openPayment(r)}
              className="p-1.5 rounded-lg hover:bg-indigo-50"
              title="Confirm Payment"
            >
              <IndianRupee size={16} className="text-indigo-600" />
            </button>
          )}
          {r.status === "pending" && (
            <>
              <button
                onClick={() => openAction(r, "approved")}
                className="p-1.5 rounded-lg hover:bg-emerald-50"
                title="Approve"
              >
                <CheckCircle size={16} className="text-emerald-600" />
              </button>
              <button
                onClick={() => openAction(r, "rejected")}
                className="p-1.5 rounded-lg hover:bg-red-50"
                title="Reject"
              >
                <XCircle size={16} className="text-red-500" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const selectedHasNoCourse = selected && getRegistrationCourseType(selected) !== "catalogue";
  const dateRangeInvalid = listState.from && listState.to && listState.from > listState.to;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Registrations"
          subtitle={`${stats.total.toLocaleString()} ${hasActiveFilters ? "matching" : "total"} · ${stats.pending} pending approval · ${stats.paymentPending} payment pending`}
          actions={
            <Button
              variant="outline"
              onClick={handleExport}
              loading={exporting}
              disabled={exporting || total === 0}
              title="Exports every registration matching the current search and filters — not just this page"
            >
              <Download size={16} />
              {hasActiveFilters
                ? `Export ${total.toLocaleString()} filtered (CSV)`
                : `Export all ${total.toLocaleString()} (CSV)`}
            </Button>
          }
        />

        <div className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 lg:max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, email, mobile, course, institute, ID…"
                maxLength={100}
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
              <Select
                value={listState.status}
                onChange={(e) => updateListState({ status: e.target.value })}
                aria-label="Status filter"
                options={[
                  { value: "", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                  { value: "completed", label: "Completed" },
                  { value: "withdrawn", label: "Withdrawn" },
                ]}
              />
              <Select
                value={listState.payment}
                onChange={(e) => updateListState({ payment: e.target.value })}
                aria-label="Payment filter"
                options={[
                  { value: "", label: "All Payments" },
                  { value: "unpaid", label: "Payment Pending" },
                  { value: "partial", label: "Partially Paid" },
                  { value: "paid", label: "Paid" },
                  { value: "verified", label: "Verified" },
                ]}
              />
              <Select
                value={listState.course}
                onChange={(e) => updateListState({ course: e.target.value })}
                aria-label="Course filter"
                options={[
                  { value: "", label: "All Courses" },
                  { value: OTHER_COURSE_FILTER, label: "OTHERS (not in catalogue)" },
                  { value: NO_COURSE_FILTER, label: "Course missing / deleted" },
                  ...courseOptions.map((c) => ({ value: c._id, label: c.title })),
                ]}
              />
              <Select
                value={listState.sort}
                onChange={(e) => updateListState({ sort: e.target.value === "asc" ? "asc" : "" })}
                aria-label="Sort order"
                options={[
                  { value: "desc", label: "Newest first" },
                  { value: "asc", label: "Oldest first" },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <label className="flex flex-col text-xs text-gray-500 gap-1">
              Registered from
              <input
                type="date"
                value={listState.from}
                max={listState.to || undefined}
                onChange={(e) => updateListState({ from: e.target.value })}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            <label className="flex flex-col text-xs text-gray-500 gap-1">
              Registered to
              <input
                type="date"
                value={listState.to}
                min={listState.from || undefined}
                onChange={(e) => updateListState({ to: e.target.value })}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="sm:mb-0.5">
                <RotateCcw size={15} /> Clear filters
              </Button>
            )}
            {dateRangeInvalid && (
              <p className="text-xs text-orange-600 sm:mb-2.5">
                “From” is after “To” — the range has been treated as reversed.
              </p>
            )}
          </div>
        </div>

        {/* Stats row — computed on the server for ALL matching records */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {[
            { label: hasActiveFilters ? "Matching" : "Total", value: stats.total, color: "text-gray-800" },
            { label: "Pending", value: stats.pending, color: "text-yellow-600" },
            { label: "Approved", value: stats.approved, color: "text-emerald-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-500" },
            { label: "Payment Pending", value: stats.paymentPending, color: "text-orange-600" },
            { label: "LMS Activated", value: stats.lmsActivated, color: "text-indigo-600" },
            { label: "OTHERS Course", value: stats.others, color: "text-orange-500", filter: OTHER_COURSE_FILTER },
          ].map((s) => (
            <button
              type="button"
              key={s.label}
              disabled={!s.filter}
              onClick={() => s.filter && updateListState({ course: s.filter })}
              className={`text-left bg-white border border-gray-100 rounded-xl p-4 ${
                s.filter ? "hover:border-orange-200 cursor-pointer" : "cursor-default"
              }`}
              title={s.filter ? "Show only OTHERS registrations" : undefined}
            >
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
            </button>
          ))}
        </div>

        {loadError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="flex items-center gap-2">
              <AlertTriangle size={16} /> {loadError}
            </span>
            <Button size="sm" variant="danger" onClick={load}>
              Retry
            </Button>
          </div>
        )}

        {loading && registrations.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity ${loading ? "opacity-60 pointer-events-none" : ""}`}>
            <DataTable
              columns={columns}
              data={registrations}
              emptyMessage={
                loadError
                  ? "Registrations could not be loaded"
                  : hasActiveFilters
                    ? "No registrations match the current search / filters"
                    : "No registrations found"
              }
              onRowClick={(r) =>
                r.student?._id && navigate(`/admin/learners/${r.student._id}`)
              }
            />
            {total > 0 && (
              <Pagination
                page={listState.page}
                pageSize={listState.limit}
                total={total}
                totalPages={totalPages}
                itemLabel="registrations"
                pageSizeOptions={PAGE_SIZES}
                disabled={loading}
                onPageChange={(p) => updateListState({ page: p === 1 ? "" : p })}
                onPageSizeChange={(n) => updateListState({ limit: n === DEFAULT_PAGE_SIZE ? "" : n })}
              />
            )}
          </div>
        )}

        <Modal
          open={showAction}
          onClose={() => setShowAction(false)}
          title={`${actionType === "approved" ? "Approve" : "Reject"} Registration`}
        >
          <div className="space-y-4">
            {selected && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm">
                  <strong>Student:</strong> {selected.student?.name} (
                  {selected.student?.email})
                </p>
                <p className="text-sm">
                  <strong>Course:</strong> {getRegistrationCourseLabel(selected)}
                </p>
                {selected.isOtherCourse && selected.otherCourseDetails && (
                  <p className="text-sm whitespace-pre-line">
                    <strong>Course Details:</strong> {selected.otherCourseDetails}
                  </p>
                )}
                {selected.partnerInstitute && (
                  <p className="text-sm">
                    <strong>Institute:</strong>{" "}
                    {selected.partnerInstitute?.name}
                  </p>
                )}
              </div>
            )}

            {/* OTHERS / missing course: optionally link a catalogue course on
                approval. The learner's original OTHERS request is kept. */}
            {actionType === "approved" && selectedHasNoCourse && (
              <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4 space-y-2">
                <p className="text-sm text-gray-700">
                  {selected?.isOtherCourse
                    ? "This learner chose OTHERS — their course is not in the catalogue."
                    : "The course on this registration is missing or was deleted."}{" "}
                  Approving without a catalogue course does not enroll the
                  learner in any course.
                </p>
                <Select
                  label="Link to a catalogue course (optional)"
                  value={linkCourseId}
                  onChange={(e) => setLinkCourseId(e.target.value)}
                  options={[
                    { value: "", label: "Don't link — approve as is" },
                    ...courseOptions.map((c) => ({ value: c._id, label: c.title })),
                  ]}
                />
              </div>
            )}

            {/* Registration Requirement 3: when the candidate requested more
                than one course, let the admin decide each one independently
                — this never overwrites the original request. */}
            {selected?.requestedCourses?.length > 1 && (
              <div className="border border-gray-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  Requested Courses ({selected.requestedCourses.length})
                </p>
                {selected.requestedCourses.map((rc) => {
                  const courseId = rc.course?._id || rc.course;
                  const courseTitle = rc.course?.title || "Course unavailable";
                  const isApproved = selected.approvedCourses?.some(
                    (ac) => String(ac.course?._id || ac.course) === String(courseId),
                  );
                  const isRejected = selected.rejectedCourses?.some(
                    (rj) => String(rj.course?._id || rj.course) === String(courseId),
                  );
                  return (
                    <div
                      key={String(courseId)}
                      className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <span>{courseTitle}</span>
                      {isApproved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : isRejected ? (
                        <Badge variant="danger">Rejected</Badge>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            loading={courseActionId === courseId}
                            onClick={() => handleApproveCourse(courseId)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={courseActionId === courseId}
                            onClick={() => handleRejectCourse(courseId)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <Textarea
              label="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks for the student..."
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowAction(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === "approved" ? "success" : "danger"}
                onClick={handleAction}
                loading={actionLoading}
              >
                {actionType === "approved"
                  ? "Approve Registration"
                  : "Reject Registration"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* ── Additive: Confirm Payment Modal ─────────────────────────────── */}
        <Modal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          title="Confirm Payment"
        >
          <div className="space-y-4">
            {selected && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm">
                  <strong>Student:</strong> {selected.student?.name}
                </p>
                <p className="text-sm">
                  <strong>Course:</strong> {getRegistrationCourseLabel(selected)}
                </p>
              </div>
            )}
            {selectedHasNoCourse && (
              <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                This registration is not linked to a catalogue course, so only
                the payment status can be confirmed. A payment entry (amount)
                can be recorded once a catalogue course is linked.
              </p>
            )}
            <Select
              label="Payment Status"
              value={paymentForm.paymentStatus}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, paymentStatus: e.target.value }))
              }
              options={[
                { value: "partial", label: "Partially Paid" },
                { value: "paid", label: "Fully Paid" },
                { value: "verified", label: "Verified" },
              ]}
            />
            <Input
              label="Amount Received (optional — records a payment entry)"
              type="number"
              value={paymentForm.amount}
              disabled={selectedHasNoCourse}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, amount: e.target.value }))
              }
            />
            <Select
              label="Payment Mode"
              value={paymentForm.paymentMode}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, paymentMode: e.target.value }))
              }
              options={[
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "upi", label: "UPI" },
                { value: "razorpay", label: "Razorpay" },
                { value: "cash", label: "Cash" },
                { value: "cheque", label: "Cheque" },
                { value: "wise", label: "Wise" },
                { value: "other", label: "Other" },
              ]}
            />
            <Input
              label="Reference Number"
              value={paymentForm.referenceNumber}
              onChange={(e) =>
                setPaymentForm((f) => ({
                  ...f,
                  referenceNumber: e.target.value,
                }))
              }
            />
            <Textarea
              label="Notes (optional)"
              value={paymentForm.notes}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowPayment(false)}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleConfirmPayment}
                loading={paymentLoading}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
