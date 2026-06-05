import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader, DataTable, Button, Modal, Input, EmptyState,
} from "../../components/ui";
import { getContacts, createContact, deleteContact } from "../../services/crmService";
import { Plus, Trash2 } from "lucide-react";

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", phone: "", position: "", country: "", notes: "",
};

export default function Contacts() {
  const [contacts,   setContacts]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search,     setSearch]     = useState("");
  const [form,       setForm]       = useState(EMPTY_FORM);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getContacts(search ? { search } : {});
      setContacts(res.contacts || []);
      setTotal(res.total || 0);
    } catch { setContacts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async () => {
    try {
      await createContact(form);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this contact?")) return;
    try { await deleteContact(id); load(); } catch {}
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const columns = [
    {
      key: "name", label: "Contact",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
            {r.firstName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{r.firstName} {r.lastName}</p>
            <p className="text-xs text-gray-400">{r.email || r.phone || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "position",     label: "Position",     render: (r) => r.position || "—" },
    { key: "organisation", label: "Organisation", render: (r) => r.organisation?.name || "—" },
    { key: "country",      label: "Country",      render: (r) => r.country || "—" },
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
          title="Contacts"
          subtitle={`${total} total contacts`}
          actions={
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={15} /> New Contact
            </Button>
          }
        />

        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {loading
          ? <EmptyState title="Loading contacts..." />
          : <DataTable columns={columns} data={contacts} emptyMessage="No contacts found" />
        }

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Contact" size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name *" value={form.firstName} onChange={f("firstName")} />
            <Input label="Last Name"    value={form.lastName}  onChange={f("lastName")}  />
            <Input label="Email"        value={form.email}     onChange={f("email")}     type="email" />
            <Input label="Phone"        value={form.phone}     onChange={f("phone")}     />
            <Input label="Position"     value={form.position}  onChange={f("position")}  />
            <Input label="Country"      value={form.country}   onChange={f("country")}   />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Contact</Button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
