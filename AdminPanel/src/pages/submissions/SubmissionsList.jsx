// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import AdminLayout from "../../components/layout/AdminLayout";
// import {
//   PageHeader,
//   DataTable,
//   Badge,
//   Button,
//   EmptyState,
// } from "../../components/ui";
// import {
//   getSubmissions,
//   getAssignmentById,
// } from "../../services/assignmentService";
// import {
//   ArrowLeft,
//   Eye,
//   Filter,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   ChevronLeft,
//   ChevronRight,
//   FileText,
// } from "lucide-react";

// // FIX: Blob-forced download to preserve original filename (no Cloudinary hash names)
// const triggerDownload = async (url, filename) => {
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     const objectUrl = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = objectUrl;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(objectUrl);
//   } catch (err) {
//     console.error("Download failed:", err);
//     window.open(url, "_blank");
//   }
// };

// const STATUS_TABS = [
//   { key: "", label: "All" },
//   { key: "submitted", label: "Pending Review" },
//   { key: "graded", label: "Graded" },
// ];

// export default function SubmissionsList() {
//   const { assignmentId } = useParams(); // optional — if routed from assignment
//   const navigate = useNavigate();

//   const [submissions, setSubmissions] = useState([]);
//   const [assignment, setAssignment] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const LIMIT = 15;

//   useEffect(() => {
//     load();
//   }, [page, statusFilter, assignmentId]);

//   useEffect(() => {
//     if (assignmentId) {
//       getAssignmentById(assignmentId)
//         .then((res) => setAssignment(res.data || res))
//         .catch(() => {});
//     }
//   }, [assignmentId]);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const params = { page, limit: LIMIT };
//       if (assignmentId) params.assignmentId = assignmentId;
//       if (statusFilter) params.status = statusFilter;

//       const res = await getSubmissions(params);
//       const d = res.data || res;
//       setSubmissions(Array.isArray(d.submissions) ? d.submissions : []);
//       setTotal(d.total ?? 0);
//       setTotalPages(d.totalPages ?? 1);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (s) => {
//     if (s === "graded") return <Badge variant="success">Graded</Badge>;
//     if (s === "submitted") return <Badge variant="primary">Submitted</Badge>;
//     return <Badge variant="warning">Not Submitted</Badge>;
//   };

//   const columns = [
//     {
//       key: "student",
//       label: "Student",
//       render: (r) => (
//         <div>
//           <p className="font-medium text-gray-800">
//             {r.studentId?.name || "—"}
//           </p>
//           <p className="text-xs text-gray-400">{r.studentId?.email}</p>
//         </div>
//       ),
//     },
//     {
//       key: "assignment",
//       label: "Assignment",
//       render: (r) => (
//         <div>
//           <p className="text-sm text-gray-700">
//             {r.assignmentId?.title || "—"}
//           </p>
//           {r.isLate && (
//             <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
//               <AlertCircle size={10} /> Late submission
//             </span>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: "submittedAt",
//       label: "Submitted",
//       render: (r) =>
//         r.createdAt
//           ? new Date(r.createdAt).toLocaleDateString("en-GB", {
//               day: "2-digit",
//               month: "short",
//               year: "numeric",
//               hour: "2-digit",
//               minute: "2-digit",
//             })
//           : "—",
//     },
//     {
//       key: "score",
//       label: "Score",
//       render: (r) =>
//         r.totalScore != null ? (
//           <span className="font-semibold text-emerald-700">
//             {r.totalScore}
//             <span className="text-gray-400 font-normal">
//               /{r.assignmentId?.totalMarks ?? "—"}
//             </span>
//           </span>
//         ) : (
//           <span className="text-gray-400">—</span>
//         ),
//     },
//     {
//       key: "hasFile",
//       label: "File",
//       render: (r) =>
//         r.submissionFile?.url ? (
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               triggerDownload(
//                 r.submissionFile.url,
//                 r.submissionFile.originalName || "submission.pdf",
//               );
//             }}
//             className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
//             title={r.submissionFile.originalName || "submission.pdf"}
//           >
//             <FileText size={12} />
//             {r.submissionFile.originalName?.slice(0, 20) || "File"}
//           </button>
//         ) : (
//           <span className="text-gray-300 text-xs">—</span>
//         ),
//     },
//     {
//       key: "status",
//       label: "Status",
//       render: (r) => getStatusBadge(r.status),
//     },
//     {
//       key: "actions",
//       label: "",
//       render: (r) => (
//         <Button
//           variant="secondary"
//           onClick={(e) => {
//             e.stopPropagation();
//             navigate(`/admin/submissions/${r._id}/review`);
//           }}
//         >
//           <Eye size={14} />
//           {r.status === "graded" ? "View" : "Review"}
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <AdminLayout>
//       <div className="animate-fadeIn">
//         <PageHeader
//           title={
//             assignment ? `Submissions — ${assignment.title}` : "All Submissions"
//           }
//           subtitle={`${total} total submissions`}
//           actions={
//             assignmentId ? (
//               <Button variant="secondary" onClick={() => navigate(-1)}>
//                 <ArrowLeft size={15} /> Back
//               </Button>
//             ) : null
//           }
//         />

//         {/* Status filter tabs */}
//         <div className="flex gap-2 mb-5">
//           {STATUS_TABS.map((t) => (
//             <button
//               key={t.key}
//               onClick={() => {
//                 setStatusFilter(t.key);
//                 setPage(1);
//               }}
//               className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
//                 statusFilter === t.key
//                   ? "bg-indigo-600 text-white"
//                   : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
//               }`}
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <EmptyState title="Loading submissions..." />
//         ) : (
//           <>
//             <DataTable
//               columns={columns}
//               data={submissions}
//               emptyMessage="No submissions found"
//             />

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex items-center justify-between mt-5">
//                 <p className="text-sm text-gray-500">
//                   Page {page} of {totalPages} ({total} total)
//                 </p>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="secondary"
//                     onClick={() => setPage((p) => Math.max(1, p - 1))}
//                     disabled={page === 1}
//                   >
//                     <ChevronLeft size={15} />
//                   </Button>
//                   <Button
//                     variant="secondary"
//                     onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                     disabled={page === totalPages}
//                   >
//                     <ChevronRight size={15} />
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }






import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  EmptyState,
} from "../../components/ui";
import {
  getSubmissions,
  getAssignmentById,
} from "../../services/assignmentService";
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

// Blob-forced download — preserves original filename (avoids Cloudinary hash)
const triggerDownload = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error("Download failed:", err);
    window.open(url, "_blank");
  }
};

const STATUS_TABS = [
  { key: "", label: "All", icon: Users },
  { key: "submitted", label: "Pending Review", icon: Clock },
  { key: "graded", label: "Graded", icon: CheckCircle },
];

export default function SubmissionsList() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    load();
  }, [page, statusFilter, assignmentId]);

  useEffect(() => {
    if (assignmentId) {
      // FIX: getAssignmentById returns res.data.data — already the raw object
      getAssignmentById(assignmentId)
        .then((res) => setAssignment(res?.data || res))
        .catch(() => {});
    }
  }, [assignmentId]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (assignmentId) params.assignmentId = assignmentId;
      if (statusFilter) params.status = statusFilter;

      // FIX: getSubmissions returns res.data.data — the payload object directly.
      // Do NOT try to unwrap .data again — it will be undefined.
      const d = await getSubmissions(params);
      setSubmissions(Array.isArray(d?.submissions) ? d.submissions : []);
      setTotal(d?.total ?? 0);
      setTotalPages(d?.totalPages ?? 1);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (s) => {
    if (s === "graded") return <Badge variant="success">Graded</Badge>;
    if (s === "submitted") return <Badge variant="primary">Submitted</Badge>;
    return <Badge variant="warning">Not Submitted</Badge>;
  };

  // Stats for the header summary row
  const gradedCount = submissions.filter((s) => s.status === "graded").length;
  const pendingCount = submissions.filter((s) => s.status === "submitted").length;
  const avgScore = (() => {
    const scored = submissions.filter((s) => s.totalScore != null);
    if (!scored.length) return null;
    return (scored.reduce((acc, s) => acc + s.totalScore, 0) / scored.length).toFixed(1);
  })();

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-800">{r.studentId?.name || "—"}</p>
          <p className="text-xs text-gray-400">{r.studentId?.email}</p>
        </div>
      ),
    },
    {
      key: "assignment",
      label: "Assignment",
      render: (r) => (
        <div>
          <p className="text-sm text-gray-700">{r.assignmentId?.title || "—"}</p>
          {r.isLate && (
            <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
              <AlertCircle size={10} /> Late submission
            </span>
          )}
        </div>
      ),
    },
    {
      key: "submittedAt",
      label: "Submitted",
      render: (r) =>
        r.createdAt
          ? new Date(r.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
    },
    {
      key: "score",
      label: "Score",
      render: (r) =>
        r.totalScore != null ? (
          <div>
            <span className="font-semibold text-emerald-700">
              {r.totalScore}
              <span className="text-gray-400 font-normal">
                /{r.assignmentId?.totalMarks ?? "—"}
              </span>
            </span>
            {r.assignmentId?.totalMarks && (
              <div className="mt-1 h-1 bg-gray-100 rounded-full w-16 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{
                    width: `${Math.min(100, (r.totalScore / r.assignmentId.totalMarks) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "hasFile",
      label: "File",
      render: (r) =>
        r.submissionFile?.url ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerDownload(
                r.submissionFile.url,
                r.submissionFile.originalName || "submission.pdf",
              );
            }}
            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
            title={r.submissionFile.originalName || "submission.pdf"}
          >
            <FileText size={12} />
            {r.submissionFile.originalName?.slice(0, 20) || "File"}
          </button>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => getStatusBadge(r.status),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/submissions/${r._id}/review`);
          }}
        >
          <Eye size={14} />
          {r.status === "graded" ? "View" : "Review"}
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader
          title={assignment ? `Submissions — ${assignment.title}` : "All Submissions"}
          subtitle={`${total} total submission${total !== 1 ? "s" : ""}`}
          actions={
            assignmentId ? (
              <Button variant="secondary" onClick={() => navigate(-1)}>
                <ArrowLeft size={15} /> Back
              </Button>
            ) : null
          }
        />

        {/* Quick stats */}
        {submissions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              {
                label: "Pending",
                value: pendingCount,
                icon: Clock,
                color: "text-orange-500",
                bg: "bg-orange-50",
              },
              {
                label: "Graded",
                value: gradedCount,
                icon: CheckCircle,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
              },
              {
                label: "Avg Score",
                value: avgScore !== null ? avgScore : "—",
                icon: TrendingUp,
                color: "text-indigo-500",
                bg: "bg-indigo-50",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-5">
          {STATUS_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setStatusFilter(t.key);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === t.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <EmptyState title="Loading submissions…" />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={submissions}
              emptyMessage="No submissions found"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={15} />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={15} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
