

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Modal,
  Textarea,
  Select,
  Input,
} from "../../components/ui";
import {
  getAllRegistrations,
  processRegistration,
  exportRegistrationsCSV,
  confirmRegistrationPayment,
} from "../../services/registrationService";
import {
  approveRequestedCourse,
  rejectRequestedCourse,
} from "../../services/learnerProfileService";
import {
  ClipboardCheck,
  Search,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  IndianRupee,
} from "lucide-react";

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  completed: "primary",
  withdrawn: "default",
};
const paymentVariant = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
  verified: "primary",
};

export default function Registrations() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [showAction, setShowAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── Additive: Confirm Payment modal state ─────────────────────────────
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: "paid",
    amount: "",
    paymentMode: "bank_transfer",
    referenceNumber: "",
    notes: "",
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    load();
  }, [statusFilter, paymentFilter]);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      const data = await getAllRegistrations(params);
      const list = data.registrations || (Array.isArray(data) ? data : []);
      setRegistrations(list);
      setTotal(data.total || list.length);
    } catch {
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = registrations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.student?.name?.toLowerCase().includes(q) ||
      r.student?.email?.toLowerCase().includes(q) ||
      r.course?.title?.toLowerCase().includes(q) ||
      r.partnerInstitute?.name?.toLowerCase().includes(q)
    );
  });

  const openAction = (reg, type) => {
    setSelected(reg);
    setActionType(type);
    setRemarks("");
    setShowAction(true);
  };

  const openPayment = (reg) => {
    setSelected(reg);
    setPaymentForm({
      paymentStatus: "paid",
      amount: "",
      paymentMode: "bank_transfer",
      referenceNumber: "",
      notes: "",
    });
    setShowPayment(true);
  };

  const handleAction = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      await processRegistration(selected._id, { status: actionType, remarks });
      setShowAction(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setActionLoading(false);
    }
  };

  // Registration Requirement 3 — per-course decision on a candidate's
  // requested courses, independent of the overall registration approve/
  // reject action above. Only relevant when a candidate selected more
  // than one course at registration time.
  const [courseActionId, setCourseActionId] = useState(null);
  const handleApproveCourse = async (courseId) => {
    if (!selected) return;
    try {
      setCourseActionId(courseId);
      const updated = await approveRequestedCourse(selected._id, courseId);
      setSelected(updated.registration || selected);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error approving course");
    } finally {
      setCourseActionId(null);
    }
  };
  const handleRejectCourse = async (courseId) => {
    if (!selected) return;
    const reason = window.prompt("Reason for rejecting this course (optional):") || "";
    try {
      setCourseActionId(courseId);
      const updated = await rejectRequestedCourse(selected._id, courseId, reason);
      setSelected(updated || selected);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error rejecting course");
    } finally {
      setCourseActionId(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selected) return;
    try {
      setPaymentLoading(true);
      await confirmRegistrationPayment(selected._id, {
        paymentStatus: paymentForm.paymentStatus,
        notes: paymentForm.notes,
        recordPayment: Boolean(paymentForm.amount),
        amount: paymentForm.amount ? Number(paymentForm.amount) : undefined,
        paymentMode: paymentForm.paymentMode,
        referenceNumber: paymentForm.referenceNumber,
      });
      setShowPayment(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Error confirming payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportRegistrationsCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "registrations.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (r) => (
        <div className="space-y-1 min-w-[240px]">
          <p className="font-semibold text-gray-900">
            {r.student?.name || "—"}
          </p>

          <p className="text-xs text-gray-500">{r.student?.email}</p>

          <p className="text-xs text-gray-500">{r.student?.mobile}</p>

          <div className="mt-2 rounded bg-indigo-50 px-2 py-1">
            <span className="text-xs font-semibold text-indigo-700">
              Default Password
            </span>

            <p className="font-mono text-sm text-indigo-900">
              {r.defaultPassword || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      render: (r) => (
        <div className="space-y-1 min-w-[260px]">
          <p className="font-medium">{r.course?.title || "—"}</p>

          <p className="text-xs text-gray-500">
            Intake: {r.preferredIntake || "N/A"}
          </p>

          <p className="text-xs text-gray-500">Source: {r.source}</p>
        </div>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
      ),
    },
    {
      key: "payment",
      label: "Payment",
      render: (r) => (
        <div className="space-y-1">
          <Badge variant={paymentVariant[r.paymentStatus] || "default"}>
            {r.paymentStatus}
          </Badge>

          {r.paymentVerifiedAt && (
            <p className="text-xs text-gray-500">
              {new Date(r.paymentVerifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "lms",
      label: "LMS Access",
      render: (r) =>
        r.lmsAccessGranted ? (
          <Badge variant="success">Granted</Badge>
        ) : (
          <Badge variant="default">No</Badge>
        ),
    },
    {
      key: "orientation",
      label: "Orientation",
      render: (r) =>
        r.orientationCompleted ? (
          <Badge variant="success">Done</Badge>
        ) : (
          <Badge variant="default">Pending</Badge>
        ),
    },
    {
      key: "quiz",
      label: "Quiz",
      render: (r) =>
        r.quizPassed ? (
          <Badge variant="success">{r.quizScore}%</Badge>
        ) : (
          <Badge variant="default">—</Badge>
        ),
    },
    {
      key: "date",
      label: "Registered",
      render: (r) => (
        <div>
          <p>{new Date(r.createdAt).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {new Date(r.createdAt).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {r.paymentStatus !== "verified" && (
            <button
              onClick={() => openPayment(r)}
              className="p-1.5 rounded-lg hover:bg-indigo-50"
              title="Confirm Payment"
            >
              <IndianRupee size={16} className="text-indigo-600" />
            </button>
          )}
          {r.status === "pending" && (
            <>
              <button
                onClick={() => openAction(r, "approved")}
                className="p-1.5 rounded-lg hover:bg-emerald-50"
                title="Approve"
              >
                <CheckCircle size={16} className="text-emerald-600" />
              </button>
              <button
                onClick={() => openAction(r, "rejected")}
                className="p-1.5 rounded-lg hover:bg-red-50"
                title="Reject"
              >
                <XCircle size={16} className="text-red-500" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = registrations.filter(
    (r) => r.status === "pending",
  ).length;
  const paymentPendingCount = registrations.filter(
    (r) =>
      !r.paymentStatus ||
      r.paymentStatus === "unpaid" ||
      r.paymentStatus === "partial",
  ).length;
  const lmsActivatedCount = registrations.filter(
    (r) => r.lmsAccessGranted,
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Registrations"
          subtitle={`${total} total · ${pendingCount} pending approval · ${paymentPendingCount} payment pending`}
          actions={
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} /> Export CSV
            </Button>
          }
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, course, institute..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "completed", label: "Completed" },
            ]}
          />
          <Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            options={[
              { value: "", label: "All Payments" },
              { value: "unpaid", label: "Payment Pending" },
              { value: "partial", label: "Partially Paid" },
              { value: "paid", label: "Paid" },
              { value: "verified", label: "Verified" },
            ]}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Total", value: total, color: "text-gray-800" },
            { label: "Pending", value: pendingCount, color: "text-yellow-600" },
            {
              label: "Approved",
              value: registrations.filter((r) => r.status === "approved")
                .length,
              color: "text-emerald-600",
            },
            {
              label: "Rejected",
              value: registrations.filter((r) => r.status === "rejected")
                .length,
              color: "text-red-500",
            },
            {
              label: "Payment Pending",
              value: paymentPendingCount,
              color: "text-orange-600",
            },
            {
              label: "LMS Activated",
              value: lmsActivatedCount,
              color: "text-indigo-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-100 rounded-xl p-4"
            >
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="No registrations found"
            onRowClick={(r) =>
              r.student?._id && navigate(`/admin/learners/${r.student._id}`)
            }
          />
        )}

        <Modal
          open={showAction}
          onClose={() => setShowAction(false)}
          title={`${actionType === "approved" ? "Approve" : "Reject"} Registration`}
        >
          <div className="space-y-4">
            {selected && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm">
                  <strong>Student:</strong> {selected.student?.name} (
                  {selected.student?.email})
                </p>
                <p className="text-sm">
                  <strong>Course:</strong> {selected.course?.title}
                </p>
                {selected.partnerInstitute && (
                  <p className="text-sm">
                    <strong>Institute:</strong>{" "}
                    {selected.partnerInstitute?.name}
                  </p>
                )}
              </div>
            )}

            {/* Registration Requirement 3: when the candidate requested more
                than one course, let the admin decide each one independently
                — this never overwrites the original request. */}
            {selected?.requestedCourses?.length > 1 && (
              <div className="border border-gray-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                  Requested Courses ({selected.requestedCourses.length})
                </p>
                {selected.requestedCourses.map((rc) => {
                  const courseId = rc.course?._id || rc.course;
                  const courseTitle = rc.course?.title || String(courseId);
                  const isApproved = selected.approvedCourses?.some(
                    (ac) => String(ac.course?._id || ac.course) === String(courseId),
                  );
                  const isRejected = selected.rejectedCourses?.some(
                    (rj) => String(rj.course?._id || rj.course) === String(courseId),
                  );
                  return (
                    <div
                      key={String(courseId)}
                      className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
                    >
                      <span>{courseTitle}</span>
                      {isApproved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : isRejected ? (
                        <Badge variant="danger">Rejected</Badge>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            loading={courseActionId === courseId}
                            onClick={() => handleApproveCourse(courseId)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={courseActionId === courseId}
                            onClick={() => handleRejectCourse(courseId)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <Textarea
              label="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks for the student..."
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowAction(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === "approved" ? "success" : "danger"}
                onClick={handleAction}
                loading={actionLoading}
              >
                {actionType === "approved"
                  ? "Approve Registration"
                  : "Reject Registration"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* ── Additive: Confirm Payment Modal ─────────────────────────────── */}
        <Modal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          title="Confirm Payment"
        >
          <div className="space-y-4">
            {selected && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm">
                  <strong>Student:</strong> {selected.student?.name}
                </p>
                <p className="text-sm">
                  <strong>Course:</strong> {selected.course?.title}
                </p>
              </div>
            )}
            <Select
              label="Payment Status"
              value={paymentForm.paymentStatus}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, paymentStatus: e.target.value }))
              }
              options={[
                { value: "partial", label: "Partially Paid" },
                { value: "paid", label: "Fully Paid" },
                { value: "verified", label: "Verified" },
              ]}
            />
            <Input
              label="Amount Received (optional — records a payment entry)"
              type="number"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, amount: e.target.value }))
              }
            />
            <Select
              label="Payment Mode"
              value={paymentForm.paymentMode}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, paymentMode: e.target.value }))
              }
              options={[
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "upi", label: "UPI" },
                { value: "razorpay", label: "Razorpay" },
                { value: "cash", label: "Cash" },
                { value: "cheque", label: "Cheque" },
                { value: "wise", label: "Wise" },
                { value: "other", label: "Other" },
              ]}
            />
            <Input
              label="Reference Number"
              value={paymentForm.referenceNumber}
              onChange={(e) =>
                setPaymentForm((f) => ({
                  ...f,
                  referenceNumber: e.target.value,
                }))
              }
            />
            <Textarea
              label="Notes (optional)"
              value={paymentForm.notes}
              onChange={(e) =>
                setPaymentForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowPayment(false)}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleConfirmPayment}
                loading={paymentLoading}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
