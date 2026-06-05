import CrmFollowUp  from "../models/CrmFollowUp.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError     from "../utils/ApiError.js";

// ── List follow-ups ────────────────────────────────────────────────────────
export const getFollowUps = asyncHandler(async (req, res) => {
  const { lead, outcome, from, to, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (lead)    filter.lead    = lead;
  if (outcome) filter.outcome = outcome;
  if (from || to) {
    filter.scheduledAt = {};
    if (from) filter.scheduledAt.$gte = new Date(from);
    if (to)   filter.scheduledAt.$lte = new Date(to);
  }

  const [followUps, total] = await Promise.all([
    CrmFollowUp.find(filter)
      .populate("lead", "fullName email phone status")
      .populate("createdBy", "name")
      .sort({ scheduledAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    CrmFollowUp.countDocuments(filter),
  ]);

  res.json({ success: true, data: { followUps, total } });
});

// ── Create follow-up ───────────────────────────────────────────────────────
export const createFollowUp = asyncHandler(async (req, res) => {
  const { lead, scheduledAt, type, remarks } = req.body;
  if (!lead)        throw new ApiError(400, "lead is required");
  if (!scheduledAt) throw new ApiError(400, "scheduledAt is required");

  const followUp = await CrmFollowUp.create({
    lead,
    scheduledAt: new Date(scheduledAt),
    type:        type || "call",
    outcome:     "pending",
    remarks:     remarks || "",
    createdBy:   req.user._id,
  });

  res.status(201).json({ success: true, data: followUp });
});

// ── Update follow-up (including mark complete) ─────────────────────────────
export const updateFollowUp = asyncHandler(async (req, res) => {
  const allowed = ["scheduledAt", "type", "outcome", "remarks"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (updates.outcome === "completed" && !updates.completedAt) {
    updates.completedAt = new Date();
  }

  const followUp = await CrmFollowUp.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });
  if (!followUp) throw new ApiError(404, "Follow-up not found");

  res.json({ success: true, data: followUp });
});

// ── Delete follow-up ───────────────────────────────────────────────────────
export const deleteFollowUp = asyncHandler(async (req, res) => {
  const followUp = await CrmFollowUp.findByIdAndDelete(req.params.id);
  if (!followUp) throw new ApiError(404, "Follow-up not found");
  res.json({ success: true, message: "Follow-up deleted" });
});

