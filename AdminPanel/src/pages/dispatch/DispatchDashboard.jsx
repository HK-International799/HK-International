import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, StatCard, EmptyState, Button, Badge } from "../../components/ui";
import { getDispatchDashboard } from "../../services/dispatchService";
import {
  PackageOpen, PackageCheck, Send, CalendarCheck, CheckCircle2,
  RotateCcw, XCircle, Clock, AlertTriangle, Wallet, TrendingUp,
  Boxes, Search, Layers, Receipt, FileBarChart,
} from "lucide-react";

export default function DispatchDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDispatchDashboard()
      .then((d) => setData(d.data || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 w-72 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <EmptyState title="Failed to load Dispatch Dashboard" />
      </AdminLayout>
    );
  }

  const { cards = {}, alerts = {} } = data;
  const fmtMoney = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  const alertItems = [
    { key: "pendingOver3Days", label: "Pending Dispatch > 3 Days", icon: Clock, color: "warning" },
    { key: "returnedCertificates", label: "Returned Certificates", icon: RotateCcw, color: "danger" },
    { key: "pendingDelivery", label: "Pending Delivery", icon: Send, color: "primary" },
    { key: "expensesWithoutBills", label: "Expenses Without Bills", icon: Receipt, color: "warning" },
    { key: "incompleteDispatchRecords", label: "Incomplete Dispatch Records", icon: AlertTriangle, color: "danger" },
  ].filter((a) => (alerts[a.key] || 0) > 0);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title="Certificate Dispatch"
          subtitle="India Post — Speed Post dispatch & courier management"
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate("/admin/dispatch/expenses")}>
                <Wallet size={15} /> Expenses
              </Button>
              <Button variant="secondary" onClick={() => navigate("/admin/dispatch/reports")}>
                <FileBarChart size={15} /> Reports
              </Button>
              <Button onClick={() => navigate("/admin/dispatch/certificates?status=pending")}>
                <PackageOpen size={15} /> Pending Dispatch
              </Button>
            </div>
          }
        />

        {/* Alerts */}
        {alertItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">Attention needed</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {alertItems.map((a) => (
                <span
                  key={a.key}
                  className="inline-flex items-center gap-1.5 bg-white border border-amber-200 rounded-full px-3 py-1.5 text-xs font-medium text-amber-700"
                >
                  <a.icon size={13} />
                  {a.label}: {alerts[a.key]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard title="Pending Dispatch" value={cards.pendingDispatch} icon={PackageOpen} color="accent" />
          <StatCard title="Packed" value={cards.packed} icon={Boxes} color="primary" />
          <StatCard title="Today's Dispatch" value={cards.todayDispatch} icon={Send} color="accent" />
          <StatCard title="This Month" value={cards.monthDispatch} icon={CalendarCheck} color="primary" />
          <StatCard title="Delivered" value={cards.delivered} icon={CheckCircle2} color="success" />
          <StatCard title="Returned" value={cards.returned} icon={RotateCcw} color="danger" />
          <StatCard title="Cancelled" value={cards.cancelled} icon={XCircle} color="danger" />
          <StatCard title="Postponed" value={cards.postponed} icon={Clock} color="accent" />
          <StatCard title="Lost" value={cards.lost} icon={AlertTriangle} color="danger" />
          <StatCard title="Pending Batches" value={cards.pendingCourierBatches} icon={Layers} color="primary" />
        </div>

        {/* Expense summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Today's Expense" value={fmtMoney(cards.todayExpense)} icon={Wallet} color="accent" />
          <StatCard title="Monthly Expense" value={fmtMoney(cards.monthlyExpense)} icon={Wallet} color="accent" />
          <StatCard title="Total Dispatch Cost" value={fmtMoney(cards.totalDispatchCost)} icon={TrendingUp} color="primary" />
          <StatCard title="Avg Cost / Certificate" value={fmtMoney(cards.avgCostPerCertificate)} icon={TrendingUp} color="primary" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickLink icon={Search} title="All Certificates" subtitle="Search & filter dispatch records" onClick={() => navigate("/admin/dispatch/certificates")} />
          <QuickLink icon={Layers} title="Dispatch Batches" subtitle="Daily India Post batches" onClick={() => navigate("/admin/dispatch/batches")} />
          <QuickLink icon={Wallet} title="Expenses" subtitle="Courier & consumable costs" onClick={() => navigate("/admin/dispatch/expenses")} />
          <QuickLink icon={FileBarChart} title="Reports" subtitle="Daily, monthly & expense reports" onClick={() => navigate("/admin/dispatch/reports")} />
        </div>
      </div>
    </AdminLayout>
  );
}

function QuickLink({ icon: Icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
        <Icon size={18} />
      </div>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </button>
  );
}
