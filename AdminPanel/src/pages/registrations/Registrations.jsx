import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Textarea, Select } from "../../components/ui";
import { getAllRegistrations, processRegistration, exportRegistrationsCSV } from "../../services/registrationService";
import { ClipboardCheck, Search, CheckCircle, XCircle, Download, Filter } from "lucide-react";

const statusVariant = { pending: "warning", approved: "success", rejected: "danger", completed: "primary", withdrawn: "default" };

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAction, setShowAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { load(); }, [statusFilter]);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await getAllRegistrations(params);
      const list = data.registrations || (Array.isArray(data) ? data : []);
      setRegistrations(list);
      setTotal(data.total || list.length);
    } catch { setRegistrations([]); } finally { setLoading(false); }
  };

  const filtered = registrations.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.student?.name?.toLowerCase().includes(q) || r.student?.email?.toLowerCase().includes(q) || r.course?.title?.toLowerCase().includes(q) || r.partnerInstitute?.name?.toLowerCase().includes(q);
  });

  const openAction = (reg, type) => { setSelected(reg); setActionType(type); setRemarks(""); setShowAction(true); };

  const handleAction = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      await processRegistration(selected._id, { status: actionType, remarks });
      setShowAction(false);
      load();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
    finally { setActionLoading(false); }
  };

  const handleExport = async () => {
    try {
      const blob = await exportRegistrationsCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "registrations.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("Export failed"); }
  };

  const columns = [
    { key: "student", label: "Student", render: (r) => (
      <div><p className="font-medium text-gray-800">{r.student?.name || "—"}</p><p className="text-xs text-gray-400">{r.student?.email}</p></div>
    )},
    { key: "course", label: "Course", render: (r) => r.course?.title || "—" },
    { key: "institute", label: "Institute", render: (r) => r.partnerInstitute?.name || <span className="text-gray-400">Direct</span> },
    { key: "status", label: "Status", render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
    { key: "lms", label: "LMS Access", render: (r) => r.lmsAccessGranted ? <Badge variant="success">Granted</Badge> : <Badge variant="default">No</Badge> },
    { key: "orientation", label: "Orientation", render: (r) => r.orientationCompleted ? <Badge variant="success">Done</Badge> : <Badge variant="default">Pending</Badge> },
    { key: "quiz", label: "Quiz", render: (r) => r.quizPassed ? <Badge variant="success">{r.quizScore}%</Badge> : <Badge variant="default">—</Badge> },
    { key: "date", label: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: "actions", label: "", render: (r) => r.status === "pending" ? (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); openAction(r, "approved"); }} className="p-1.5 rounded-lg hover:bg-emerald-50" title="Approve"><CheckCircle size={16} className="text-emerald-600" /></button>
        <button onClick={(e) => { e.stopPropagation(); openAction(r, "rejected"); }} className="p-1.5 rounded-lg hover:bg-red-50" title="Reject"><XCircle size={16} className="text-red-500" /></button>
      </div>
    ) : <span className="text-xs text-gray-400">{r.processedBy ? "Processed" : ""}</span> },
  ];

  const pendingCount = registrations.filter(r => r.status === "pending").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Registrations" subtitle={`${total} total · ${pendingCount} pending approval`}
          actions={<Button variant="outline" onClick={handleExport}><Download size={16} /> Export CSV</Button>} />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student, course, institute..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: "", label: "All Status" }, { value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }, { value: "completed", label: "Completed" }]} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: total, color: "text-gray-800" },
            { label: "Pending", value: pendingCount, color: "text-yellow-600" },
            { label: "Approved", value: registrations.filter(r => r.status === "approved").length, color: "text-emerald-600" },
            { label: "Rejected", value: registrations.filter(r => r.status === "rejected").length, color: "text-red-500" },
            { label: "Completed", value: registrations.filter(r => r.status === "completed").length, color: "text-indigo-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No registrations found" />
        )}

        <Modal open={showAction} onClose={() => setShowAction(false)} title={`${actionType === "approved" ? "Approve" : "Reject"} Registration`}>
          <div className="space-y-4">
            {selected && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm"><strong>Student:</strong> {selected.student?.name} ({selected.student?.email})</p>
                <p className="text-sm"><strong>Course:</strong> {selected.course?.title}</p>
                {selected.partnerInstitute && <p className="text-sm"><strong>Institute:</strong> {selected.partnerInstitute?.name}</p>}
              </div>
            )}
            <Textarea label="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add remarks for the student..." />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowAction(false)}>Cancel</Button>
              <Button variant={actionType === "approved" ? "success" : "danger"} onClick={handleAction} loading={actionLoading}>
                {actionType === "approved" ? "Approve Registration" : "Reject Registration"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
