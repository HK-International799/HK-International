import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Modal,
  Input,
  Select,
  Textarea,
} from "../../components/ui";
import {
  getAllCertificates,
  issueCertificate,
  revokeCertificate,
  deleteCertificate,
  downloadCertificatePDF,
  regenerateCertificatePDF,
  CERTIFICATE_TEMPLATES,
} from "../../services/certificateService";
import { getAllUsers } from "../../services/adminService";
import { getCourses } from "../../services/courseService";
import {
  Plus,
  Award,
  Trash2,
  Search,
  Ban,
  Download,
  RefreshCw,
} from "lucide-react";

const STATUS_VARIANT = {
  issued: "success",
  revoked: "danger",
  expired: "warning",
};

const emptyForm = {
  studentId: "",
  courseId: "",
  title: "",
  grade: "",
  score: "",
  templateKey: "classic",
  hasExpiry: false,
  expiryDate: "",
};

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showIssue, setShowIssue] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError, setIssueError] = useState("");

  // If issuing would duplicate an existing certificate for this
  // student/course, we surface it here instead of firing the request and
  // hitting a 409 — the unique {studentId, courseId} index is kept (see
  // build-prompt §3.4), so a duplicate is handled as an explicit reissue
  // confirmation rather than a second document.
  const [conflictCert, setConflictCert] = useState(null);

  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);

  const [regenLoadingId, setRegenLoadingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [ce, u, co] = await Promise.all([
        getAllCertificates(),
        getAllUsers(),
        getCourses(),
      ]);
      setCerts(Array.isArray(ce) ? ce : []);
      const userList = u?.users || (Array.isArray(u) ? u : []);
      setStudents(userList.filter((x) => x.role === "student"));
      setCourses(Array.isArray(co) ? co : co?.courses || []);
    } catch {}
  };

  const resetIssueModal = () => {
    setShowIssue(false);
    setForm(emptyForm);
    setConflictCert(null);
    setIssueError("");
  };

  const doIssue = async (reissue) => {
    try {
      setIssueLoading(true);
      setIssueError("");
      await issueCertificate({
        ...form,
        score: form.score ? Number(form.score) : undefined,
        expiryDate: form.hasExpiry ? form.expiryDate : undefined,
        reissue: reissue || undefined,
      });
      resetIssueModal();
      load();
    } catch (err) {
      setIssueError(err.response?.data?.message || "Error issuing certificate");
    } finally {
      setIssueLoading(false);
    }
  };

  const handleIssue = () => {
    if (!form.studentId || !form.courseId || !form.title) {
      setIssueError("Student, course, and title are required");
      return;
    }
    // Client-side duplicate pre-check using the certificate list already
    // loaded for this page — avoids a round-trip and lets us show the
    // existing certificate's details before the admin confirms a reissue.
    const existing = certs.find(
      (c) =>
        c.studentId?._id === form.studentId &&
        c.courseId?._id === form.courseId,
    );
    if (existing) {
      setConflictCert(existing);
      return;
    }
    doIssue(false);
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      setRevokeLoading(true);
      await revokeCertificate(revokeTarget._id, revokeReason);
      setRevokeTarget(null);
      setRevokeReason("");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error revoking certificate");
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this certificate? This cannot be undone.")) return;
    try {
      await deleteCertificate(id);
      load();
    } catch {}
  };

  const handleRegenerate = async (cert) => {
    try {
      setRegenLoadingId(cert._id);
      await regenerateCertificatePDF(cert._id);
      load();
    } catch (err) {
      alert(
        err.response?.data?.message || "Error regenerating certificate PDF",
      );
    } finally {
      setRegenLoadingId(null);
    }
  };

  const handleDownload = async (cert) => {
    try {
      const blob = await downloadCertificatePDF(cert._id);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${cert.certificateNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    }
  };

  const filtered = certs.filter(
    (c) =>
      c.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.certificateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "cert",
      label: "Certificate",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Award size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{r.title}</p>
            <p className="text-xs text-gray-400 font-mono">
              {r.certificateNumber}
            </p>
            {r.reissueCount > 0 && (
              <p className="text-[11px] text-indigo-500">
                Reissued ×{r.reissueCount}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "student",
      label: "Student",
      render: (r) => r.studentId?.name || "—",
    },
    { key: "course", label: "Course", render: (r) => r.courseId?.title || "—" },
    { key: "grade", label: "Grade", render: (r) => r.grade || "—" },
    {
      key: "score",
      label: "Score",
      render: (r) => (r.score != null ? `${r.score}%` : "—"),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        const status = r.displayStatus || r.status;
        return (
          <div>
            <Badge variant={STATUS_VARIANT[status] || "default"}>
              {status}
            </Badge>
            {status === "revoked" && r.revocationReason && (
              <p
                className="text-[11px] text-gray-400 mt-1 max-w-[160px] truncate"
                title={r.revocationReason}
              >
                {r.revocationReason}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "issuedAt",
      label: "Issued",
      render: (r) => new Date(r.issuedAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.status === "issued" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(r);
              }}
              className="p-1.5 rounded-lg hover:bg-blue-50"
              title="Download PDF"
            >
              <Download size={16} className="text-blue-600" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRegenerate(r);
            }}
            disabled={regenLoadingId === r._id}
            className="p-1.5 rounded-lg hover:bg-indigo-50 disabled:opacity-50"
            title="Regenerate PDF"
          >
            <RefreshCw
              size={16}
              className={`text-indigo-600 ${regenLoadingId === r._id ? "animate-spin" : ""}`}
            />
          </button>
          {r.status === "issued" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRevokeTarget(r);
                setRevokeReason("");
              }}
              className="p-1.5 rounded-lg hover:bg-yellow-50"
              title="Revoke"
            >
              <Ban size={16} className="text-yellow-600" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r._id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Certificates"
          subtitle={`${certs.length} issued`}
          actions={
            <Button onClick={() => setShowIssue(true)}>
              <Plus size={16} /> Issue Certificate
            </Button>
          }
        />

        <div className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certificates..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No certificates found"
        />

        {/* ── Issue / Reissue Modal ─────────────────────────────────────── */}
        <Modal
          open={showIssue}
          onClose={resetIssueModal}
          title={
            conflictCert ? "Certificate Already Exists" : "Issue Certificate"
          }
          size="lg"
        >
          {conflictCert ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                <strong>{conflictCert.studentId?.name}</strong> already has a
                certificate for <strong>{conflictCert.courseId?.title}</strong>{" "}
                ({conflictCert.certificateNumber}), currently{" "}
                <Badge
                  variant={
                    STATUS_VARIANT[
                      conflictCert.displayStatus || conflictCert.status
                    ]
                  }
                >
                  {conflictCert.displayStatus || conflictCert.status}
                </Badge>
                .
              </p>
              <p className="text-sm text-gray-600">
                Reissuing will update that existing certificate with the details
                below (title, grade, score, template, expiry), keep the same
                certificate number, reactivate it if it was revoked, and
                regenerate its PDF. This cannot create a second certificate.
              </p>
              {issueError && (
                <p className="text-xs text-red-500">{issueError}</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setConflictCert(null)}
                >
                  Back
                </Button>
                <Button onClick={() => doIssue(true)} loading={issueLoading}>
                  Confirm Reissue
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Certificate Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Course Completion"
                className="md:col-span-2"
              />
              <Select
                label="Student"
                value={form.studentId}
                onChange={(e) =>
                  setForm({ ...form, studentId: e.target.value })
                }
                options={[
                  { value: "", label: "Select Student" },
                  ...students.map((s) => ({
                    value: s._id,
                    label: `${s.name} (${s.email})`,
                  })),
                ]}
              />
              <Select
                label="Course"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                options={[
                  { value: "", label: "Select Course" },
                  ...courses.map((c) => ({ value: c._id, label: c.title })),
                ]}
              />
              <Input
                label="Grade"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="A, B, C..."
              />
              <Input
                label="Score (%)"
                type="number"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
              />
              <Select
                label="Template"
                value={form.templateKey}
                onChange={(e) =>
                  setForm({ ...form, templateKey: e.target.value })
                }
                options={CERTIFICATE_TEMPLATES}
              />
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2.5">
                  <input
                    type="checkbox"
                    checked={form.hasExpiry}
                    onChange={(e) =>
                      setForm({ ...form, hasExpiry: e.target.checked })
                    }
                  />
                  Certificate expires
                </label>
              </div>
              {form.hasExpiry && (
                <Input
                  label="Expiry Date"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm({ ...form, expiryDate: e.target.value })
                  }
                  className="md:col-span-2"
                />
              )}
              {issueError && (
                <p className="text-xs text-red-500 md:col-span-2">
                  {issueError}
                </p>
              )}
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={resetIssueModal}>
                  Cancel
                </Button>
                <Button onClick={handleIssue} loading={issueLoading}>
                  Issue Certificate
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Revoke Modal ──────────────────────────────────────────────── */}
        <Modal
          open={!!revokeTarget}
          onClose={() => setRevokeTarget(null)}
          title="Revoke Certificate"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Revoking <strong>{revokeTarget?.certificateNumber}</strong> for{" "}
              <strong>{revokeTarget?.studentId?.name}</strong> will mark it
              invalid on the public verification page. This can be undone later
              via reissue.
            </p>
            <Textarea
              label="Reason (shown on the public verification page)"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Issued in error, misconduct, course requirements not met..."
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setRevokeTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRevoke}
                loading={revokeLoading}
              >
                Revoke Certificate
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
