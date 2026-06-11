import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Button, EmptyState } from "../../components/ui";
import {
  getRevenueReport,
  getPendingReport,
  exportPaymentsCSV,
} from "../../services/financeService";
import { Download, TrendingUp, AlertCircle } from "lucide-react";

const fmt = (n, cur = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n || 0);

const MODE_LABELS = {
  razorpay: "Razorpay", upi: "UPI", bank_transfer: "Bank Transfer",
  wise: "Wise", cash: "Cash", cheque: "Cheque", other: "Other",
};

export default function FinanceReports() {
  const [tab, setTab] = useState("revenue");

  // Revenue filters
  const [revFilters, setRevFilters] = useState({ dateFrom: "", dateTo: "" });
  const [revData,    setRevData]    = useState(null);
  const [revLoading, setRevLoading] = useState(false);

  // Pending data
  const [pendData,    setPendData]    = useState(null);
  const [pendLoading, setPendLoading] = useState(false);

  const loadRevenue = async () => {
    setRevLoading(true);
    try {
      const params = {};
      if (revFilters.dateFrom) params.dateFrom = revFilters.dateFrom;
      if (revFilters.dateTo)   params.dateTo   = revFilters.dateTo;
      const res = await getRevenueReport(params);
      setRevData(res.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      setRevLoading(false);
    }
  };

  const loadPending = async () => {
    setPendLoading(true);
    try {
      const res = await getPendingReport();
      setPendData(res.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      setPendLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "revenue") loadRevenue();
    if (tab === "pending") loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <AdminLayout>
      <div className="animate-fadeIn space-y-5">
        <PageHeader title="Finance Reports" subtitle="Revenue and outstanding payment analysis" />

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: "revenue", label: "Revenue Report",  icon: TrendingUp },
            { key: "pending", label: "Pending Payments",icon: AlertCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === key
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Revenue Report ───────────────────────────────────────── */}
        {tab === "revenue" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-400 mb-1">From</label>
                <input
                  type="date"
                  value={revFilters.dateFrom}
                  onChange={(e) => setRevFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">To</label>
                <input
                  type="date"
                  value={revFilters.dateTo}
                  onChange={(e) => setRevFilters((f) => ({ ...f, dateTo: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <Button onClick={loadRevenue} disabled={revLoading}>
                {revLoading ? "Loading..." : "Apply"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => exportPaymentsCSV(revFilters)}
              >
                <Download size={14} />
                Export CSV
              </Button>
            </div>

            {/* Summary */}
            {revData && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                  <p className="text-xs text-green-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-700">{fmt(revData.total)}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                  <p className="text-xs text-indigo-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-indigo-700">{revData.count || 0}</p>
                </div>
              </div>
            )}

            {/* Table */}
            {revLoading ? (
              <EmptyState title="Loading..." />
            ) : revData?.payments?.length > 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Date","Learner","Course","Amount","Mode","Reference","Status"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {revData.payments.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {p.paymentDate
                              ? new Date(p.paymentDate).toLocaleDateString("en-GB")
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{p.learnerId?.name || "—"}</p>
                            <p className="text-xs text-gray-400">{p.learnerId?.email || ""}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{p.courseId?.title || "—"}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{fmt(p.amount)}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {MODE_LABELS[p.paymentMode] || p.paymentMode}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">
                            {p.referenceNumber || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill status={p.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              revData && <EmptyState title="No revenue records found" />
            )}
          </div>
        )}

        {/* ── Pending Payments ─────────────────────────────────────── */}
        {tab === "pending" && (
          <div className="space-y-4">
            {/* Summary */}
            {pendData && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <p className="text-xs text-orange-600">Total Outstanding</p>
                  <p className="text-2xl font-bold text-orange-700">{fmt(pendData.totalOutstanding)}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <p className="text-xs text-red-600">Enrollments with Balance</p>
                  <p className="text-2xl font-bold text-red-700">{pendData.count || 0}</p>
                </div>
              </div>
            )}

            {/* Export */}
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => exportPaymentsCSV({ status: "part_payment" })}
              >
                <Download size={14} />
                Export CSV
              </Button>
            </div>

            {pendLoading ? (
              <EmptyState title="Loading..." />
            ) : pendData?.records?.length > 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Learner","Course","Course Fee","Total Paid","Balance","Last Payment","Payments"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendData.records.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{r.learner?.name || "—"}</p>
                            <p className="text-xs text-gray-400">{r.learner?.email || ""}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{r.course?.title || "—"}</td>
                          <td className="px-4 py-3 text-gray-700">{fmt(r.totalCourseFee)}</td>
                          <td className="px-4 py-3 text-green-700 font-medium">{fmt(r.totalPaid)}</td>
                          <td className="px-4 py-3 text-red-600 font-bold">{fmt(r.balance)}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {r.lastPayment
                              ? new Date(r.lastPayment).toLocaleDateString("en-GB")
                              : "Never"}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-center">{r.paymentCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              pendData && <EmptyState title="No outstanding balances — everyone is paid up!" />
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatusPill({ status }) {
  const map = {
    fully_paid:      "bg-green-100 text-green-700",
    part_payment:    "bg-yellow-100 text-yellow-700",
    balance_pending: "bg-orange-100 text-orange-700",
    refund_issued:   "bg-purple-100 text-purple-700",
    adjustment:      "bg-blue-100 text-blue-700",
  };
  const labels = {
    fully_paid:"Fully Paid", part_payment:"Part Payment",
    balance_pending:"Pending", refund_issued:"Refund", adjustment:"Adjustment",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {labels[status] || status}
    </span>
  );
}
