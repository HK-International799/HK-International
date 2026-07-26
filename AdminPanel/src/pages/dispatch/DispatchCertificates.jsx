import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader, Button, Input, Select, Modal, EmptyState, Badge,
} from "../../components/ui";
import {
  listDispatchCertificates, createBatch, getAllBatches,
  addCertificatesToBatch, updateCertificateStatus,
} from "../../services/dispatchService";
import { getCourses } from "../../services/courseService";
import {
  Search as SearchIcon, PackagePlus, Send, CheckCircle2, RotateCcw,
  Truck, XCircle,
} from "lucide-react";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "packed", label: "Packed" },
  { value: "dispatched", label: "Dispatched" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
  { value: "postponed", label: "Postponed" },
  { value: "lost", label: "Lost" },
];

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700",
  packed: "bg-indigo-50 text-indigo-600",
  dispatched: "bg-sky-50 text-sky-700",
  in_transit: "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-600",
  returned: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-50 text-red-600",
  postponed: "bg-gray-100 text-gray-600",
  lost: "bg-red-100 text-red-700",
  redispatched: "bg-purple-50 text-purple-700",
};

const ACTIONABLE_STATUS_OPTIONS = [
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
  { value: "postponed", label: "Postponed" },
  { value: "lost", label: "Lost" },
  { value: "redispatched", label: "Re-dispatched" },
];

export default function DispatchCertificates() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState([]);

  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    course: "", state: "", country: "", search: "",
  });

  const [batchModal, setBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({ dispatchDate: new Date().toISOString().slice(0, 10), courierOffice: "", remarks: "" });

  const [addToBatchModal, setAddToBatchModal] = useState(false);
  const [openBatches, setOpenBatches] = useState([]);
  const [chosenBatch, setChosenBatch] = useState("");

  const [statusModal, setStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: "delivered", remarks: "", deliveredDate: "" });

  useEffect(() => {
    getCourses().then((r) => setCourses(r.data || r || [])).catch(() => setCourses([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await listDispatchCertificates(params);
      const data = res.data || res;
      setRows(data.certificates || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const handleFilter = (key, val) => {
    setPage(1);
    setSelected([]);
    setFilters((f) => ({ ...f, [key]: val }));
    if (key === "status") setSearchParams(val ? { status: val } : {});
  };

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleSelectAll = () => {
    const eligible = rows.filter((r) => r.dispatchStatus === filters.status || !filters.status).map((r) => r._id);
    setSelected(selected.length === eligible.length ? [] : eligible);
  };

  const selectedCerts = useMemo(() => rows.filter((r) => selected.includes(r._id)), [rows, selected]);
  const allSelectedPending = selectedCerts.length > 0 && selectedCerts.every((c) => c.dispatchStatus === "pending");
  const allSelectedActionable = selectedCerts.length > 0 && selectedCerts.every((c) =>
    ["dispatched", "in_transit"].includes(c.dispatchStatus)
  );

  const courseOptions = [{ value: "", label: "All Courses" }, ...courses.map((c) => ({ value: c._id, label: c.title }))];

  const handleCreateBatch = async () => {
    try {
      await createBatch({ ...batchForm, certificateIds: selected });
      setBatchModal(false);
      setSelected([]);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create batch");
    }
  };

  const openAddToBatch = async () => {
    try {
      const res = await getAllBatches({ status: "open", limit: 100 });
      setOpenBatches((res.data?.batches) || res.batches || []);
      setAddToBatchModal(true);
    } catch {
      alert("Could not load open batches");
    }
  };

  const handleAddToBatch = async () => {
    if (!chosenBatch) return;
    try {
      await addCertificatesToBatch(chosenBatch, selected);
      setAddToBatchModal(false);
      setChosenBatch("");
      setSelected([]);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add certificates to batch");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await updateCertificateStatus({
        certificateIds: selected,
        status: statusForm.status,
        remarks: statusForm.remarks,
        deliveredDate: statusForm.deliveredDate || undefined,
      });
      setStatusModal(false);
      setSelected([]);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const totalPages = Math.ceil(total / 30);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fadeIn">
        <PageHeader
          title="Certificate Dispatch"
          subtitle={`${total} certificate${total === 1 ? "" : "s"}`}
          actions={
            <div className="flex gap-2 flex-wrap">
              {selected.length > 0 && allSelectedPending && (
                <>
                  <Button onClick={() => setBatchModal(true)}>
                    <PackagePlus size={15} /> Create Batch ({selected.length})
                  </Button>
                  <Button variant="secondary" onClick={openAddToBatch}>
                    <Truck size={15} /> Add to Batch
                  </Button>
                </>
              )}
              {selected.length > 0 && allSelectedActionable && (
                <Button variant="accent" onClick={() => setStatusModal(true)}>
                  <CheckCircle2 size={15} /> Update Status ({selected.length})
                </Button>
              )}
            </div>
          }
        />

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => handleFilter("status", t.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                filters.status === t.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white border border-gray-100 rounded-2xl p-4">
          <Input
            placeholder="Search candidate, cert no., tracking no..."
            value={filters.search}
            onChange={(e) => handleFilter("search", e.target.value)}
            className="w-72"
          />
          <Select value={filters.course} onChange={(e) => handleFilter("course", e.target.value)} options={courseOptions} />
          <Input placeholder="State" value={filters.state} onChange={(e) => handleFilter("state", e.target.value)} className="w-36" />
          <Input placeholder="Country" value={filters.country} onChange={(e) => handleFilter("country", e.target.value)} className="w-36" />
          {(filters.search || filters.course || filters.state || filters.country) && (
            <button
              onClick={() => { setFilters({ status: filters.status, course: "", state: "", country: "", search: "" }); setPage(1); }}
              className="text-xs text-red-500 hover:text-red-700 px-2"
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <EmptyState title="Loading certificates..." />
        ) : rows.length === 0 ? (
          <EmptyState title="No certificates found" subtitle="Try a different filter or search term." />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.length > 0 && selected.length === rows.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Certificate</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Candidate</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Course</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Batch</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tracking</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Dispatch Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-indigo-50/40 transition cursor-pointer"
                      onClick={() => navigate(`/admin/dispatch/certificates/${c._id}`)}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggleSelect(c._id)} />
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono text-gray-700">{c.certificateNumber}</td>
                      <td className="px-5 py-3.5 text-sm">
                        <p className="font-medium text-gray-800">{c.receiver?.candidateName || "—"}</p>
                        <p className="text-xs text-gray-400">{c.receiver?.mobile || c.receiver?.email || ""}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{c.courseId?.title || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[c.dispatchStatus] || "bg-gray-100 text-gray-600"}`}>
                          {c.dispatchStatus?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{c.dispatchBatch?.batchNumber || "—"}</td>
                      <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{c.trackingNumber || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {c.dispatchDate ? new Date(c.dispatchDate).toLocaleDateString("en-GB") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      <Modal open={batchModal} onClose={() => setBatchModal(false)} title={`Create Dispatch Batch (${selected.length} certificates)`}>
        <div className="space-y-4">
          <Input type="date" label="Dispatch Date" value={batchForm.dispatchDate} onChange={(e) => setBatchForm((f) => ({ ...f, dispatchDate: e.target.value }))} />
          <Input label="Courier / Post Office" placeholder="e.g. Kakarmatta Post Office" value={batchForm.courierOffice} onChange={(e) => setBatchForm((f) => ({ ...f, courierOffice: e.target.value }))} />
          <Input label="Remarks" value={batchForm.remarks} onChange={(e) => setBatchForm((f) => ({ ...f, remarks: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setBatchModal(false)}>Cancel</Button>
            <Button onClick={handleCreateBatch}><Send size={15} /> Create Batch</Button>
          </div>
        </div>
      </Modal>

      {/* Add to Existing Batch Modal */}
      <Modal open={addToBatchModal} onClose={() => setAddToBatchModal(false)} title={`Add ${selected.length} Certificate(s) to Batch`}>
        <div className="space-y-4">
          {openBatches.length === 0 ? (
            <EmptyState title="No open batches" subtitle="Create a new batch instead." />
          ) : (
            <Select
              label="Select Open Batch"
              value={chosenBatch}
              onChange={(e) => setChosenBatch(e.target.value)}
              options={[{ value: "", label: "Choose a batch..." }, ...openBatches.map((b) => ({ value: b._id, label: `${b.batchNumber} (${b.totalCertificates || 0} certs)` }))]}
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddToBatchModal(false)}>Cancel</Button>
            <Button disabled={!chosenBatch} onClick={handleAddToBatch}>Add to Batch</Button>
          </div>
        </div>
      </Modal>

      {/* Update Delivery Status Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title={`Update Status (${selected.length} certificates)`}>
        <div className="space-y-4">
          <Select
            label="New Status"
            value={statusForm.status}
            onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
            options={ACTIONABLE_STATUS_OPTIONS}
          />
          {statusForm.status === "delivered" && (
            <Input type="date" label="Delivered Date" value={statusForm.deliveredDate} onChange={(e) => setStatusForm((f) => ({ ...f, deliveredDate: e.target.value }))} />
          )}
          <Input label="Remarks" value={statusForm.remarks} onChange={(e) => setStatusForm((f) => ({ ...f, remarks: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStatusModal(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Update</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
