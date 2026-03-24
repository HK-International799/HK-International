import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Input, Select } from "../../components/ui";
import { getAllCertificates, issueCertificate, revokeCertificate, deleteCertificate } from "../../services/certificateService";
import { getAllUsers } from "../../services/adminService";
import { getCourses } from "../../services/courseService";
import { Plus, Award, Trash2, Search, Ban } from "lucide-react";

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showIssue, setShowIssue] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "", title: "", grade: "", score: "" });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [ce, u, co] = await Promise.all([getAllCertificates(), getAllUsers(), getCourses()]);
      setCerts(Array.isArray(ce) ? ce : []);
      const userList = Array.isArray(u) ? u : u.users || [];
      setStudents(userList.filter((x) => x.role === "student"));
      setCourses(Array.isArray(co) ? co : co.courses || []);
    } catch { }
  };

  const handleIssue = async () => {
    try { await issueCertificate(form); setShowIssue(false); setForm({ studentId: "", courseId: "", title: "", grade: "", score: "" }); load(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };
  const handleRevoke = async (id) => { if (!confirm("Revoke?")) return; try { await revokeCertificate(id); load(); } catch { } };
  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { await deleteCertificate(id); load(); } catch { } };

  const filtered = certs.filter((c) =>
    c.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "cert", label: "Certificate", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><Award size={18} className="text-success" /></div>
        <div><p className="font-medium text-gray-800">{r.title}</p><p className="text-xs text-gray-400 font-mono">{r.certificateNumber}</p></div>
      </div>
    )},
    { key: "student", label: "Student", render: (r) => r.studentId?.name || "—" },
    { key: "course", label: "Course", render: (r) => r.courseId?.title || "—" },
    { key: "grade", label: "Grade", render: (r) => r.grade || "—" },
    { key: "score", label: "Score", render: (r) => r.score ?? "—" },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "issued" ? "success" : "danger"}>{r.status}</Badge> },
    { key: "issuedAt", label: "Issued", render: (r) => new Date(r.issuedAt).toLocaleDateString() },
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1">
        {r.status === "issued" && <button onClick={(e) => { e.stopPropagation(); handleRevoke(r._id); }} className="p-1.5 rounded-lg hover:bg-yellow-50" title="Revoke"><Ban size={16} className="text-warning" /></button>}
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-danger" /></button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Certificates" subtitle={`${certs.length} issued`}
          actions={<Button onClick={() => setShowIssue(true)}><Plus size={16} /> Issue Certificate</Button>} />
        <div className="mb-4 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search certificates..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <DataTable columns={columns} data={filtered} />

        <Modal open={showIssue} onClose={() => setShowIssue(false)} title="Issue Certificate" size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Certificate Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Course Completion" className="md:col-span-2" />
            <Select label="Student" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              options={[{ value: "", label: "Select Student" }, ...students.map((s) => ({ value: s._id, label: `${s.name} (${s.email})` }))]} />
            <Select label="Course" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              options={[{ value: "", label: "Select Course" }, ...courses.map((c) => ({ value: c._id, label: c.title }))]} />
            <Input label="Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="A, B, C..." />
            <Input label="Score" type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowIssue(false)}>Cancel</Button>
              <Button onClick={handleIssue}>Issue Certificate</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
