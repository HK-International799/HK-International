import CrmLead      from "../models/CrmLead.js";
import CrmFollowUp  from "../models/CrmFollowUp.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getCrmDashboard = asyncHandler(async (_req, res) => {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tom   = new Date(today); tom.setDate(tom.getDate() + 1);

  // ── Parallel aggregations ────────────────────────────────────────────────
  const [
    totalLeads,
    statusCounts,
    sourceCounts,
    todayFollowUps,
    overdueFollowUps,
    monthlyTrend,
  ] = await Promise.all([

    CrmLead.countDocuments(),

    CrmLead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    CrmLead.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]),

    CrmFollowUp.countDocuments({
      scheduledAt: { $gte: today, $lt: tom },
      outcome: "pending",
    }),

    CrmFollowUp.countDocuments({
      scheduledAt: { $lt: today },
      outcome: "pending",
    }),

    // Monthly new leads for the last 6 months
    CrmLead.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  // ── Shape statusCounts into a flat object ────────────────────────────────
  const byStatus = {};
  for (const s of statusCounts) byStatus[s._id] = s.count;

  const converted = byStatus["converted"] || 0;
  const conversionRate = totalLeads > 0
    ? ((converted / totalLeads) * 100).toFixed(1)
    : "0.0";

  // ── Shape monthly trend for recharts ────────────────────────────────────
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const trend  = monthlyTrend.map((m) => ({
    month: `${months[m._id.month - 1]} ${m._id.year}`,
    leads: m.count,
  }));

  res.json({
    success: true,
    data: {
      totalLeads,
      newLeads:        byStatus["new"]              || 0,
      contactedLeads:  byStatus["contacted"]        || 0,
      interestedLeads: byStatus["interested"]       || 0,
      convertedLeads:  converted,
      lostLeads:       byStatus["lost"]             || 0,
      conversionRate,
      todayFollowUps,
      overdueFollowUps,
      byStatus,
      bySource: sourceCounts.map((s) => ({ name: s._id || "other", value: s.count })),
      monthlyTrend: trend,
    },
  });
});