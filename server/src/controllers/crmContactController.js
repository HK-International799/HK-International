import CrmContact   from "../models/CrmContact.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError     from "../utils/ApiError.js";

export const getContacts = asyncHandler(async (req, res) => {
  const { search, organisation, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (organisation) filter.organisation = organisation;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
      { email:     { $regex: search, $options: "i" } },
    ];
  }

  const [contacts, total] = await Promise.all([
    CrmContact.find(filter)
      .populate("organisation", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    CrmContact.countDocuments(filter),
  ]);

  res.json({ success: true, data: { contacts, total } });
});

export const getContactById = asyncHandler(async (req, res) => {
  const contact = await CrmContact.findById(req.params.id)
    .populate("organisation", "name")
    .populate("relatedLeads", "fullName status")
    .lean();
  if (!contact) throw new ApiError(404, "Contact not found");
  res.json({ success: true, data: contact });
});

export const createContact = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, organisation, position, country, notes } = req.body;
  if (!firstName) throw new ApiError(400, "First name is required");

  const contact = await CrmContact.create({
    firstName, lastName, email, phone,
    organisation: organisation || null,
    position, country, notes,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: contact });
});

export const updateContact = asyncHandler(async (req, res) => {
  const allowed = ["firstName","lastName","email","phone","organisation","position","country","notes"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const contact = await CrmContact.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });
  if (!contact) throw new ApiError(404, "Contact not found");
  res.json({ success: true, data: contact });
});

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await CrmContact.findByIdAndDelete(req.params.id);
  if (!contact) throw new ApiError(404, "Contact not found");
  res.json({ success: true, message: "Contact deleted" });
});

