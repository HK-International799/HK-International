import CrmOrganisation from "../models/CrmOrganisation.js";
import asyncHandler    from "../utils/asyncHandler.js";
import ApiError        from "../utils/ApiError.js";

export const getOrgs = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };

  const [orgs, total] = await Promise.all([
    CrmOrganisation.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    CrmOrganisation.countDocuments(filter),
  ]);

  res.json({ success: true, data: { orgs, total } });
});

export const getOrgById = asyncHandler(async (req, res) => {
  const org = await CrmOrganisation.findById(req.params.id).lean();
  if (!org) throw new ApiError(404, "Organisation not found");
  res.json({ success: true, data: org });
});

export const createOrg = asyncHandler(async (req, res) => {
  const { name, industry, website, phone, email, address, country, notes } = req.body;
  if (!name) throw new ApiError(400, "Name is required");

  const org = await CrmOrganisation.create({
    name, industry, website, phone, email, address, country, notes,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: org });
});

export const updateOrg = asyncHandler(async (req, res) => {
  const allowed = ["name","industry","website","phone","email","address","country","notes"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const org = await CrmOrganisation.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });
  if (!org) throw new ApiError(404, "Organisation not found");
  res.json({ success: true, data: org });
});

export const deleteOrg = asyncHandler(async (req, res) => {
  const org = await CrmOrganisation.findByIdAndDelete(req.params.id);
  if (!org) throw new ApiError(404, "Organisation not found");
  res.json({ success: true, message: "Organisation deleted" });
});
