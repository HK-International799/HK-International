import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Input, Select, Textarea } from "../../components/ui";
import { getAllLiveClasses, createLiveClass, deleteLiveClass } from "../../services/liveClassService";
import { getCourses } from "../../services/courseService";
import { getAllUsers } from "../../services/adminService";
import { Plus, Video, Trash2, ExternalLink, Calendar, Clock, Search } from "lucide-react";

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", courseId: "", tutorId: "", scheduledAt: "", duration: 60, meetingLink: "", status: "scheduled" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [cl, co, u] = await Promise.all([getAllLiveClasses(), getCourses(), getAllUsers()]);
      setClasses(Array.isArray(cl) ? cl : []);
      setCourses(Array.isArray(co) ? co : co.courses || []);
      const userList = Array.isArray(u) ? u : u.users || [];
      setTutors(userList.filter((x) => x.role === "tutor"));
    } catch { }
  };

  const handleCreate = async () => {
    try { await createLiveClass(form); setShowCreate(false); setForm({ title: "", description: "", courseId: "", tutorId: "", scheduledAt: "", duration: 60, meetingLink: "", status: "scheduled" }); load(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this class?")) return;
    try { await deleteLiveClass(id); load(); } catch { }
  };

  const filtered = classes.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()));
  const statusColor = { scheduled: "warning", live: "danger", completed: "success", cancelled: "default" };

  const columns = [
    { key: "title", label: "Class", render: (r) => (
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.status === "live" ? "bg-danger/10" : "bg-accent/10"}`}>
          <Video size={18} className={r.status === "live" ? "text-danger" : "text-accent"} />
        </div>
        <div>
          <p className="font-medium text-gray-800">{r.title}</p>
          <p className="text-xs text-gray-400">{r.courseId?.title || "—"}</p>
        </div>
      </div>
    )},
    { key: "tutor", label: "Tutor", render: (r) => r.tutorId?.name || "—" },
    { key: "scheduledAt", label: "Schedule", render: (r) => (
      <div className="text-xs">
        <div className="flex items-center gap-1 text-gray-700"><Calendar size={12} /> {r.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString() : "—"}</div>
        <div className="flex items-center gap-1 text-gray-400 mt-0.5"><Clock size={12} /> {r.scheduledAt ? new Date(r.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"} ({r.duration} min)</div>
      </div>
    )},
    { key: "status", label: "Status", render: (r) => (
      <Badge variant={statusColor[r.status]}>
        {r.status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse mr-1 inline-block" />}
        {r.status}
      </Badge>
    )},
    { key: "attendees", label: "Attendees", render: (r) => r.attendees?.length || 0 },
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1">
        {r.meetingLink && <a href={r.meetingLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-gray-100"><ExternalLink size={16} className="text-primary" /></a>}
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-danger" /></button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Live Classes" subtitle={`${classes.length} total sessions`}
          actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Schedule Class</Button>}
        />
        <div className="mb-4 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search classes..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <DataTable columns={columns} data={filtered} />

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Schedule Live Class" size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Class title" className="md:col-span-2" />
            <Select label="Course" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              options={[{ value: "", label: "Select Course" }, ...courses.map((c) => ({ value: c._id, label: c.title }))]} />
            <Select label="Tutor" value={form.tutorId} onChange={(e) => setForm({ ...form, tutorId: e.target.value })}
              options={[{ value: "", label: "Select Tutor" }, ...tutors.map((t) => ({ value: t._id, label: t.name }))]} />
            <Input label="Scheduled At" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            <Input label="Duration (min)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <Input label="Meeting Link" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://zoom.us/..." className="md:col-span-2" />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Schedule</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
