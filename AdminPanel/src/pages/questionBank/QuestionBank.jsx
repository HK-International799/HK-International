import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Input, Select, Textarea } from "../../components/ui";
import { getAllQuestionBanks, createQuestionBank, deleteQuestionBank, getQuestionBankById, addQuestionToBank, removeQuestionFromBank } from "../../services/questionBankService";
import { getCourses } from "../../services/courseService";
import { Plus, Database, Trash2, Eye, Search, HelpCircle } from "lucide-react";

export default function QuestionBank() {
  const [banks, setBanks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showAddQ, setShowAddQ] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", courseId: "", category: "General", difficulty: "medium", tags: "" });
  const [qForm, setQForm] = useState({ type: "mcq", prompt: "", options: ["", "", "", ""], correctAnswer: "", marks: 1 });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [b, c] = await Promise.all([getAllQuestionBanks(), getCourses()]);
      setBanks(Array.isArray(b) ? b : []);
      setCourses(Array.isArray(c) ? c : c.courses || []);
    } catch { }
  };

  const handleCreate = async () => {
    try {
      const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      await createQuestionBank(payload); setShowCreate(false);
      setForm({ name: "", description: "", courseId: "", category: "General", difficulty: "medium", tags: "" });
      load();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { await deleteQuestionBank(id); load(); } catch { } };

  const openDetail = async (bank) => {
    try { const full = await getQuestionBankById(bank._id); setShowDetail(full); } catch { setShowDetail(bank); }
  };

  const handleAddQuestion = async () => {
    try {
      const payload = { ...qForm, options: qForm.type === "mcq" ? qForm.options.filter(Boolean) : [] };
      await addQuestionToBank(showDetail._id, payload);
      const updated = await getQuestionBankById(showDetail._id);
      setShowDetail(updated);
      setShowAddQ(false);
      setQForm({ type: "mcq", prompt: "", options: ["", "", "", ""], correctAnswer: "", marks: 1 });
      load();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleRemoveQ = async (qId) => {
    try {
      await removeQuestionFromBank(showDetail._id, qId);
      const updated = await getQuestionBankById(showDetail._id);
      setShowDetail(updated);
      load();
    } catch { }
  };

  const filtered = banks.filter((b) => b.name?.toLowerCase().includes(search.toLowerCase()));
  const diffColor = { easy: "success", medium: "warning", hard: "danger" };

  const columns = [
    { key: "name", label: "Bank", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Database size={18} className="text-primary" /></div>
        <div><p className="font-medium text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.courseId?.title || "General"}</p></div>
      </div>
    )},
    { key: "category", label: "Category" },
    { key: "difficulty", label: "Difficulty", render: (r) => <Badge variant={diffColor[r.difficulty]}>{r.difficulty}</Badge> },
    { key: "questions", label: "Questions", render: (r) => r.questions?.length || 0 },
    { key: "tags", label: "Tags", render: (r) => (
      <div className="flex flex-wrap gap-1">{(r.tags || []).slice(0, 3).map((t) => <Badge key={t} variant="default">{t}</Badge>)}</div>
    )},
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); openDetail(r); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye size={16} className="text-gray-500" /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-danger" /></button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Question Bank" subtitle={`${banks.length} banks`}
          actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create Bank</Button>} />
        <div className="mb-4 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search banks..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <DataTable columns={columns} data={filtered} onRowClick={openDetail} />

        {/* Create Bank */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Question Bank" size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Bank Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="md:col-span-2" />
            <Select label="Course (optional)" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              options={[{ value: "", label: "General" }, ...courses.map((c) => ({ value: c._id, label: c.title }))]} />
            <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              options={[{ value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" }]} />
            <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="math, algebra" />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2" />
            <div className="md:col-span-2 flex justify-end gap-3 pt-2"><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></div>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal open={!!showDetail} onClose={() => { setShowDetail(null); setShowAddQ(false); }} title={showDetail?.name || ""} size="xl">
          {showDetail && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{showDetail.questions?.length || 0} questions</p>
                <Button size="sm" onClick={() => setShowAddQ(true)}><Plus size={14} /> Add Question</Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(showDetail.questions || []).map((q, i) => (
                  <div key={q._id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={q.type === "mcq" ? "primary" : q.type === "text" ? "accent" : "warning"}>{q.type}</Badge>
                          <span className="text-xs text-gray-400">{q.marks} marks</span>
                        </div>
                        <p className="text-sm text-gray-800">{q.prompt}</p>
                        {q.type === "mcq" && q.options?.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-1">
                            {q.options.map((opt, j) => (
                              <p key={j} className={`text-xs px-2 py-1 rounded ${opt === q.correctAnswer ? "bg-success/10 text-success font-medium" : "text-gray-500"}`}>
                                {String.fromCharCode(65 + j)}. {opt}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleRemoveQ(q._id)} className="p-1 rounded hover:bg-red-50"><Trash2 size={14} className="text-danger" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {showAddQ && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <h4 className="font-medium text-gray-700">Add New Question</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select label="Type" value={qForm.type} onChange={(e) => setQForm({ ...qForm, type: e.target.value })}
                      options={[{ value: "mcq", label: "MCQ" }, { value: "text", label: "Text" }, { value: "file", label: "File" }]} />
                    <Input label="Marks" type="number" value={qForm.marks} onChange={(e) => setQForm({ ...qForm, marks: e.target.value })} />
                  </div>
                  <Textarea label="Question Prompt" value={qForm.prompt} onChange={(e) => setQForm({ ...qForm, prompt: e.target.value })} />
                  {qForm.type === "mcq" && (
                    <div className="grid grid-cols-2 gap-3">
                      {qForm.options.map((opt, i) => (
                        <Input key={i} label={`Option ${String.fromCharCode(65 + i)}`} value={opt}
                          onChange={(e) => { const opts = [...qForm.options]; opts[i] = e.target.value; setQForm({ ...qForm, options: opts }); }} />
                      ))}
                      <Input label="Correct Answer" value={qForm.correctAnswer} onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })} placeholder="Exact match with option" className="col-span-2" />
                    </div>
                  )}
                  <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setShowAddQ(false)}>Cancel</Button><Button onClick={handleAddQuestion}>Add Question</Button></div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
