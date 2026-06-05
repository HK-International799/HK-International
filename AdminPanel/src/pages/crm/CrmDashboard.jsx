import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { StatCard, PageHeader, EmptyState } from "../../components/ui";
import { getCrmDashboard } from "../../services/crmService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import {
  Users, UserCheck, UserX, TrendingUp,
  CalendarClock, AlertCircle, Percent,
} from "lucide-react";

const COLORS = ["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];

const STATUS_LABELS = {
  new:              "New",
  contacted:        "Contacted",
  interested:       "Interested",
  proposal_sent:    "Proposal Sent",
  payment_pending:  "Payment Pending",
  converted:        "Converted",
  lost:             "Lost",
};

export default function CrmDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCrmDashboard()
      .then((d) => setData(d.data || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );

  if (!data) return <AdminLayout><EmptyState title="Failed to load CRM dashboard" /></AdminLayout>;

  // Pipeline funnel data
  const pipelineData = [
    "new","contacted","interested","proposal_sent","payment_pending","converted","lost",
  ].map((s) => ({ name: STATUS_LABELS[s], value: data.byStatus?.[s] || 0 }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="CRM Dashboard" subtitle="Sales pipeline overview" />

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Leads"      value={data.totalLeads}      icon={Users}         color="primary" />
          <StatCard title="New Leads"        value={data.newLeads}        icon={TrendingUp}    color="primary" />
          <StatCard title="Converted"        value={data.convertedLeads}  icon={UserCheck}     color="success" />
          <StatCard title="Lost"             value={data.lostLeads}       icon={UserX}         color="danger"  />
          <StatCard title="Conversion Rate"  value={`${data.conversionRate}%`} icon={Percent}  color="accent"  />
          <StatCard title="Today Follow-ups" value={data.todayFollowUps}  icon={CalendarClock} color="primary" />
          <StatCard title="Overdue"          value={data.overdueFollowUps}icon={AlertCircle}   color="danger"  />
          <StatCard title="Interested"       value={data.interestedLeads} icon={Users}         color="accent"  />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Monthly lead trend */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Monthly Lead Trend</p>
            {data.monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No trend data yet" />
            )}
          </div>

          {/* Lead source pie */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Lead Sources</p>
            {data.bySource?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.bySource}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {data.bySource.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No source data yet" />
            )}
          </div>
        </div>

        {/* Pipeline funnel */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Pipeline Distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pipelineData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {pipelineData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}