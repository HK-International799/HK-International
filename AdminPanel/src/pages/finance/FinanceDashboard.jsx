import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { StatCard, PageHeader, EmptyState } from "../../components/ui";
import { getFinanceDashboard } from "../../services/financeService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import {
  PoundSterling, TrendingUp, Clock, CheckCircle,
  AlertCircle, RotateCcw, CreditCard,
} from "lucide-react";

const COLORS = ["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];

const MODE_LABELS = {
  razorpay:      "Razorpay",
  upi:           "UPI",
  bank_transfer: "Bank Transfer",
  wise:          "Wise",
  cash:          "Cash",
  cheque:        "Cheque",
  other:         "Other",
};

const fmt = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n || 0);

export default function FinanceDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinanceDashboard()
      .then((d) => setData(d.data || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );

  if (!data)
    return (
      <AdminLayout>
        <EmptyState title="Failed to load Finance Dashboard" />
      </AdminLayout>
    );

  const modeData = (data.paymentModes || []).map((m) => ({
    name:  MODE_LABELS[m.mode] || m.mode,
    value: m.total,
    count: m.count,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Finance Dashboard" subtitle="Revenue and payment overview" />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Revenue"
            value={fmt(data.totalRevenue)}
            icon={PoundSterling}
            color="success"
          />
          <StatCard
            title="This Month"
            value={fmt(data.monthlyRevenue)}
            icon={TrendingUp}
            color="primary"
          />
          <StatCard
            title="Fully Paid"
            value={data.fullyPaidCount}
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="Part Payment"
            value={data.partPaymentCount}
            icon={Clock}
            color="accent"
          />
          <StatCard
            title="Balance Pending"
            value={data.pendingCount}
            icon={AlertCircle}
            color="warning"
          />
          <StatCard
            title="Refunds"
            value={data.refundCount}
            icon={RotateCcw}
            color="danger"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Monthly Revenue Trend */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue Trend</p>
            {data.monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => [fmt(value), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No trend data yet" />
            )}
          </div>

          {/* Payment Mode Distribution */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Revenue by Payment Mode</p>
            {modeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={modeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: £${(value/1000).toFixed(1)}k`}
                    labelLine={false}
                  >
                    {modeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No payment mode data yet" />
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-indigo-600" />
            <p className="text-sm font-semibold text-gray-700">Recent Payments</p>
          </div>
          {data.recentPayments?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-2 text-xs text-gray-400 font-medium">Learner</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">Course</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">Amount</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">Mode</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">Date</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="py-2.5">
                        <p className="font-medium text-gray-800">{p.learnerId?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{p.learnerId?.email || ""}</p>
                      </td>
                      <td className="py-2.5 text-gray-600">{p.courseId?.title || "—"}</td>
                      <td className="py-2.5 font-semibold text-gray-800">{fmt(p.amount)}</td>
                      <td className="py-2.5 text-gray-500">{MODE_LABELS[p.paymentMode] || p.paymentMode}</td>
                      <td className="py-2.5 text-gray-500">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No payments recorded yet" />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }) {
  const map = {
    fully_paid:      { label: "Fully Paid",      cls: "bg-green-100 text-green-700" },
    part_payment:    { label: "Part Payment",     cls: "bg-yellow-100 text-yellow-700" },
    balance_pending: { label: "Pending",          cls: "bg-orange-100 text-orange-700" },
    not_paid:        { label: "Not Paid",         cls: "bg-red-100 text-red-700" },
    refund_issued:   { label: "Refund",           cls: "bg-purple-100 text-purple-700" },
    adjustment:      { label: "Adjustment",       cls: "bg-blue-100 text-blue-700" },
  };
  const s = map[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}
