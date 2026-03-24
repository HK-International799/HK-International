import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Input, Select, Textarea } from "../../components/ui";
import { getAllAssignments, createAssignment, deleteAssignment } from "../../services/assignmentService";
import { getCourses } from "../../services/courseService";
import { Plus, ClipboardList, Trash2, Eye, Search } from "lucide-react";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", courseId: "", dueDate: "", totalMarks: 100, isPublished: false });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [a, c] = await Promise.all([getAllAssignments(), getCourses()]);
      setAssignments(Array.isArray(a) ? a : a.assignments || []);
      setCourses(Array.isArray(c) ? c : c.courses || []);
    } catch { }
  };

  const handleCreate = async () => {
    try { await createAssignment(form); setShowCreate(false); setForm({ title: "", description: "", courseId: "", dueDate: "", totalMarks: 100, isPublished: false }); load(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { await deleteAssignment(id); load(); } catch { } };

  const filtered = assignments.filter((a) => a.title?.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: "title", label: "Assignment", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><ClipboardList size={18} className="text-primary" /></div>
        <div><p className="font-medium text-gray-800">{r.title}</p><p className="text-xs text-gray-400">{r.courseId?.title || "—"}</p></div>
      </div>
    )},
    { key: "totalMarks", label: "Marks", render: (r) => r.totalMarks || "—" },
    { key: "dueDate", label: "Due Date", render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—" },
    { key: "isPublished", label: "Status", render: (r) => <Badge variant={r.isPublished ? "success" : "warning"}>{r.isPublished ? "Published" : "Draft"}</Badge> },
    { key: "questions", label: "Questions", render: (r) => r.questions?.length || 0 },
    { key: "actions", label: "", render: (r) => (
      <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-danger" /></button>
    )},
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Assignments" subtitle={`${assignments.length} total`}
          actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create Assignment</Button>} />
        <div className="mb-4 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <DataTable columns={columns} data={filtered} />

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Assignment" size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="md:col-span-2" />
            <Select label="Course" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              options={[{ value: "", label: "Select Course" }, ...courses.map((c) => ({ value: c._id, label: c.title }))]} />
            <Input label="Total Marks" type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <Select label="Publish" value={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.value === "true" })}
              options={[{ value: "false", label: "Draft" }, { value: "true", label: "Published" }]} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
