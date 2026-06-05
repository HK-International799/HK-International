import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader, DataTable, Button, Modal, Input, EmptyState, Textarea,
} from "../../components/ui";
import { getOrgs, createOrg, deleteOrg } from "../../services/crmService";
import { Plus, Trash2, Building2 } from "lucide-react";

const EMPTY_FORM = {
  name: "", industry: "", website: "", phone: "", email: "", address: "", country: "", notes: "",
};

export default function Organisations() {
  const [orgs,       setOrgs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search,     setSearch]     = useState("");
  const [form,       setForm]       = useState(EMPTY_FORM);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getOrgs(search ? { search } : {});
      setOrgs(res.orgs || []);
      setTotal(res.total || 0);
    } catch { setOrgs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async () => {
    try {
      await createOrg(form);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this organisation?")) return;
    try { await deleteOrg(id); load(); } catch {}
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const columns = [
    {
      key: "name", label: "Organisation",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
            <Building2 size={16}/>
          </div>
          <div>
            <p className="font-medium text-gray-800">{r.name}</p>
            <p className="text-xs text-gray-400">{r.industry || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "country", label: "Country", render: (r) => r.country  || "—" },
    { key: "email",   label: "Email",   render: (r) => r.email    || "—" },
    { key: "phone",   label: "Phone",   render: (r) => r.phone    || "—" },
    { key: "website", label: "Website", render: (r) => r.website  || "—" },
    {
      key: "actions", label: "",
      render: (r) => (
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}
          className="p-2 rounded-lg hover:bg-red-50">
          <Trash2 size={15} className="text-red-500"/>
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <PageHeader
          title="Organisations"
          subtitle={`${total} total organisations`}
          actions={
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={15} /> New Organisation
            </Button>
          }
        />

        <Input
          placeholder="Search organisations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {loading
          ? <EmptyState title="Loading organisations..." />
          : <DataTable columns={columns} data={orgs} emptyMessage="No organisations found" />
        }

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Organisation" size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name *"    value={form.name}     onChange={f("name")}     />
            <Input label="Industry"  value={form.industry} onChange={f("industry")} />
            <Input label="Website"   value={form.website}  onChange={f("website")}  />
            <Input label="Phone"     value={form.phone}    onChange={f("phone")}    />
            <Input label="Email"     value={form.email}    onChange={f("email")}    type="email" />
            <Input label="Country"   value={form.country}  onChange={f("country")}  />
            <Input label="Address"   value={form.address}  onChange={f("address")}  className="md:col-span-2" />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={f("notes")} className="mt-4" />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Organisation</Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}