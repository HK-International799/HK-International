import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Input, Select } from "../../components/ui";
import { getAllUsers, createUser, deleteUser } from "../../services/adminService";
import { Plus, GraduationCap, Trash2, Mail, Phone, Search, Filter } from "lucide-react";

export default function Learners() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", role: "student" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch { setUsers([]); }
  };

  const handleCreate = async () => {
    try { await createUser(form); setShowCreate(false); setForm({ name: "", email: "", mobile: "", password: "", role: "student" }); load(); }
    catch (err) { alert(err.response?.data?.message || err.response?.data?.msg || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try { await deleteUser(id); load(); } catch { }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColor = { student: "primary", tutor: "warning", admin: "danger" };

  const columns = [
    { key: "name", label: "User", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shrink-0">
          {r.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-800">{r.name}</p>
          <p className="text-xs text-gray-400">{r.email}</p>
        </div>
      </div>
    )},
    { key: "mobile", label: "Mobile", render: (r) => r.mobile || "—" },
    { key: "role", label: "Role", render: (r) => <Badge variant={roleColor[r.role]}>{r.role}</Badge> },
    { key: "enrolledCourses", label: "Courses", render: (r) => r.enrolledCourses?.length || r.assignedCourses?.length || 0 },
    { key: "createdAt", label: "Joined", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: "actions", label: "", render: (r) => (
      <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50">
        <Trash2 size={16} className="text-danger" />
      </button>
    )},
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Learners & Users" subtitle={`${users.length} total users`}
          actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Add User</Button>}
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-2">
            {["all", "student", "tutor", "admin"].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition-all ${roleFilter === r ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {r === "all" ? "All" : r + "s"}
              </button>
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No users found" />

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User">
          <div className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
            <Input label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="9876543210" />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[{ value: "student", label: "Student" }, { value: "tutor", label: "Tutor" }]} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create User</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
