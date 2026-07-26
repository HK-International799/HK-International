import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Select, EmptyState, Button } from "../../components/ui";
import { getAllBatches } from "../../services/dispatchService";
import { PackagePlus } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "booked", label: "Booked" },
  { value: "dispatched", label: "Dispatched" },
  { value: "completed", label: "Completed" },
];

const STATUS_STYLE = {
  open: "bg-amber-50 text-amber-700",
  booked: "bg-indigo-50 text-indigo-600",
  dispatched: "bg-sky-50 text-sky-700",
  completed: "bg-emerald-50 text-emerald-600",
};

export default function DispatchBatches() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (status) params.status = status;
      const res = await getAllBatches(params);
      const data = res.data || res;
      setBatches(data.batches || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: "batchNumber", label: "Batch Number", render: (r) => <span className="font-mono text-sm font-medium text-gray-800">{r.batchNumber}</span> },
    { key: "dispatchDate", label: "Dispatch Date", render: (r) => new Date(r.dispatchDate).toLocaleDateString("en-GB") },
    { key: "courierOffice", label: "Post Office", render: (r) => r.courierOffice || "—" },
    { key: "totalCertificates", label: "Certificates", render: (r) => r.totalCertificates ?? 0 },
    { key: "tracking", label: "Tracking No.", render: (r) => <span className="font-mono text-xs">{r.speedPost?.trackingNumber || "—"}</span> },
    { key: "postedBy", label: "Posted By", render: (r) => r.postedBy?.name || "—" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[r.status] || "bg-gray-100 text-gray-600"}`}>
          {r.status}
        </span>
      ),
    },
  ];

  const totalPages = Math.ceil(total / 30);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fadeIn">
        <PageHeader
          title="Dispatch Batches"
          subtitle={`${total} batch${total === 1 ? "" : "es"} · India Post — Speed Post`}
          actions={
            <Button onClick={() => navigate("/admin/dispatch/certificates?status=pending")}>
              <PackagePlus size={15} /> Create New Batch
            </Button>
          }
        />

        <div className="flex flex-wrap gap-3 bg-white border border-gray-100 rounded-2xl p-4">
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={STATUS_OPTIONS} />
        </div>

        {loading ? (
          <EmptyState title="Loading batches..." />
        ) : (
          <DataTable
            columns={columns}
            data={batches}
            onRowClick={(r) => navigate(`/admin/dispatch/batches/${r._id}`)}
            emptyMessage="No dispatch batches found"
          />
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
