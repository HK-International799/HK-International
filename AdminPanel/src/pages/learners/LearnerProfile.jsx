import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Badge, EmptyState, Button } from "../../components/ui";
import {
  getLearnerProfile,
  exportLearnerHistory,
  approveRequestedCourse,
  rejectRequestedCourse,
} from "../../services/learnerProfileService";
import { getLearnerDispatchHistory } from "../../services/dispatchService";
import {
  ArrowLeft,
  User,
  BookOpen,
  Wallet,
  ClipboardList,
  FileQuestion,
  Brain,
  Award,
  FolderOpen,
  CalendarCheck,
  Activity,
  PackageOpen,
  Download,
  Loader2,
} from "lucide-react";

const fmt = (n, cur = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: cur || "GBP",
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "courses", label: "Courses", icon: BookOpen },
  { key: "payments", label: "Payments", icon: Wallet },
  { key: "assignments", label: "Assignments", icon: ClipboardList },
  { key: "exams", label: "Exams", icon: FileQuestion },
  { key: "scenarioExams", label: "Scenario Exams", icon: Brain },
  { key: "certificates", label: "Certificates", icon: Award },
  { key: "dispatch", label: "Certificate Dispatch", icon: PackageOpen },
  { key: "documents", label: "Documents", icon: FolderOpen },
  { key: "attendance", label: "Attendance", icon: CalendarCheck },
  { key: "timeline", label: "Activity Timeline", icon: Activity },
];

export default function LearnerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const handleExport = async () => {
    setExporting(true);
    setExportError("");
    try {
      await exportLearnerHistory(id);
    } catch (err) {
      setExportError(
        err?.response?.data?.message || "Failed to export candidate history",
      );
    } finally {
      setExporting(false);
    }
  };

  // Extracted so ProfileTab can trigger a refresh after a per-course
  // approve/reject action without duplicating the fetch logic.
  const loadProfile = () => {
    setLoading(true);
    return getLearnerProfile(id)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <EmptyState title="Learner not found" />
      </AdminLayout>
    );
  }

  const {
    profile,
    registrations,
    courses,
    payments,
    assignments,
    exams,
    scenarioExams,
    certificates,
    documents,
    attendance,
    activityTimeline,
  } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/learners")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Back to Learners
          </button>
          <div className="flex flex-col items-end gap-1">
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {exporting ? "Exporting…" : "Export Candidate Details"}
            </Button>
            {exportError && (
              <p className="text-xs text-red-500">{exportError}</p>
            )}
          </div>
        </div>

        {/* ── Section 1: Profile header ───────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold overflow-hidden">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.firstName?.charAt(0) ||
              profile.fullName?.charAt(0) ||
              profile.name?.charAt(0) ||
              "?"
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">First Name</p>
                  <p className="font-semibold text-gray-800">
                    {profile.firstName || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Middle Name</p>
                  <p className="font-semibold text-gray-800">
                    {profile.middleName || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Last Name</p>
                  <p className="font-semibold text-gray-800">
                    {profile.lastName || "—"}
                  </p>
                </div>
              </div>
              <Badge variant={profile.isFirstLogin ? "warning" : "success"}>
                {profile.isFirstLogin ? "Never logged in" : "Active"}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {profile.email} · {profile.mobile}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
              <Info
                label="Date of Birth"
                value={fmtDate(profile.dateOfBirth)}
              />
              <Info label="Country" value={profile.country || "—"} />
              <Info
                label="Registered"
                value={fmtDate(profile.registrationDate)}
              />
              <Info
                label="Last Login"
                value={fmtDateTime(profile.lastLoginAt)}
              />
            </div>
            {(profile.fullAddress || profile.address) && (
              <p className="text-xs text-gray-400 mt-3">
                {profile.fullAddress || profile.address}
              </p>
            )}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 pb-px">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ──────────────────────────────────────────────────── */}
        {tab === "profile" && (
          <ProfileTab
            profile={profile}
            registrations={registrations}
            courses={courses}
            onRefresh={loadProfile}
          />
        )}
        {tab === "courses" && (
          <CoursesTab courses={courses} registrations={registrations} />
        )}
        {tab === "payments" && <PaymentsTab payments={payments} />}
        {tab === "assignments" && <AssignmentsTab assignments={assignments} />}
        {tab === "exams" && <ExamsTab exams={exams} />}
        {tab === "scenarioExams" && (
          <ScenarioExamsTab scenarioExams={scenarioExams} />
        )}
        {tab === "certificates" && (
          <CertificatesTab certificates={certificates} />
        )}
        {tab === "dispatch" && <DispatchTab learnerId={id} />}
        {tab === "documents" && <DocumentsTab documents={documents} />}
        {tab === "attendance" && <AttendanceTab attendance={attendance} />}
        {tab === "timeline" && <TimelineTab timeline={activityTimeline} />}
      </div>
    </AdminLayout>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-700">{value}</p>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      {children}
    </div>
  );
}

function ProfileTab({ profile, registrations, courses, onRefresh }) {
  const [courseActionId, setCourseActionId] = useState(null);

  // Lookup map so we can resolve a course's title even when
  // requestedCourses/approvedCourses only carry the raw ObjectId.
  const courseTitleById = new Map(
    (courses || []).map((c) => [String(c._id), c.title]),
  );

  const resolveCourseTitle = (courseRef) => {
    const courseId = courseRef?._id || courseRef;
    return (
      courseRef?.title ||
      courseTitleById.get(String(courseId)) ||
      "Untitled course"
    );
  };

  const handleApproveCourse = async (registrationId, courseId) => {
    try {
      setCourseActionId(courseId);
      await approveRequestedCourse(registrationId, courseId);
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || "Error approving course");
    } finally {
      setCourseActionId(null);
    }
  };

  const handleRejectCourse = async (registrationId, courseId) => {
    const reason =
      window.prompt("Reason for rejecting this course (optional):") || "";
    try {
      setCourseActionId(courseId);
      await rejectRequestedCourse(registrationId, courseId, reason);
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || "Error rejecting course");
    } finally {
      setCourseActionId(null);
    }
  };

  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">Registration History</h3>
      {!registrations?.length ? (
        <EmptyState title="No registrations found" />
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <div
              key={r._id}
              className="border border-gray-100 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{r.course?.title}</p>
                  <p className="text-xs text-gray-400">
                    {r.batch?.name ? `Batch: ${r.batch.name} · ` : ""}Submitted{" "}
                    {fmtDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      {
                        pending: "warning",
                        approved: "success",
                        rejected: "danger",
                      }[r.status] || "default"
                    }
                  >
                    {r.status}
                  </Badge>
                  <Badge
                    variant={
                      {
                        unpaid: "danger",
                        partial: "warning",
                        paid: "success",
                        verified: "primary",
                      }[r.paymentStatus] || "default"
                    }
                  >
                    {r.paymentStatus || "unpaid"}
                  </Badge>
                </div>
              </div>

              {/* Per-course approve/reject — available any time, independent
                  of the overall registration status. Only shown when the
                  candidate requested more than one course. */}
              {r.requestedCourses?.length > 1 && (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500">
                    Requested Courses ({r.requestedCourses.length})
                  </p>
                  {r.requestedCourses.map((rc) => {
                    const courseId = rc.course?._id || rc.course;
                    const courseTitle = resolveCourseTitle(rc.course);
                    const isApproved = r.approvedCourses?.some(
                      (ac) =>
                        String(ac.course?._id || ac.course) ===
                        String(courseId),
                    );
                    const isRejected = r.rejectedCourses?.some(
                      (rj) =>
                        String(rj.course?._id || rj.course) ===
                        String(courseId),
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
                              onClick={() =>
                                handleApproveCourse(r._id, courseId)
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              loading={courseActionId === courseId}
                              onClick={() =>
                                handleRejectCourse(r._id, courseId)
                              }
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
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function CoursesTab({ courses, registrations }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">Enrolled Courses</h3>
      {!courses?.length ? (
        <EmptyState title="No enrolled courses yet" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((c) => {
            const reg = registrations?.find(
              (r) => String(r.course?._id) === String(c._id),
            );
            return (
              <div
                key={c._id}
                className="border border-gray-100 rounded-xl p-4"
              >
                <p className="font-medium text-gray-800">{c.title}</p>
                <p className="text-xs text-gray-400 mt-1">{c.status}</p>
                {c.progress && (
                  <p className="text-xs text-gray-500 mt-2">
                    {c.progress.completedChapters} chapter(s) completed
                  </p>
                )}
                {reg?.lmsAccessGranted && (
                  <Badge variant="success">LMS Access Granted</Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function PaymentsTab({ payments }) {
  const list = payments?.installments || [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="text-xs text-gray-400">Total Fee</p>
          <p className="text-xl font-bold text-gray-800">
            {fmt(payments?.totalFee)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-400">Paid</p>
          <p className="text-xl font-bold text-emerald-600">
            {fmt(payments?.totalPaid)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-400">Pending</p>
          <p className="text-xl font-bold text-orange-500">
            {fmt(payments?.pending)}
          </p>
        </Card>
      </div>
      <Card>
        <h3 className="font-semibold text-gray-700 mb-4">
          Installments / Receipts
        </h3>
        {!list.length ? (
          <EmptyState title="No payments recorded yet" />
        ) : (
          <div className="space-y-2">
            {list.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between border border-gray-100 rounded-xl p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {fmt(p.amount, p.currency)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {p.paymentMode} · {fmtDate(p.paymentDate)}{" "}
                    {p.referenceNumber ? `· Ref: ${p.referenceNumber}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{p.status}</Badge>
                  {p.receiptUrl && (
                    <a
                      href={p.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 text-xs underline"
                    >
                      Receipt
                    </a>
                  )}
                  {p.invoiceUrl && (
                    <a
                      href={p.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 text-xs underline"
                    >
                      Invoice
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function AssignmentsTab({ assignments }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">
        Assignments &amp; Assessments
      </h3>
      {!assignments?.length ? (
        <EmptyState title="No assignment submissions yet" />
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-3 text-sm"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {a.assignmentId?.title || "Assignment"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                    {(a.assignmentId?.assessmentType || "general").replace(
                      /_/g,
                      " ",
                    )}
                  </span>
                  {a.resubmissionCount > 0 && (
                    <span className="text-[11px] text-orange-500">
                      Resubmitted ×{a.resubmissionCount}
                    </span>
                  )}
                  {a.aiDraft?.generatedAt && (
                    <span className="text-[11px] text-indigo-500">
                      AI Reviewed
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>
                  Score: {a.totalScore ?? "—"} /{" "}
                  {a.assignmentId?.totalMarks ?? "—"}
                </span>
                {a.passFail && a.passFail !== "pending" && (
                  <Badge variant={a.passFail === "pass" ? "success" : "danger"}>
                    {a.passFail === "pass" ? "Pass" : "Fail"}
                  </Badge>
                )}
                {a.approvalStatus === "approved" && (
                  <Badge variant="success">Approved</Badge>
                )}
                {a.approvalStatus === "pending" && (
                  <Badge variant="warning">Pending Approval</Badge>
                )}
                <Badge variant={a.gradedAt ? "success" : "warning"}>
                  {a.gradedAt ? "Graded" : "Pending"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ExamsTab({ exams }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">Exam History</h3>
      {!exams?.length ? (
        <EmptyState title="No exam attempts yet" />
      ) : (
        <div className="space-y-2">
          {exams.map((e) => (
            <div
              key={e._id}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-3 text-sm"
            >
              <p className="font-medium text-gray-800">
                {e.examId?.title || "Exam"}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Score: {e.totalScore ?? "—"}</span>
                <Badge
                  variant={
                    {
                      graded: "success",
                      submitted: "primary",
                      "in-progress": "warning",
                    }[e.status] || "default"
                  }
                >
                  {e.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ScenarioExamsTab({ scenarioExams }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">
        Scenario Exam Attempts
      </h3>
      {!scenarioExams?.length ? (
        <EmptyState title="No scenario exam attempts yet" />
      ) : (
        <div className="space-y-2">
          {scenarioExams.map((s) => {
            const totalMarks = s.answers?.reduce(
              (sum, a) =>
                sum +
                a.subAnswers.reduce(
                  (s2, sa) => s2 + (sa.marksObtained || 0),
                  0,
                ),
              0,
            );
            return (
              <div
                key={s._id}
                className="flex items-center justify-between border border-gray-100 rounded-xl p-3 text-sm"
              >
                <p className="font-medium text-gray-800">
                  {s.examId?.title || "Scenario Exam"}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>AI/Reviewer Score: {totalMarks ?? "—"}</span>
                  <span>{fmtDate(s.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function CertificatesTab({ certificates }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">Certificates</h3>
      {!certificates?.length ? (
        <EmptyState title="No certificates issued yet" />
      ) : (
        <div className="space-y-2">
          {certificates.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-3 text-sm"
            >
              <div>
                <p className="font-medium text-gray-800">{c.title}</p>
                <p className="text-xs text-gray-400">
                  {c.courseId?.title} · Issued {fmtDate(c.issuedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={c.status === "issued" ? "success" : "danger"}>
                  {c.status}
                </Badge>
                {c.fileUrl && (
                  <a
                    href={c.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 text-xs underline"
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function DispatchTab({ learnerId }) {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    getLearnerDispatchHistory(learnerId)
      .then((d) => setHistory(d.data || d || []))
      .catch(() => setHistory([]));
  }, [learnerId]);

  const STATUS_STYLE = {
    pending: "bg-amber-50 text-amber-700",
    packed: "bg-indigo-50 text-indigo-600",
    dispatched: "bg-sky-50 text-sky-700",
    in_transit: "bg-blue-50 text-blue-700",
    delivered: "bg-emerald-50 text-emerald-600",
    returned: "bg-orange-100 text-orange-700",
    cancelled: "bg-red-50 text-red-600",
    postponed: "bg-gray-100 text-gray-600",
    lost: "bg-red-100 text-red-700",
    redispatched: "bg-purple-50 text-purple-700",
  };

  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">
        Certificate Dispatch History
      </h3>
      {history === null ? (
        <EmptyState title="Loading dispatch history..." />
      ) : history.length === 0 ? (
        <EmptyState title="No certificates dispatched yet" />
      ) : (
        <div className="space-y-2">
          {history.map((h) => (
            <div
              key={h.certificateId}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-3 text-sm"
            >
              <div>
                <p className="font-medium text-gray-800 font-mono">
                  {h.certificateNumber}
                </p>
                <p className="text-xs text-gray-400">
                  {h.course} · Batch {h.batch || "—"} · Tracking{" "}
                  {h.trackingNumber || "—"}
                </p>
                {h.remarks && (
                  <p className="text-xs text-gray-400 mt-0.5">{h.remarks}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-right">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[h.dispatchStatus] || "bg-gray-100 text-gray-600"}`}
                >
                  {h.dispatchStatus?.replace("_", " ")}
                </span>
                <p className="text-xs text-gray-400">
                  {fmtDate(h.dispatchDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function DocumentsTab({ documents }) {
  const downloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url);

      const blob = await response.blob();

      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);

      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">Uploaded Documents</h3>

      {!documents?.length ? (
        <EmptyState title="No documents uploaded yet" />
      ) : (
        <div className="space-y-2">
          {documents.map((d) => (
            <div
              key={d._id}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-3 text-sm"
            >
              <div>
                <p className="font-medium text-gray-800">{d.title}</p>
                <p className="text-xs text-gray-400">{d.category}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    {
                      approved: "success",
                      rejected: "danger",
                      "under-review": "warning",
                    }[d.status] || "default"
                  }
                >
                  {d.status}
                </Badge>

                <button
                  onClick={() =>
                    downloadFile(
                      d.fileUrl,
                      d.originalName || `${d.title}.${d.extension}`,
                    )
                  }
                  className="text-indigo-600 text-xs underline"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function AttendanceTab({ attendance }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">Attendance</h3>
      {!attendance?.length ? (
        <EmptyState title="No attendance records yet" />
      ) : (
        <div className="space-y-2">
          {attendance.map((a) => (
            <div
              key={a._id}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-3 text-sm"
            >
              <span className="text-gray-600">{fmtDate(a.markedAt)}</span>
              <Badge
                variant={
                  { present: "success", late: "warning", absent: "danger" }[
                    a.status
                  ] || "default"
                }
              >
                {a.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TimelineTab({ timeline }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-700 mb-4">Activity Timeline</h3>
      {!timeline?.length ? (
        <EmptyState title="No activity recorded yet" />
      ) : (
        <ol className="relative border-l border-gray-200 ml-2 space-y-5">
          {timeline.map((t, i) => (
            <li key={i} className="ml-4">
              <div className="absolute w-2.5 h-2.5 bg-indigo-500 rounded-full -left-[5px] mt-1.5" />
              <p className="text-sm text-gray-800">{t.label}</p>
              <p className="text-xs text-gray-400">{fmtDateTime(t.date)}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
