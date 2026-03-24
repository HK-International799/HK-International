import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Input, Select, Textarea } from "../../components/ui";
import { getAllExams, createExam, deleteExam } from "../../services/examService";
import { getCourses } from "../../services/courseService";
import { Plus, FileCheck, Trash2, Search, Clock, Award } from "lucide-react";

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", courseId: "", totalMarks: 100, passingMarks: 40, timeLimitMinutes: 60, startTime: "", endTime: "", status: "draft" });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [e, c] = await Promise.all([getAllExams(), getCourses()]);
      setExams(Array.isArray(e) ? e : []);
      setCourses(Array.isArray(c) ? c : c.courses || []);
    } catch { }
  };

  const handleCreate = async () => {
    try { await createExam(form); setShowCreate(false); load(); } catch (err) { alert(err.response?.data?.message || "Error"); }
  };
  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { await deleteExam(id); load(); } catch { } };

  const filtered = exams.filter((e) => e.title?.toLowerCase().includes(search.toLowerCase()));
  const statusColor = { draft: "warning", published: "primary", active: "success", completed: "default" };

  const columns = [
    { key: "title", label: "Exam", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center"><FileCheck size={18} className="text-danger" /></div>
        <div><p className="font-medium text-gray-800">{r.title}</p><p className="text-xs text-gray-400">{r.courseId?.title || "—"}</p></div>
      </div>
    )},
    { key: "marks", label: "Marks", render: (r) => <span>{r.totalMarks} <span className="text-xs text-gray-400">(Pass: {r.passingMarks})</span></span> },
    { key: "time", label: "Duration", render: (r) => <div className="flex items-center gap-1 text-sm"><Clock size={14} className="text-gray-400" /> {r.timeLimitMinutes} min</div> },
    { key: "status", label: "Status", render: (r) => <Badge variant={statusColor[r.status]}>{r.status}</Badge> },
    { key: "questions", label: "Questions", render: (r) => r.questions?.length || 0 },
    { key: "actions", label: "", render: (r) => (
      <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-danger" /></button>
    )},
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Exams" subtitle={`${exams.length} total`}
          actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create Exam</Button>} />
        <div className="mb-4 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exams..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <DataTable columns={columns} data={filtered} />

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Exam" size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="md:col-span-2" />
            <Select label="Course" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              options={[{ value: "", label: "Select" }, ...courses.map((c) => ({ value: c._id, label: c.title }))]} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} />
            <Input label="Total Marks" type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
            <Input label="Passing Marks" type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} />
            <Input label="Time Limit (min)" type="number" value={form.timeLimitMinutes} onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })} />
            <div />
            <Input label="Start Time" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="End Time" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
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
