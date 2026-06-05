import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Badge, EmptyState } from "../../components/ui";
import { getLeads, updateLead } from "../../services/crmService";

const STAGES = [
  { key: "new",             label: "New",             color: "bg-gray-100 border-gray-200" },
  { key: "contacted",       label: "Contacted",       color: "bg-blue-50  border-blue-200"  },
  { key: "interested",      label: "Interested",      color: "bg-orange-50 border-orange-200" },
  { key: "proposal_sent",   label: "Proposal Sent",   color: "bg-purple-50 border-purple-200" },
  { key: "payment_pending", label: "Payment Pending", color: "bg-yellow-50 border-yellow-200" },
  { key: "converted",       label: "Converted",       color: "bg-emerald-50 border-emerald-200" },
  { key: "lost",            label: "Lost",            color: "bg-red-50  border-red-200"  },
];

const BADGE_COLORS = {
  new:"default", contacted:"primary", interested:"accent",
  proposal_sent:"warning", payment_pending:"warning",
  converted:"success", lost:"danger",
};

export default function Pipeline() {
  const navigate     = useNavigate();
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dragging, setDragging] = useState(null);
  const [over,     setOver]     = useState(null);

  useEffect(() => {
    getLeads({ limit: 200 })
      .then((res) => setLeads(res.leads || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const byStage = (key) => leads.filter((l) => l.status === key);

  // ── Drag & Drop (HTML5 native) ───────────────────────────────────────────
  const onDragStart = (e, lead) => {
    setDragging(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e, stageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOver(stageKey);
  };

  const onDrop = async (e, stageKey) => {
    e.preventDefault();
    setOver(null);
    if (!dragging || dragging.status === stageKey) { setDragging(null); return; }

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => l._id === dragging._id ? { ...l, status: stageKey } : l)
    );

    try {
      await updateLead(dragging._id, { status: stageKey });
    } catch {
      // Rollback on error
      setLeads((prev) =>
        prev.map((l) => l._id === dragging._id ? { ...l, status: dragging.status } : l)
      );
    }
    setDragging(null);
  };

  const onDragEnd = () => { setDragging(null); setOver(null); };

  if (loading)
    return <AdminLayout><EmptyState title="Loading pipeline..." /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-4">
        <PageHeader title="Pipeline" subtitle="Drag leads between stages" />

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => {
              const stageLeads = byStage(stage.key);
              const isOver     = over === stage.key;

              return (
                <div
                  key={stage.key}
                  className={`w-64 rounded-2xl border-2 transition-all ${stage.color} ${isOver ? "ring-2 ring-indigo-400 ring-offset-1 scale-[1.01]" : ""}`}
                  onDragOver={(e) => onDragOver(e, stage.key)}
                  onDrop={(e)     => onDrop(e, stage.key)}
                  onDragLeave={() => setOver(null)}
                >
                  {/* Column header */}
                  <div className="px-4 py-3 border-b border-inherit flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">{stage.label}</p>
                    <span className="text-xs bg-white border border-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="p-3 space-y-2 min-h-[200px]">
                    {stageLeads.length === 0 && (
                      <p className="text-xs text-gray-300 text-center py-8">Drop leads here</p>
                    )}
                    {stageLeads.map((lead) => (
                      <div
                        key={lead._id}
                        draggable
                        onDragStart={(e) => onDragStart(e, lead)}
                        onDragEnd={onDragEnd}
                        onClick={() => navigate(`/admin/crm/leads/${lead._id}`)}
                        className={`bg-white rounded-xl border border-gray-100 shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none ${
                          dragging?._id === lead._id ? "opacity-50 rotate-1" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">{lead.fullName}</p>
                        {(lead.email || lead.phone) && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {lead.email || lead.phone}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge>{lead.source}</Badge>
                          {lead.probability > 0 && (
                            <span className="text-xs text-gray-500">{lead.probability}%</span>
                          )}
                        </div>
                        {lead.assignedTo && (
                          <p className="text-xs text-gray-400 mt-1">→ {lead.assignedTo.name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
