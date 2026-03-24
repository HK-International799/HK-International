import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Input, Textarea, Select, EmptyState } from "../../components/ui";
import { getCourses, createCourse, deleteCourse } from "../../services/courseService";
import { Plus, BookOpen, Trash2, Eye, Edit, Search } from "lucide-react";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "draft" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    setFiltered(courses.filter((c) =>
      c.title?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(Array.isArray(data) ? data : data.courses || []);
    } catch { setCourses([]); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await createCourse(form);
      setShowCreate(false);
      setForm({ title: "", description: "", status: "draft" });
      loadCourses();
    } catch (err) { alert(err.response?.data?.message || "Error creating course"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this course?")) return;
    try { await deleteCourse(id); loadCourses(); } catch {}
  };

  const statusColor = { draft: "warning", published: "success", archived: "default" };

  const columns = [
    { key: "title", label: "Course", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen size={18} className="text-primary" />
        </div>
        <div>
          <p className="font-medium text-gray-800">{r.title}</p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.description || "No description"}</p>
        </div>
      </div>
    )},
    { key: "assignedTutor", label: "Tutor", render: (r) => r.assignedTutor?.name || "—" },
    { key: "status", label: "Status", render: (r) => <Badge variant={statusColor[r.status]}>{r.status}</Badge> },
    { key: "sections", label: "Sections", render: (r) => r.sections?.length || 0 },
    { key: "createdAt", label: "Created", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/courses/${r._id}`); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={16} className="text-gray-500" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-danger" /></button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Courses" subtitle={`${courses.length} total courses`}
          actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Add Course</Button>}
        />

        <div className="mb-4">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <DataTable columns={columns} data={filtered} onRowClick={(r) => navigate(`/admin/courses/${r._id}`)} />

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Course">
          <div className="space-y-4">
            <Input label="Course Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter course title" />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Course description..." />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Course</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
