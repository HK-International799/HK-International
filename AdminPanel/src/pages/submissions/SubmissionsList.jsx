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
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "submitted", label: "Pending Review" },
  { key: "graded", label: "Graded" },
];

export default function SubmissionsList() {
  const { assignmentId } = useParams(); // optional — if routed from assignment
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
      getAssignmentById(assignmentId)
        .then((res) => setAssignment(res.data || res))
        .catch(() => {});
    }
  }, [assignmentId]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (assignmentId) params.assignmentId = assignmentId;
      if (statusFilter) params.status = statusFilter;

      const res = await getSubmissions(params);
      const d = res.data || res;
      setSubmissions(Array.isArray(d.submissions) ? d.submissions : []);
      setTotal(d.total ?? 0);
      setTotalPages(d.totalPages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (s) => {
    if (s === "graded") return <Badge variant="success">Graded</Badge>;
    if (s === "submitted") return <Badge variant="primary">Submitted</Badge>;
    return <Badge variant="warning">Not Submitted</Badge>;
  };

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-800">
            {r.studentId?.name || "—"}
          </p>
          <p className="text-xs text-gray-400">{r.studentId?.email}</p>
        </div>
      ),
    },
    {
      key: "assignment",
      label: "Assignment",
      render: (r) => (
        <div>
          <p className="text-sm text-gray-700">
            {r.assignmentId?.title || "—"}
          </p>
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
          <span className="font-semibold text-emerald-700">
            {r.totalScore}
            <span className="text-gray-400 font-normal">
              /{r.assignmentId?.totalMarks ?? "—"}
            </span>
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "hasFile",
      label: "File",
      render: (r) =>
        r.submissionFile?.url ? (
          <a
            href={r.submissionFile.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
          >
            <FileText size={12} />
            {r.submissionFile.originalName?.slice(0, 20) || "File"}
          </a>
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
          title={
            assignment
              ? `Submissions — ${assignment.title}`
              : "All Submissions"
          }
          subtitle={`${total} total submissions`}
          actions={
            assignmentId ? (
              <Button variant="secondary" onClick={() => navigate(-1)}>
                <ArrowLeft size={15} /> Back
              </Button>
            ) : null
          }
        />

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-5">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setStatusFilter(t.key); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === t.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <EmptyState title="Loading submissions..." />
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
