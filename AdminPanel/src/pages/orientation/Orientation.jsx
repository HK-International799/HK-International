import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Input, Textarea, Select } from "../../components/ui";
import { getAllSessions, createSession, deleteSession, getSessionAttendance, getQuizResults, uploadAttendanceCSV } from "../../services/orientationService";
import { getCourses } from "../../services/courseService";
import { Presentation, Plus, Trash2, Users, FileCheck, Upload, Eye, Search } from "lucide-react";

const statusVariant = { scheduled: "primary", in_progress: "warning", completed: "success", cancelled: "danger" };

export default function Orientation() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", course: "", scheduledDate: "", durationMinutes: 60, meetingLink: "", passingScore: 50 });
  const [createLoading, setCreateLoading] = useState(false);

  // Detail views
  const [showAttendance, setShowAttendance] = useState(false);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => { load(); loadCourses(); }, []);

  const load = async () => {
    try { setLoading(true); const data = await getAllSessions(); setSessions(Array.isArray(data) ? data : []); }
    catch { setSessions([]); } finally { setLoading(false); }
  };

  const loadCourses = async () => {
    try { const data = await getCourses(); setCourses(Array.isArray(data) ? data : data?.courses || []); }
    catch { setCourses([]); }
  };

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      await createSession(form);
      setShowCreate(false);
      setForm({ title: "", description: "", course: "", scheduledDate: "", durationMinutes: 60, meetingLink: "", passingScore: 50 });
      load();
    } catch (err) { alert(err.response?.data?.message || "Error creating session"); }
    finally { setCreateLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this session?")) return;
    try { await deleteSession(id); load(); } catch {}
  };

  const viewAttendance = async (session) => {
    try { setSelectedSession(session); const data = await getSessionAttendance(session._id); setAttendanceData(Array.isArray(data) ? data : []); setShowAttendance(true); }
    catch { setAttendanceData([]); setShowAttendance(true); }
  };

  const viewQuizResults = async (session) => {
    try { setSelectedSession(session); const data = await getQuizResults(session._id); setQuizData(Array.isArray(data) ? data : []); setShowQuizResults(true); }
    catch { setQuizData([]); setShowQuizResults(true); }
  };

  const handleCSVUpload = async (sessionId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try { const result = await uploadAttendanceCSV(sessionId, file); alert(`Processed ${result.processed || 0} records. Errors: ${result.errors?.length || 0}`); load(); }
      catch (err) { alert(err.response?.data?.message || "Upload failed"); }
    };
    input.click();
  };

  const filtered = sessions.filter(s => !search || s.title?.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: "title", label: "Session", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Presentation size={18} className="text-purple-600" /></div>
        <div><p className="font-medium text-gray-800">{r.title}</p><p className="text-xs text-gray-400">{r.course?.title || "—"}</p></div>
      </div>
    )},
    { key: "date", label: "Date", render: (r) => r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : "—" },
    { key: "duration", label: "Duration", render: (r) => `${r.durationMinutes || 60} min` },
    { key: "status", label: "Status", render: (r) => <Badge variant={statusVariant[r.status]}>{r.status?.replace("_", " ")}</Badge> },
    { key: "quiz", label: "Quiz", render: (r) => r.quiz ? <Badge variant="primary">Linked</Badge> : <Badge variant="default">None</Badge> },
    { key: "passing", label: "Pass %", render: (r) => `${r.passingScore || 50}%` },
    { key: "attendance", label: "Attended", render: (r) => r.attendanceCount ?? "—" },
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); viewAttendance(r); }} className="p-1.5 rounded-lg hover:bg-blue-50" title="Attendance"><Users size={16} className="text-blue-600" /></button>
        {r.quiz && <button onClick={(e) => { e.stopPropagation(); viewQuizResults(r); }} className="p-1.5 rounded-lg hover:bg-green-50" title="Quiz Results"><FileCheck size={16} className="text-green-600" /></button>}
        <button onClick={(e) => { e.stopPropagation(); handleCSVUpload(r._id); }} className="p-1.5 rounded-lg hover:bg-orange-50" title="Upload CSV"><Upload size={16} className="text-orange-500" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-500" /></button>
      </div>
    )},
  ];

  const attendanceCols = [
    { key: "student", label: "Student", render: (r) => <div><p className="font-medium">{r.student?.name}</p><p className="text-xs text-gray-400">{r.student?.email}</p></div> },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "present" ? "success" : r.status === "late" ? "warning" : "danger"}>{r.status}</Badge> },
    { key: "source", label: "Source", render: (r) => <Badge variant="default">{r.source}</Badge> },
    { key: "markedAt", label: "Marked", render: (r) => r.markedAt ? new Date(r.markedAt).toLocaleString() : "—" },
  ];

  const quizCols = [
    { key: "student", label: "Student", render: (r) => <div><p className="font-medium">{r.studentId?.name}</p><p className="text-xs text-gray-400">{r.studentId?.email}</p></div> },
    { key: "score", label: "Score", render: (r) => <span className={`font-bold ${r.score >= (selectedSession?.passingScore || 50) ? "text-emerald-600" : "text-red-500"}`}>{r.score}%</span> },
    { key: "passed", label: "Result", render: (r) => <Badge variant={r.score >= (selectedSession?.passingScore || 50) ? "success" : "danger"}>{r.score >= (selectedSession?.passingScore || 50) ? "Passed" : "Failed"}</Badge> },
    { key: "date", label: "Completed", render: (r) => r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "—" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Orientation Sessions" subtitle={`${sessions.length} sessions`}
          actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create Session</Button>} />

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sessions..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No orientation sessions found" />
        )}

        {/* Create Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Orientation Session" size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Session title" className="md:col-span-2" />
            <Select label="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}
              options={[{ value: "", label: "Select Course" }, ...courses.map(c => ({ value: c._id, label: c.title }))]} />
            <Input label="Scheduled Date" type="datetime-local" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
            <Input label="Duration (min)" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
            <Input label="Passing Score (%)" type="number" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })} />
            <Input label="Meeting Link" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://..." className="md:col-span-2" />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} loading={createLoading}>Create Session</Button>
            </div>
          </div>
        </Modal>

        {/* Attendance Modal */}
        <Modal open={showAttendance} onClose={() => setShowAttendance(false)} title={`Attendance — ${selectedSession?.title || ""}`} size="xl">
          <DataTable columns={attendanceCols} data={attendanceData} emptyMessage="No attendance records" />
        </Modal>

        {/* Quiz Results Modal */}
        <Modal open={showQuizResults} onClose={() => setShowQuizResults(false)} title={`Quiz Results — ${selectedSession?.title || ""}`} size="xl">
          <DataTable columns={quizCols} data={quizData} emptyMessage="No quiz attempts yet" />
        </Modal>
      </div>
    </AdminLayout>
  );
}
