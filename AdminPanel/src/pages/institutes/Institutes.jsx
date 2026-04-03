import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Select, Textarea } from "../../components/ui";
import { getAllInstitutes, getInstituteById, approveRejectInstitute } from "../../services/instituteService";
import { Building2, Search, CheckCircle, XCircle, Eye, Clock } from "lucide-react";

const statusVariant = { pending: "warning", approved: "success", rejected: "danger", suspended: "default" };

export default function Institutes() {
  const [institutes, setInstitutes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInst, setSelectedInst] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [actionType, setActionType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = institutes;
    if (statusFilter !== "all") list = list.filter(i => i.status === statusFilter);
    if (search) list = list.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.code?.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [search, statusFilter, institutes]);

  const load = async () => {
    try { setLoading(true); const data = await getAllInstitutes(); setInstitutes(Array.isArray(data) ? data : []); }
    catch { setInstitutes([]); } finally { setLoading(false); }
  };

  const openDetail = async (inst) => {
    try { const detail = await getInstituteById(inst._id); setSelectedInst(detail); setShowDetail(true); }
    catch { setSelectedInst(inst); setShowDetail(true); }
  };

  const openAction = (inst, type) => { setSelectedInst(inst); setActionType(type); setRemarks(""); setShowAction(true); };

  const handleAction = async () => {
    if (!selectedInst) return;
    try {
      setActionLoading(true);
      await approveRejectInstitute(selectedInst._id, { status: actionType, remarks });
      setShowAction(false);
      load();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
    finally { setActionLoading(false); }
  };

  const columns = [
    { key: "name", label: "Institute", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Building2 size={18} className="text-indigo-600" /></div>
        <div><p className="font-medium text-gray-800">{r.name}</p><p className="text-xs text-gray-400 font-mono">{r.code}</p></div>
      </div>
    )},
    { key: "email", label: "Email", render: (r) => r.email || "—" },
    { key: "contact", label: "Contact", render: (r) => r.primaryContact?.name || "—" },
    { key: "city", label: "Location", render: (r) => [r.city, r.country].filter(Boolean).join(", ") || "—" },
    { key: "status", label: "Status", render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
    { key: "createdAt", label: "Registered", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); openDetail(r); }} className="p-1.5 rounded-lg hover:bg-gray-100" title="View"><Eye size={16} className="text-gray-500" /></button>
        {r.status === "pending" && <>
          <button onClick={(e) => { e.stopPropagation(); openAction(r, "approved"); }} className="p-1.5 rounded-lg hover:bg-emerald-50" title="Approve"><CheckCircle size={16} className="text-emerald-600" /></button>
          <button onClick={(e) => { e.stopPropagation(); openAction(r, "rejected"); }} className="p-1.5 rounded-lg hover:bg-red-50" title="Reject"><XCircle size={16} className="text-red-500" /></button>
        </>}
        {r.status === "approved" && <button onClick={(e) => { e.stopPropagation(); openAction(r, "suspended"); }} className="p-1.5 rounded-lg hover:bg-yellow-50" title="Suspend"><Clock size={16} className="text-yellow-600" /></button>}
      </div>
    )},
  ];

  const pending = institutes.filter(i => i.status === "pending").length;
  const approved = institutes.filter(i => i.status === "approved").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Partner Institutes" subtitle={`${institutes.length} total · ${pending} pending · ${approved} approved`} />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search institutes..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: "all", label: "All Status" }, { value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }, { value: "suspended", label: "Suspended" }]} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} onRowClick={openDetail} emptyMessage="No institutes found" />
        )}

        {/* Detail Modal */}
        <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Institute Details" size="lg">
          {selectedInst && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-400">Name</p><p className="font-medium">{selectedInst.name}</p></div>
                <div><p className="text-xs text-gray-400">Code</p><p className="font-mono font-medium">{selectedInst.code}</p></div>
                <div><p className="text-xs text-gray-400">Email</p><p>{selectedInst.email}</p></div>
                <div><p className="text-xs text-gray-400">Phone</p><p>{selectedInst.phone || "—"}</p></div>
                <div><p className="text-xs text-gray-400">Location</p><p>{[selectedInst.city, selectedInst.country].filter(Boolean).join(", ") || "—"}</p></div>
                <div><p className="text-xs text-gray-400">Status</p><Badge variant={statusVariant[selectedInst.status]}>{selectedInst.status}</Badge></div>
                <div><p className="text-xs text-gray-400">Contact Person</p><p>{selectedInst.primaryContact?.name || "—"}</p></div>
                <div><p className="text-xs text-gray-400">Students</p><p>{selectedInst.studentCount ?? "—"}</p></div>
                {selectedInst.website && <div className="col-span-2"><p className="text-xs text-gray-400">Website</p><a href={selectedInst.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm">{selectedInst.website}</a></div>}
                {selectedInst.remarks && <div className="col-span-2"><p className="text-xs text-gray-400">Remarks</p><p className="text-sm">{selectedInst.remarks}</p></div>}
              </div>
              {selectedInst.documents?.length > 0 && (
                <div><p className="text-xs text-gray-400 mb-2">Documents</p>
                  {selectedInst.documents.map((d, i) => (
                    <a key={i} href={d.fileUrl} target="_blank" rel="noreferrer" className="block text-sm text-indigo-600 hover:underline">{d.title}</a>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Action Modal */}
        <Modal open={showAction} onClose={() => setShowAction(false)} title={`${actionType === "approved" ? "Approve" : actionType === "rejected" ? "Reject" : "Suspend"} Institute`}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">You are about to <strong>{actionType === "approved" ? "approve" : actionType === "rejected" ? "reject" : "suspend"}</strong> institute <strong>{selectedInst?.name}</strong>.</p>
            <Textarea label="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add any remarks..." />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowAction(false)}>Cancel</Button>
              <Button variant={actionType === "approved" ? "success" : "danger"} onClick={handleAction} loading={actionLoading}>
                {actionType === "approved" ? "Approve" : actionType === "rejected" ? "Reject" : "Suspend"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
