import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader, DataTable, Badge, Button, Modal,
  Input, Select, EmptyState, Textarea,
} from "../../components/ui";
import {
  getLeads, createLead, deleteLead, exportLeadsCsv,
} from "../../services/crmService";
import { Plus, Trash2, Eye, Download } from "lucide-react";

const STATUS_COLORS = {
  new:             "default",
  contacted:       "primary",
  interested:      "accent",
  proposal_sent:   "warning",
  payment_pending: "warning",
  converted:       "success",
  lost:            "danger",
};

const SOURCE_OPTIONS = [
  { value: "website",   label: "Website"    },
  { value: "referral",  label: "Referral"   },
  { value: "social",    label: "Social"     },
  { value: "partner",   label: "Partner"    },
  { value: "cold_call", label: "Cold Call"  },
  { value: "event",     label: "Event"      },
  { value: "other",     label: "Other"      },
];

const STATUS_OPTIONS = [
  { value: "new",             label: "New"             },
  { value: "contacted",       label: "Contacted"       },
  { value: "interested",      label: "Interested"      },
  { value: "proposal_sent",   label: "Proposal Sent"   },
  { value: "payment_pending", label: "Payment Pending" },
  { value: "converted",       label: "Converted"       },
  { value: "lost",            label: "Lost"            },
];

const EMPTY_FORM = {
  fullName: "", email: "", phone: "", country: "",
  source: "other", status: "new", probability: 0, notes: "",
};

export default function Leads() {
  const navigate = useNavigate();
  const [leads,       setLeads]       = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [showCreate,  setShowCreate]  = useState(false);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("all");

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search)                   params.search = search;
      if (statusFilter !== "all")   params.status = statusFilter;
      const res = await getLeads(params);
      setLeads(res.leads || []);
      setTotal(res.total || 0);
    } catch { setLeads([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const handleCreate = async () => {
    try {
      await createLead(form);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) { alert(err.response?.data?.message || "Error creating lead"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this lead?")) return;
    try { await deleteLead(id); load(); } catch {}
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const columns = [
    {
      key: "fullName", label: "Lead",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
            {r.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{r.fullName}</p>
            <p className="text-xs text-gray-400">{r.email || r.phone || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "country",  label: "Country",  render: (r) => r.country || "—" },
    { key: "source",   label: "Source",   render: (r) => <Badge>{r.source}</Badge> },
    {
      key: "status",   label: "Status",
      render: (r) => (
        <Badge variant={STATUS_COLORS[r.status] || "default"}>
          {r.status?.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "probability", label: "Probability",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full"
              style={{ width: `${r.probability || 0}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{r.probability || 0}%</span>
        </div>
      ),
    },
    { key: "assignedTo", label: "Assigned", render: (r) => r.assignedTo?.name || "—" },
    {
      key: "createdAt", label: "Created",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: "actions", label: "",
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/crm/leads/${r._id}`); }}
            className="p-2 rounded-lg hover:bg-indigo-50">
            <Eye size={15} className="text-indigo-500" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}
            className="p-2 rounded-lg hover:bg-red-50">
            <Trash2 size={15} className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <PageHeader
          title="Leads"
          subtitle={`${total} total leads`}
          actions={
            <>
              <Button variant="secondary" onClick={() => exportLeadsCsv()}>
                <Download size={15} /> Export CSV
              </Button>
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={15} /> New Lead
              </Button>
            </>
          }
        />

        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: "all", label: "All Statuses" }, ...STATUS_OPTIONS]}
          />
        </div>

        {loading
          ? <EmptyState title="Loading leads..." />
          : <DataTable
              columns={columns}
              data={leads}
              emptyMessage="No leads found"
              onRowClick={(r) => navigate(`/admin/crm/leads/${r._id}`)}
            />
        }

        {/* Create Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Lead" size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name *"  value={form.fullName}    onChange={f("fullName")} />
            <Input label="Email"        value={form.email}       onChange={f("email")}    type="email" />
            <Input label="Phone"        value={form.phone}       onChange={f("phone")}    />
            <Input label="Country"      value={form.country}     onChange={f("country")}  />
            <Select label="Source"   value={form.source}  onChange={f("source")}  options={SOURCE_OPTIONS} />
            <Select label="Status"   value={form.status}  onChange={f("status")}  options={STATUS_OPTIONS} />
            <Input
              label="Probability (%)"
              type="number" min="0" max="100"
              value={form.probability}
              onChange={f("probability")}
            />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={f("notes")} className="mt-4" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Lead</Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
