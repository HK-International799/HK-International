import crypto    from "crypto";
import bcrypt    from "bcryptjs";
import CrmLead   from "../models/CrmLead.js";
import User      from "../models/User.js";
import Course    from "../models/Course.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError     from "../utils/ApiError.js";
import auditService from "../services/auditService.js";
import emailService from "../services/emailService.js";

// ── List leads ─────────────────────────────────────────────────────────────
export const getLeads = asyncHandler(async (req, res) => {
  const {
    status, source, assignedTo, search,
    page = 1, limit = 30,
  } = req.query;

  const filter = {};
  if (status)     filter.status     = status;
  if (source)     filter.source     = source;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email:    { $regex: search, $options: "i" } },
      { phone:    { $regex: search, $options: "i" } },
    ];
  }

  const [leads, total] = await Promise.all([
    CrmLead.find(filter)
      .populate("assignedTo", "name email")
      .populate("courseInterest", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    CrmLead.countDocuments(filter),
  ]);

  res.json({ success: true, data: { leads, total, page: Number(page), limit: Number(limit) } });
});

// ── Get single lead (with followups + tasks) ───────────────────────────────
export const getLeadById = asyncHandler(async (req, res) => {
  const { default: CrmFollowUp } = await import("../models/CrmFollowUp.js");
  const { default: CrmTask }     = await import("../models/CrmTask.js");

  const lead = await CrmLead.findById(req.params.id)
    .populate("assignedTo",     "name email")
    .populate("courseInterest", "title")
    .populate("learnerRef",     "name email")
    .populate("createdBy",      "name email")
    .lean();

  if (!lead) throw new ApiError(404, "Lead not found");

  const [followUps, tasks] = await Promise.all([
    CrmFollowUp.find({ lead: lead._id }).sort({ scheduledAt: -1 }).populate("createdBy", "name").lean(),
    CrmTask.find({ lead: lead._id }).sort({ dueDate: 1 }).populate("assignedTo", "name").lean(),
  ]);

  res.json({ success: true, data: { lead, followUps, tasks } });
});

// ── Create lead ────────────────────────────────────────────────────────────
export const createLead = asyncHandler(async (req, res) => {
  const {
    fullName, email, phone, dob, age, country,
    courseInterest, source, probability, status, assignedTo, notes, tags,
  } = req.body;

  if (!fullName) throw new ApiError(400, "Full name is required");

  const lead = await CrmLead.create({
    fullName, email, phone, dob, age, country,
    courseInterest: courseInterest || null,
    source:         source || "other",
    probability:    probability || 0,
    status:         status || "new",
    assignedTo:     assignedTo || null,
    notes:          notes || "",
    tags:           tags || [],
    createdBy:      req.user._id,
  });

  await auditService.log({
    action:      "CRM_LEAD_CREATED",
    entity:      "CrmLead",
    entityId:    lead._id,
    performedBy: req.user._id,
    details:     `Lead created: ${fullName}`,
  });

  res.status(201).json({ success: true, data: lead });
});

// ── Update lead ────────────────────────────────────────────────────────────
export const updateLead = asyncHandler(async (req, res) => {
  const allowed = [
    "fullName","email","phone","dob","age","country",
    "courseInterest","source","probability","status",
    "assignedTo","notes","tags",
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const lead = await CrmLead.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });
  if (!lead) throw new ApiError(404, "Lead not found");

  await auditService.log({
    action:      "CRM_LEAD_UPDATED",
    entity:      "CrmLead",
    entityId:    lead._id,
    performedBy: req.user._id,
    details:     `Lead updated: ${lead.fullName}`,
  });

  res.json({ success: true, data: lead });
});

// ── Delete lead ────────────────────────────────────────────────────────────
export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await CrmLead.findByIdAndDelete(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");

  await auditService.log({
    action:      "CRM_LEAD_DELETED",
    entity:      "CrmLead",
    entityId:    lead._id,
    performedBy: req.user._id,
    details:     `Lead deleted: ${lead.fullName}`,
  });

  res.json({ success: true, message: "Lead deleted" });
});

// ── Assign lead ────────────────────────────────────────────────────────────
export const assignLead = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  if (!assignedTo) throw new ApiError(400, "assignedTo is required");

  const lead = await CrmLead.findByIdAndUpdate(
    req.params.id,
    { assignedTo },
    { new: true }
  ).populate("assignedTo", "name email");
  if (!lead) throw new ApiError(404, "Lead not found");

  res.json({ success: true, data: lead });
});

// ── Convert lead → learner ─────────────────────────────────────────────────
export const convertLead = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const lead = await CrmLead.findById(req.params.id);
  if (!lead)                        throw new ApiError(404, "Lead not found");
  if (lead.status === "converted")  throw new ApiError(400, "Lead already converted");
  if (lead.status === "lost")       throw new ApiError(400, "Cannot convert a lost lead");
  if (!lead.email)                  throw new ApiError(400, "Lead must have an email to convert");

  // Guard: check no user already exists with this email
  const existing = await User.findOne({ email: lead.email.toLowerCase() });
  if (existing) {
    // If they exist, just link and mark converted — don't duplicate
    lead.status      = "converted";
    lead.learnerRef  = existing._id;
    lead.convertedAt = new Date();
    lead.convertedBy = req.user._id;
    await lead.save();

    if (courseId) {
      const course = await Course.findById(courseId);
      if (course && !existing.enrolledCourses.some(id => id.toString() === courseId)) {
        existing.enrolledCourses.push(course._id);
        await existing.save();
      }
    }

    await auditService.log({
      action:      "CRM_LEAD_CONVERTED_LINKED",
      entity:      "CrmLead",
      entityId:    lead._id,
      performedBy: req.user._id,
      details:     `Lead ${lead.fullName} linked to existing user ${existing.email}`,
    });

    return res.json({
      success: true,
      message: "Lead linked to existing user account",
      data: { lead, learner: { id: existing._id, name: existing.name, email: existing.email } },
    });
  }

  // ── Create new User ────────────────────────────────────────────────────
  const randomPassword = crypto.randomBytes(6).toString("hex");
  const passwordHash   = await bcrypt.hash(randomPassword, 10);

  const newUser = await User.create({
    name:         lead.fullName,
    email:        lead.email.toLowerCase(),
    mobile:       lead.phone || "0000000000",
    passwordHash,
    role:         "student",
    isFirstLogin: true,
  });

  // ── Optionally enroll ─────────────────────────────────────────────────
  if (courseId) {
    const course = await Course.findById(courseId);
    if (course) {
      newUser.enrolledCourses.push(course._id);
      await newUser.save();
    }
  }

  // ── Update lead ───────────────────────────────────────────────────────
  lead.status      = "converted";
  lead.learnerRef  = newUser._id;
  lead.convertedAt = new Date();
  lead.convertedBy = req.user._id;
  await lead.save();

  // ── Send welcome email (non-blocking) ─────────────────────────────────
  emailService
    .sendWelcomeEmail(newUser.email, randomPassword)
    .catch((err) => console.warn("CRM conversion email failed:", err.message));

  await auditService.log({
    action:      "CRM_LEAD_CONVERTED",
    entity:      "CrmLead",
    entityId:    lead._id,
    performedBy: req.user._id,
    details:     `Lead ${lead.fullName} converted to learner ${newUser.email}`,
  });

  res.status(201).json({
    success: true,
    message: "Lead successfully converted to learner",
    data: {
      lead,
      learner: {
        id:    newUser._id,
        name:  newUser.name,
        email: newUser.email,
        credentials: { email: newUser.email, password: randomPassword },
      },
    },
  });
});

// ── Export leads CSV ───────────────────────────────────────────────────────
export const exportLeadsCsv = asyncHandler(async (req, res) => {
  const { status, source } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (source) filter.source = source;

  const leads = await CrmLead.find(filter)
    .populate("assignedTo", "name")
    .populate("courseInterest", "title")
    .lean();

  const rows = leads.map((l) => ({
    Name:           l.fullName,
    Email:          l.email || "",
    Phone:          l.phone || "",
    Country:        l.country || "",
    Source:         l.source,
    Status:         l.status,
    Probability:    l.probability,
    AssignedTo:     l.assignedTo?.name || "",
    CourseInterest: l.courseInterest?.title || "",
    CreatedAt:      l.createdAt?.toISOString() || "",
  }));

  if (rows.length === 0) {
    return res.json({ success: true, data: [], message: "No leads found" });
  }

  const headers = Object.keys(rows[0]).join(",");
  const csv     = [headers, ...rows.map((r) => Object.values(r).map(v => `"${v}"`).join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=crm-leads.csv");
  res.send(csv);
});
