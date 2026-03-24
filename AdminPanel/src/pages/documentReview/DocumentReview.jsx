import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, DataTable, Badge, Button, Modal, Input, Select, Textarea } from "../../components/ui";
import { getAllDocuments, reviewDocument, deleteDocument, uploadDocument } from "../../services/documentService";
import { Plus, FileText, Trash2, Check, X, Eye, Search } from "lucide-react";

export default function DocumentReview() {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showReview, setShowReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: "approved", reviewNotes: "" });
  const [uploadForm, setUploadForm] = useState({ title: "", description: "", fileUrl: "" });

  useEffect(() => { load(); }, []);
  const load = async () => { try { const d = await getAllDocuments(); setDocs(Array.isArray(d) ? d : []); } catch { } };

  const handleReview = async () => {
    try { await reviewDocument(showReview._id, reviewForm); setShowReview(null); load(); } catch { }
  };
  const handleUpload = async () => {
    try { await uploadDocument(uploadForm); setShowUpload(false); setUploadForm({ title: "", description: "", fileUrl: "" }); load(); } catch { }
  };
  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { await deleteDocument(id); load(); } catch { } };

  const filtered = docs.filter((d) => {
    const matchSearch = d.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = { pending: "warning", "under-review": "primary", approved: "success", rejected: "danger" };

  const columns = [
    { key: "title", label: "Document", render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><FileText size={18} className="text-accent" /></div>
        <div><p className="font-medium text-gray-800">{r.title}</p><p className="text-xs text-gray-400">{r.originalName || r.fileType || "—"}</p></div>
      </div>
    )},
    { key: "uploadedBy", label: "Uploaded By", render: (r) => r.uploadedBy?.name || "—" },
    { key: "course", label: "Course", render: (r) => r.courseId?.title || "—" },
    { key: "status", label: "Status", render: (r) => <Badge variant={statusColor[r.status]}>{r.status}</Badge> },
    { key: "createdAt", label: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1">
        {r.status === "pending" && <button onClick={(e) => { e.stopPropagation(); setShowReview(r); setReviewForm({ status: "approved", reviewNotes: "" }); }} className="p-1.5 rounded-lg hover:bg-green-50"><Check size={16} className="text-success" /></button>}
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-danger" /></button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Document Review" subtitle={`${docs.length} documents`}
          actions={<Button onClick={() => setShowUpload(true)}><Plus size={16} /> Upload Document</Button>} />
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{s}</button>
            ))}
          </div>
        </div>
        <DataTable columns={columns} data={filtered} />

        <Modal open={!!showReview} onClose={() => setShowReview(null)} title="Review Document">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Reviewing: <strong>{showReview?.title}</strong></p>
            <Select label="Decision" value={reviewForm.status} onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
              options={[{ value: "approved", label: "Approve" }, { value: "rejected", label: "Reject" }, { value: "under-review", label: "Under Review" }]} />
            <Textarea label="Notes" value={reviewForm.reviewNotes} onChange={(e) => setReviewForm({ ...reviewForm, reviewNotes: e.target.value })} />
            <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setShowReview(null)}>Cancel</Button><Button onClick={handleReview}>Submit Review</Button></div>
          </div>
        </Modal>

        <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
          <div className="space-y-4">
            <Input label="Title" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} />
            <Input label="File URL" value={uploadForm.fileUrl} onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })} placeholder="Cloudinary / S3 URL" />
            <Textarea label="Description" value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} />
            <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button><Button onClick={handleUpload}>Upload</Button></div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
