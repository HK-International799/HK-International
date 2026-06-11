import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Button, EmptyState } from "../../components/ui";
import { getLearnerFinanceOverview } from "../../services/financeService";
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle,
  ExternalLink, Plus,
} from "lucide-react";

const fmt = (n, cur = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n || 0);

const STATUS_STYLE = {
  fully_paid:      { cls: "bg-green-100 text-green-700",   icon: CheckCircle2, label: "Fully Paid" },
  part_payment:    { cls: "bg-yellow-100 text-yellow-700", icon: Clock,        label: "Part Payment" },
  balance_pending: { cls: "bg-orange-100 text-orange-700", icon: AlertCircle,  label: "Balance Pending" },
  not_paid:        { cls: "bg-red-100 text-red-700",       icon: AlertCircle,  label: "Not Paid" },
  refund_issued:   { cls: "bg-purple-100 text-purple-700", icon: Clock,        label: "Refund Issued" },
  adjustment:      { cls: "bg-blue-100 text-blue-700",     icon: Clock,        label: "Adjustment" },
};

const MODE_LABELS = {
  razorpay: "Razorpay", upi: "UPI", bank_transfer: "Bank Transfer",
  wise: "Wise", cash: "Cash", cheque: "Cheque", other: "Other",
};

export default function LearnerPaymentProfile() {
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCourse, setOpenCourse] = useState(null);

  useEffect(() => {
    getLearnerFinanceOverview(userId)
      .then((d) => setData(d.data || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading)
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </AdminLayout>
    );

  if (!data)
    return (
      <AdminLayout>
        <EmptyState title="Learner not found" />
      </AdminLayout>
    );

  const { learner, courses = [], totals } = data;

  return (
    <AdminLayout>
      <div className="animate-fadeIn space-y-6">

        {/* Header */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <PageHeader
              title={learner.name}
              subtitle={`${learner.email}${learner.mobile ? " · " + learner.mobile : ""}`}
              actions={
                <Button onClick={() => navigate(`/admin/finance/record?learnerId=${userId}`)}>
                  <Plus size={15} />
                  Record Payment
                </Button>
              }
            />
          </div>
        </div>

        {/* Grand Total Summary */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard
            label="Total Fees"
            value={fmt(totals?.grandTotalFee)}
            color="text-gray-800"
            bg="bg-white"
          />
          <SummaryCard
            label="Total Paid"
            value={fmt(totals?.grandTotalPaid)}
            color="text-green-700"
            bg="bg-green-50"
          />
          <SummaryCard
            label="Outstanding"
            value={fmt(totals?.grandBalance)}
            color={totals?.grandBalance > 0 ? "text-red-600" : "text-green-700"}
            bg={totals?.grandBalance > 0 ? "bg-red-50" : "bg-green-50"}
          />
        </div>

        {/* Per-Course Breakdown */}
        {courses.length === 0 ? (
          <EmptyState title="No payment records found for this learner" />
        ) : (
          <div className="space-y-4">
            {courses.map((c) => {
              const cid    = c.course?._id?.toString() || c.course?.toString();
              const isOpen = openCourse === cid;
              const s      = STATUS_STYLE[c.status] || STATUS_STYLE["balance_pending"];
              const Icon   = s.icon;

              return (
                <div
                  key={cid}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Course header */}
                  <button
                    onClick={() => setOpenCourse(isOpen ? null : cid)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Icon size={16} className={s.cls.includes("green") ? "text-green-600" : "text-indigo-600"} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{c.course?.title || "Unknown Course"}</p>
                        <p className="text-xs text-gray-400">
                          {c.paymentCount} payment{c.paymentCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-gray-400">Paid / Fee</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {fmt(c.totalPaid)} / {fmt(c.totalCourseFee)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Balance</p>
                        <p className={`text-sm font-bold ${c.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                          {c.balance > 0 ? `−${fmt(c.balance)}` : "Cleared"}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                  </button>

                  {/* Installment timeline */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      {c.payments?.length === 0 ? (
                        <p className="text-sm text-gray-400">No installment records.</p>
                      ) : (
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                          <div className="space-y-4 pl-6">
                            {c.payments.map((p, idx) => (
                              <div key={p._id} className="relative">
                                {/* Dot */}
                                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />

                                <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-800">
                                        {fmt(p.amount, p.currency)}
                                        <span className="ml-2 text-xs font-normal text-gray-400">
                                          Installment #{idx + 1}
                                        </span>
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {p.paymentDate
                                          ? new Date(p.paymentDate).toLocaleDateString("en-GB", {
                                              day: "2-digit", month: "short", year: "numeric",
                                            })
                                          : "—"}{" "}
                                        · {MODE_LABELS[p.paymentMode] || p.paymentMode}
                                        {p.referenceNumber && ` · Ref: ${p.referenceNumber}`}
                                      </p>
                                      {p.remarks && (
                                        <p className="text-xs text-gray-400 italic mt-0.5">{p.remarks}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                          STATUS_STYLE[p.status]?.cls || "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {STATUS_STYLE[p.status]?.label || p.status}
                                      </span>
                                      {p.proofUrl && (
                                        <a
                                          href={p.proofUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-indigo-500 hover:text-indigo-700"
                                          title="View proof"
                                        >
                                          <ExternalLink size={13} />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function SummaryCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} border border-gray-100 rounded-2xl p-4 shadow-sm`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
