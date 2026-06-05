import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader, DataTable, Badge, Button, Modal, Input, Select, EmptyState, Textarea,
} from "../../components/ui";
import {
  getFollowUps, createFollowUp, updateFollowUp, deleteFollowUp,
} from "../../services/crmService";
import { Plus, CheckCircle2, Trash2, AlertCircle, Clock } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "call",     label: "Call"     },
  { value: "email",    label: "Email"    },
  { value: "meeting",  label: "Meeting"  },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other",    label: "Other"    },
];

const OUTCOME_FILTER_OPTIONS = [
  { value: "all",       label: "All"         },
  { value: "pending",   label: "Pending"     },
  { value: "completed", label: "Completed"   },
  { value: "no_answer", label: "No Answer"   },
  { value: "rescheduled","label": "Rescheduled" },
];

export default function FollowUps() {
  const [followUps, setFollowUps]     = useState([]);
  const [total,     setTotal]         = useState(0);
  const [loading,   setLoading]       = useState(false);
  const [showCreate,setShowCreate]    = useState(false);
  const [outcome,   setOutcome]       = useState("all");
  const [form,      setForm]          = useState({ lead: "", scheduledAt: "", type: "call", remarks: "" });

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (outcome !== "all") params.outcome = outcome;
      const res = await getFollowUps(params);
      setFollowUps(res.followUps || []);
      setTotal(res.total || 0);
    } catch { setFollowUps([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [outcome]);

  const handleCreate = async () => {
    try {
      await createFollowUp(form);
      setShowCreate(false);
      setForm({ lead: "", scheduledAt: "", type: "call", remarks: "" });
      load();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleComplete = async (id) => {
    try { await updateFollowUp(id, { outcome: "completed" }); load(); } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this follow-up?")) return;
    try { await deleteFollowUp(id); load(); } catch {}
  };

  const isOverdue = (fu) =>
    fu.outcome === "pending" && new Date(fu.scheduledAt) < new Date();

  const columns = [
    {
      key: "lead", label: "Lead",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-800">{r.lead?.fullName || "—"}</p>
          <p className="text-xs text-gray-400">{r.lead?.email || r.lead?.phone || ""}</p>
        </div>
      ),
    },
    { key: "type",    label: "Type",    render: (r) => <Badge>{r.type}</Badge> },
    {
      key: "scheduledAt", label: "Scheduled",
      render: (r) => (
        <span className={isOverdue(r) ? "text-red-600 font-medium" : "text-gray-600"}>
          {new Date(r.scheduledAt).toLocaleString()}
          {isOverdue(r) && <span className="ml-1 text-xs">(overdue)</span>}
        </span>
      ),
    },
    {
      key: "outcome", label: "Outcome",
      render: (r) => (
        <Badge variant={
          r.outcome === "completed" ? "success" :
          isOverdue(r)              ? "danger"  : "warning"
        }>
          {r.outcome === "pending" && isOverdue(r) ? "overdue" : r.outcome}
        </Badge>
      ),
    },
    { key: "remarks", label: "Remarks",   render: (r) => r.remarks || "—" },
    {
      key: "actions", label: "",
      render: (r) => (
        <div className="flex gap-2">
          {r.outcome === "pending" && (
            <button onClick={(e) => { e.stopPropagation(); handleComplete(r._id); }}
              className="p-2 rounded-lg hover:bg-emerald-50">
              <CheckCircle2 size={15} className="text-emerald-600"/>
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}
            className="p-2 rounded-lg hover:bg-red-50">
            <Trash2 size={15} className="text-red-500"/>
          </button>
        </div>
      ),
    },
  ];

  // Quick stats
  const overdue   = followUps.filter(isOverdue).length;
  const today     = followUps.filter((fu) => {
    const d = new Date(fu.scheduledAt);
    const n = new Date();
    return d.toDateString() === n.toDateString() && fu.outcome === "pending";
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <PageHeader
          title="Follow-ups"
          subtitle={`${total} total`}
          actions={
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Schedule Follow-up
            </Button>
          }
        />

        {/* Quick stat pills */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-700">
            <Clock size={14}/> Today: <strong>{today}</strong>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm text-red-700">
            <AlertCircle size={14}/> Overdue: <strong>{overdue}</strong>
          </div>
        </div>

        <Select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          options={OUTCOME_FILTER_OPTIONS}
          className="max-w-xs"
        />

        {loading
          ? <EmptyState title="Loading follow-ups..." />
          : <DataTable columns={columns} data={followUps} emptyMessage="No follow-ups found" />
        }

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Schedule Follow-up">
          <div className="space-y-4">
            <Input
              label="Lead ID (paste _id)"
              value={form.lead}
              onChange={(e) => setForm({ ...form, lead: e.target.value })}
            />
            <Input
              label="Date & Time *"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={TYPE_OPTIONS}
            />
            <Textarea
              label="Remarks"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Schedule</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

