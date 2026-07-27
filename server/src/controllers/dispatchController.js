import Certificate from "../models/Certificate.js";
import DispatchBatch from "../models/DispatchBatch.js";
import DispatchExpense, { DISPATCH_EXPENSE_CATEGORIES } from "../models/DispatchExpense.js";
import Settings from "../models/Settings.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import auditService from "../services/auditService.js";
import { uploadPdfToCloudinary } from "../utils/cloudinaryPdf.js";
import { DEFAULT_SENDER, COURIER_COMPANY, DISPATCH_SETTINGS_KEY } from "../config/dispatchConfig.js";

const RECEIVER_FIELDS =
  "name email mobile address area city district state pinCode country company";

const CERT_POPULATE = [
  { path: "studentId", select: RECEIVER_FIELDS },
  { path: "courseId", select: "title" },
  { path: "dispatchBatch", select: "batchNumber status dispatchDate speedPost" },
  { path: "dispatchUpdatedBy", select: "name" },
];

// Formats a User document (or lean object) into the "receiver" shape the
// dispatch UI expects. No data is copied/duplicated into another collection
// — this is read straight from the existing learner profile every time.
const toReceiver = (student) => {
  if (!student) return null;
  return {
    candidateName: student.name || "",
    company: student.company || "",
    address: student.address || "",
    area: student.area || "",
    city: student.city || "",
    district: student.district || "",
    state: student.state || "",
    pinCode: student.pinCode || "",
    country: student.country || "",
    mobile: student.mobile || "",
    email: student.email || "",
  };
};

const monthBounds = (month, year) => {
  if (!month || !year) return null;
  const m = Number(month) - 1;
  const y = Number(year);
  return { $gte: new Date(y, m, 1), $lte: new Date(y, m + 1, 0, 23, 59, 59) };
};

// ── Sender Settings ─────────────────────────────────────────────────────────
export const getSenderSettings = asyncHandler(async (_req, res) => {
  const doc = await Settings.findOne({ key: DISPATCH_SETTINGS_KEY }).lean();
  res.json({
    success: true,
    data: { ...DEFAULT_SENDER, ...(doc?.value || {}), courierCompany: COURIER_COMPANY },
  });
});

// Super Admin only (enforced in routes)
export const updateSenderSettings = asyncHandler(async (req, res) => {
  const value = { ...DEFAULT_SENDER, ...req.body };
  delete value.courierCompany; // never overridable — fixed company policy

  const doc = await Settings.findOneAndUpdate(
    { key: DISPATCH_SETTINGS_KEY },
    {
      key: DISPATCH_SETTINGS_KEY,
      value,
      category: "general",
      description: "Certificate Dispatch — default sender (return) address",
      updatedBy: req.user._id,
    },
    { upsert: true, new: true }
  );

  await auditService.log({
    action: "UPDATE_DISPATCH_SENDER",
    entity: "Settings",
    entityId: doc._id,
    performedBy: req.user._id,
    details: "Updated certificate dispatch sender settings",
  });

  res.json({ success: true, message: "Sender settings updated", data: doc.value });
});

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDispatchDashboard = asyncHandler(async (_req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const [
    statusCounts,
    todayDispatchCount,
    monthDispatchCount,
    todayExpenseAgg,
    monthExpenseAgg,
    totalExpenseAgg,
    deliveredCount,
    pendingBatches,
    pendingOver3Days,
    returnedCerts,
    expensesWithoutBills,
    incompleteDispatch,
  ] = await Promise.all([
    Certificate.aggregate([
      { $group: { _id: "$dispatchStatus", count: { $sum: 1 } } },
    ]),
    Certificate.countDocuments({ dispatchDate: { $gte: startOfToday } }),
    Certificate.countDocuments({ dispatchDate: { $gte: startOfMonth } }),
    DispatchExpense.aggregate([
      { $match: { expenseDate: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    DispatchExpense.aggregate([
      { $match: { expenseDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    DispatchExpense.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
    Certificate.countDocuments({ dispatchStatus: "delivered" }),
    DispatchBatch.countDocuments({ status: { $in: ["open", "booked"] } }),
    Certificate.countDocuments({ dispatchStatus: "pending", createdAt: { $lte: threeDaysAgo } }),
    Certificate.countDocuments({ dispatchStatus: "returned" }),
    DispatchExpense.countDocuments({ billUrl: "" }),
    Certificate.countDocuments({ dispatchStatus: "dispatched", trackingNumber: "" }),
  ]);

  const byStatus = statusCounts.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});

  const totalCertsWithCost = await Certificate.countDocuments({
    dispatchStatus: { $in: ["dispatched", "in_transit", "delivered"] },
  });
  const totalCost = totalExpenseAgg[0]?.total || 0;
  const avgCostPerCertificate = totalCertsWithCost > 0 ? totalCost / totalCertsWithCost : 0;

  res.json({
    success: true,
    data: {
      cards: {
        pendingDispatch: byStatus.pending || 0,
        packed: byStatus.packed || 0,
        todayDispatch: todayDispatchCount,
        monthDispatch: monthDispatchCount,
        delivered: deliveredCount,
        returned: byStatus.returned || 0,
        cancelled: byStatus.cancelled || 0,
        postponed: byStatus.postponed || 0,
        lost: byStatus.lost || 0,
        todayExpense: todayExpenseAgg[0]?.total || 0,
        monthlyExpense: monthExpenseAgg[0]?.total || 0,
        totalDispatchCost: totalCost,
        avgCostPerCertificate: Math.round(avgCostPerCertificate * 100) / 100,
        certificatesSentThisMonth: monthDispatchCount,
        pendingCourierBatches: pendingBatches,
      },
      alerts: {
        pendingOver3Days,
        returnedCertificates: returnedCerts,
        pendingDelivery: (byStatus.dispatched || 0) + (byStatus.in_transit || 0),
        expensesWithoutBills,
        incompleteDispatchRecords: incompleteDispatch,
      },
    },
  });
});

// ── Certificates: list with search + filters (Pending / All / Delivered…) ──
export const listDispatchCertificates = asyncHandler(async (req, res) => {
  const {
    status, course, state, country, month, year, batch, search,
    page = 1, limit = 30,
  } = req.query;

  const filter = {};
  if (status) filter.dispatchStatus = status;
  if (course) filter.courseId = course;
  if (batch) filter.dispatchBatch = batch;

  const dateRange = monthBounds(month, year);
  if (dateRange) filter.issuedAt = dateRange;

  let studentIds = null;
  if (search || state || country) {
    const studentQuery = {};
    if (state) studentQuery.state = new RegExp(`^${state}$`, "i");
    if (country) studentQuery.country = new RegExp(`^${country}$`, "i");
    if (search) {
      studentQuery.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") },
      ];
    }
    const matched = await User.find(studentQuery).select("_id").lean();
    studentIds = matched.map((u) => u._id);
  }

  const orConditions = [];
  if (search) {
    orConditions.push(
      { certificateNumber: new RegExp(search, "i") },
      { trackingNumber: new RegExp(search, "i") },
      { title: new RegExp(search, "i") }
    );
  }

  if (studentIds) {
    if (search) {
      // search also matches candidate name/email/mobile -> OR in studentId
      orConditions.push({ studentId: { $in: studentIds } });
      filter.$or = orConditions;
    } else {
      filter.studentId = { $in: studentIds };
    }
  } else if (orConditions.length) {
    filter.$or = orConditions;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [certs, total] = await Promise.all([
    Certificate.find(filter)
      .populate(CERT_POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Certificate.countDocuments(filter),
  ]);

  const data = certs.map((c) => ({
    ...c,
    receiver: toReceiver(c.studentId),
  }));

  res.json({ success: true, data: { certificates: data, total, page: Number(page), limit: Number(limit) } });
});

// ── Certificate: single dispatch detail (with sender + tracking history) ──
export const getDispatchCertificateById = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id).populate(CERT_POPULATE).lean();
  if (!cert) throw new ApiError(404, "Certificate not found");

  const senderDoc = await Settings.findOne({ key: DISPATCH_SETTINGS_KEY }).lean();

  res.json({
    success: true,
    data: {
      ...cert,
      receiver: toReceiver(cert.studentId),
      sender: { ...DEFAULT_SENDER, ...(senderDoc?.value || {}), courierCompany: COURIER_COMPANY },
    },
  });
});

// ── Learner profile: dispatch history for a specific candidate ─────────────
export const getLearnerDispatchHistory = asyncHandler(async (req, res) => {
  const certs = await Certificate.find({ studentId: req.params.learnerId })
    .populate([
      { path: "courseId", select: "title" },
      { path: "dispatchBatch", select: "batchNumber status" },
    ])
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: certs.map((c) => ({
      certificateId: c._id,
      certificateNumber: c.certificateNumber,
      course: c.courseId?.title || "",
      dispatchStatus: c.dispatchStatus,
      trackingNumber: c.trackingNumber,
      batch: c.dispatchBatch?.batchNumber || "",
      dispatchDate: c.dispatchDate,
      deliveredDate: c.deliveredDate,
      remarks: c.dispatchRemarks,
    })),
  });
});

// ── Batches ──────────────────────────────────────────────────────────────────
const generateBatchNumber = async () => {
  const today = new Date();
  const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate()
  ).padStart(2, "0")}`;
  const prefix = `POST-${ymd}-`;
  const count = await DispatchBatch.countDocuments({ batchNumber: new RegExp(`^${prefix}`) });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
};

export const createBatch = asyncHandler(async (req, res) => {
  const { dispatchDate, courierOffice, remarks, certificateIds = [] } = req.body;

  const batchNumber = await generateBatchNumber();

  const batch = await DispatchBatch.create({
    batchNumber,
    dispatchDate: dispatchDate || new Date(),
    courierOffice: courierOffice || "",
    postedBy: req.user._id,
    remarks: remarks || "",
    createdBy: req.user._id,
  });

  if (Array.isArray(certificateIds) && certificateIds.length) {
    await Certificate.updateMany(
      { _id: { $in: certificateIds }, dispatchStatus: "pending" },
      {
        dispatchStatus: "packed",
        dispatchBatch: batch._id,
        packedAt: new Date(),
        dispatchUpdatedBy: req.user._id,
      }
    );
  }

  await auditService.log({
    action: "CREATE_DISPATCH_BATCH",
    entity: "DispatchBatch",
    entityId: batch._id,
    performedBy: req.user._id,
    details: `Created batch ${batchNumber} with ${certificateIds.length} certificate(s)`,
  });

  res.status(201).json({ success: true, message: "Dispatch batch created", data: batch });
});

export const getAllBatches = asyncHandler(async (req, res) => {
  const { status, dateFrom, dateTo, page = 1, limit = 30 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.dispatchDate = {};
    if (dateFrom) filter.dispatchDate.$gte = new Date(dateFrom);
    if (dateTo) filter.dispatchDate.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [batches, total] = await Promise.all([
    DispatchBatch.find(filter)
      .populate("postedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    DispatchBatch.countDocuments(filter),
  ]);

  // Attach certificate counts per batch (single aggregation, no N+1)
  const counts = await Certificate.aggregate([
    { $match: { dispatchBatch: { $in: batches.map((b) => b._id) } } },
    { $group: { _id: "$dispatchBatch", count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

  const data = batches.map((b) => ({ ...b, totalCertificates: countMap[b._id] || 0 }));

  res.json({ success: true, data: { batches: data, total, page: Number(page), limit: Number(limit) } });
});

export const getBatchById = asyncHandler(async (req, res) => {
  const batch = await DispatchBatch.findById(req.params.id).populate("postedBy", "name").lean();
  if (!batch) throw new ApiError(404, "Dispatch batch not found");

  const [certificates, expenses] = await Promise.all([
    Certificate.find({ dispatchBatch: batch._id }).populate(CERT_POPULATE).lean(),
    DispatchExpense.find({ dispatchBatch: batch._id }).populate("paidBy", "name").lean(),
  ]);

  const expenseTotal = expenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const totalCost = (batch.speedPost?.totalCharges || 0) + expenseTotal;
  const avgCostPerCertificate = certificates.length ? totalCost / certificates.length : 0;

  res.json({
    success: true,
    data: {
      batch,
      certificates: certificates.map((c) => ({ ...c, receiver: toReceiver(c.studentId) })),
      expenses,
      costSummary: {
        speedPostCharges: batch.speedPost?.totalCharges || 0,
        linkedExpenses: expenseTotal,
        totalCost,
        avgCostPerCertificate: Math.round(avgCostPerCertificate * 100) / 100,
      },
    },
  });
});

export const updateBatch = asyncHandler(async (req, res) => {
  const { courierOffice, remarks, dispatchDate } = req.body;
  const batch = await DispatchBatch.findById(req.params.id);
  if (!batch) throw new ApiError(404, "Dispatch batch not found");
  if (batch.status !== "open") throw new ApiError(400, "Only open batches can be edited");

  if (courierOffice !== undefined) batch.courierOffice = courierOffice;
  if (remarks !== undefined) batch.remarks = remarks;
  if (dispatchDate !== undefined) batch.dispatchDate = dispatchDate;
  await batch.save();

  res.json({ success: true, message: "Batch updated", data: batch });
});

export const addCertificatesToBatch = asyncHandler(async (req, res) => {
  const { certificateIds = [] } = req.body;
  const batch = await DispatchBatch.findById(req.params.id);
  if (!batch) throw new ApiError(404, "Dispatch batch not found");
  if (batch.status !== "open") throw new ApiError(400, "Certificates can only be added to open batches");
  if (!Array.isArray(certificateIds) || !certificateIds.length) {
    throw new ApiError(400, "certificateIds is required");
  }

  const result = await Certificate.updateMany(
    { _id: { $in: certificateIds }, dispatchStatus: "pending" },
    {
      dispatchStatus: "packed",
      dispatchBatch: batch._id,
      packedAt: new Date(),
      dispatchUpdatedBy: req.user._id,
    }
  );

  await auditService.log({
    action: "ADD_CERTIFICATES_TO_BATCH",
    entity: "DispatchBatch",
    entityId: batch._id,
    performedBy: req.user._id,
    details: `Added ${result.modifiedCount} certificate(s) to batch ${batch.batchNumber}`,
  });

  res.json({ success: true, message: `${result.modifiedCount} certificate(s) added to batch` });
});

export const removeCertificateFromBatch = asyncHandler(async (req, res) => {
  const { id, certificateId } = req.params;
  const batch = await DispatchBatch.findById(id);
  if (!batch) throw new ApiError(404, "Dispatch batch not found");
  if (batch.status !== "open") throw new ApiError(400, "Cannot remove certificates from a booked/dispatched batch");

  await Certificate.findOneAndUpdate(
    { _id: certificateId, dispatchBatch: batch._id },
    { dispatchStatus: "pending", dispatchBatch: null, packedAt: null }
  );

  res.json({ success: true, message: "Certificate removed from batch" });
});

// Speed Post booking — assigns tracking number, moves batch + all its
// certificates to "dispatched" in one step (per the required workflow).
export const bookSpeedPost = asyncHandler(async (req, res) => {
  const {
    trackingNumber, bookingDate, bookingTime, postOfficeName, bookingClerk,
    totalCharges, weight, remarks,
  } = req.body;

  if (!trackingNumber) throw new ApiError(400, "trackingNumber is required");

  const batch = await DispatchBatch.findById(req.params.id);
  if (!batch) throw new ApiError(404, "Dispatch batch not found");
  if (batch.status !== "open") throw new ApiError(400, "Speed Post has already been booked for this batch");

  const certCount = await Certificate.countDocuments({ dispatchBatch: batch._id });
  if (certCount === 0) throw new ApiError(400, "Cannot book Speed Post for an empty batch");

  batch.speedPost = {
    trackingNumber,
    bookingDate: bookingDate || new Date(),
    bookingTime: bookingTime || "",
    postOfficeName: postOfficeName || "",
    bookingClerk: bookingClerk || "",
    totalCharges: Number(totalCharges) || 0,
    weight: Number(weight) || 0,
    remarks: remarks || "",
  };
  batch.status = "dispatched";
  await batch.save();

  await Certificate.updateMany(
    { dispatchBatch: batch._id },
    {
      dispatchStatus: "dispatched",
      trackingNumber,
      dispatchDate: batch.speedPost.bookingDate,
      dispatchUpdatedBy: req.user._id,
    }
  );

  await auditService.log({
    action: "BOOK_SPEED_POST",
    entity: "DispatchBatch",
    entityId: batch._id,
    performedBy: req.user._id,
    details: `Speed Post booked for batch ${batch.batchNumber}, tracking ${trackingNumber}`,
  });

  res.json({ success: true, message: "Speed Post booked and certificates dispatched", data: batch });
});

export const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await DispatchBatch.findById(req.params.id);
  if (!batch) throw new ApiError(404, "Dispatch batch not found");
  if (batch.status !== "open") throw new ApiError(400, "Only open (un-booked) batches can be deleted");

  await Certificate.updateMany(
    { dispatchBatch: batch._id },
    { dispatchStatus: "pending", dispatchBatch: null, packedAt: null }
  );
  await batch.deleteOne();

  await auditService.log({
    action: "DELETE_DISPATCH_BATCH",
    entity: "DispatchBatch",
    entityId: batch._id,
    performedBy: req.user._id,
    details: `Deleted batch ${batch.batchNumber}`,
  });

  res.json({ success: true, message: "Batch deleted" });
});

// ── Certificate delivery-lifecycle status updates ───────────────────────────
const TERMINAL_STATUSES = ["in_transit", "delivered", "returned", "cancelled", "postponed", "lost", "redispatched"];

export const updateCertificateStatus = asyncHandler(async (req, res) => {
  const { certificateIds, status, remarks, deliveredDate } = req.body;

  if (!Array.isArray(certificateIds) || !certificateIds.length) {
    throw new ApiError(400, "certificateIds is required");
  }
  if (!TERMINAL_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${TERMINAL_STATUSES.join(", ")}`);
  }

  const update = {
    dispatchStatus: status,
    dispatchUpdatedBy: req.user._id,
  };
  if (remarks !== undefined) update.dispatchRemarks = remarks;
  if (status === "delivered") update.deliveredDate = deliveredDate ? new Date(deliveredDate) : new Date();

  const result = await Certificate.updateMany({ _id: { $in: certificateIds } }, update);

  // Auto-complete batches whose certificates are all delivered.
  const affectedBatches = await Certificate.distinct("dispatchBatch", {
    _id: { $in: certificateIds },
    dispatchBatch: { $ne: null },
  });
  for (const batchId of affectedBatches) {
    const remaining = await Certificate.countDocuments({
      dispatchBatch: batchId,
      dispatchStatus: { $nin: ["delivered", "cancelled", "returned", "lost"] },
    });
    if (remaining === 0) {
      await DispatchBatch.findByIdAndUpdate(batchId, { status: "completed" });
    }
  }

  await auditService.log({
    action: "UPDATE_CERTIFICATE_DISPATCH_STATUS",
    entity: "Certificate",
    performedBy: req.user._id,
    details: `Set status "${status}" on ${result.modifiedCount} certificate(s)`,
    changes: { certificateIds, status },
  });

  res.json({ success: true, message: `${result.modifiedCount} certificate(s) updated` });
});

// ── Expenses ─────────────────────────────────────────────────────────────────
export const getExpenseCategories = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: DISPATCH_EXPENSE_CATEGORIES });
});

export const createExpense = asyncHandler(async (req, res) => {
  const {
    expenseDate, category, item, quantity, unitPrice, total,
    vendor, billNumber, paymentMode, paidBy, notes, dispatchBatch,
  } = req.body;

  if (!category || !item) throw new ApiError(400, "category and item are required");
  if (!DISPATCH_EXPENSE_CATEGORIES.includes(category)) throw new ApiError(400, "Invalid expense category");

  let billUrl = "";
  let billPublicId = "";
  if (req.file) {
    const uploaded = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname, "dispatch/expense-bills");
    billUrl = uploaded.url;
    billPublicId = uploaded.public_id;
  }

  const expense = await DispatchExpense.create({
    expenseDate: expenseDate || new Date(),
    category,
    item,
    quantity: Number(quantity) || 1,
    unitPrice: Number(unitPrice) || 0,
    total: total !== undefined ? Number(total) : undefined,
    vendor: vendor || "",
    billNumber: billNumber || "",
    paymentMode: paymentMode || "cash",
    paidBy: paidBy || req.user._id,
    notes: notes || "",
    billUrl,
    billPublicId,
    dispatchBatch: dispatchBatch || null,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Expense recorded", data: expense });
});

export const getAllExpenses = asyncHandler(async (req, res) => {
  const {
    category, dispatchBatch, dateFrom, dateTo, hasNoBill,
    page = 1, limit = 30,
  } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (dispatchBatch) filter.dispatchBatch = dispatchBatch;
  if (hasNoBill === "true") filter.billUrl = "";
  if (dateFrom || dateTo) {
    filter.expenseDate = {};
    if (dateFrom) filter.expenseDate.$gte = new Date(dateFrom);
    if (dateTo) filter.expenseDate.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [expenses, total, totalAgg] = await Promise.all([
    DispatchExpense.find(filter)
      .populate("paidBy", "name")
      .populate("dispatchBatch", "batchNumber")
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    DispatchExpense.countDocuments(filter),
    DispatchExpense.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: "$total" } } }]),
  ]);

  res.json({
    success: true,
    data: {
      expenses, total, page: Number(page), limit: Number(limit),
      totalAmount: totalAgg[0]?.total || 0,
    },
  });
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await DispatchExpense.findById(req.params.id)
    .populate("paidBy", "name")
    .populate("dispatchBatch", "batchNumber");
  if (!expense) throw new ApiError(404, "Expense not found");
  res.json({ success: true, data: expense });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await DispatchExpense.findById(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found");

  const fields = [
    "expenseDate", "category", "item", "quantity", "unitPrice", "total",
    "vendor", "billNumber", "paymentMode", "paidBy", "notes", "dispatchBatch",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) expense[f] = req.body[f];
  });

  if (req.file) {
    const uploaded = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname, "dispatch/expense-bills");
    expense.billUrl = uploaded.url;
    expense.billPublicId = uploaded.public_id;
  }

  await expense.save();
  res.json({ success: true, message: "Expense updated", data: expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await DispatchExpense.findByIdAndDelete(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found");
  res.json({ success: true, message: "Expense deleted" });
});

// ── Reports ──────────────────────────────────────────────────────────────────
// Shared resolver used by both the JSON report endpoint and the CSV export,
// so the filtering logic lives in exactly one place.
const resolveDispatchReport = async (query) => {
  const { type = "daily", dateFrom, dateTo, month, year } = query;

  const dateFilter = {};
  if (dateFrom || dateTo) {
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
  } else {
    const range = monthBounds(month, year);
    if (range) Object.assign(dateFilter, range);
  }

  const STATUS_REPORT_TYPES = {
    pending: "pending",
    delivered: "delivered",
    returned: "returned",
    cancelled: "cancelled",
  };

  if (type === "expense") {
    const filter = Object.keys(dateFilter).length ? { expenseDate: dateFilter } : {};
    return DispatchExpense.find(filter)
      .populate("paidBy", "name")
      .populate("dispatchBatch", "batchNumber")
      .sort({ expenseDate: -1 })
      .lean();
  }

  if (type === "batch") {
    const filter = Object.keys(dateFilter).length ? { dispatchDate: dateFilter } : {};
    return DispatchBatch.find(filter).populate("postedBy", "name").sort({ dispatchDate: -1 }).lean();
  }

  if (STATUS_REPORT_TYPES[type]) {
    const filter = { dispatchStatus: STATUS_REPORT_TYPES[type] };
    if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;
    const rows = await Certificate.find(filter).populate(CERT_POPULATE).sort({ createdAt: -1 }).lean();
    return rows.map((c) => ({ ...c, receiver: toReceiver(c.studentId) }));
  }

  // "daily" or "monthly" — all dispatch activity in range
  const filter = {};
  if (Object.keys(dateFilter).length) filter.dispatchDate = dateFilter;
  else filter.dispatchDate = { $ne: null };

  const rows = await Certificate.find(filter).populate(CERT_POPULATE).sort({ dispatchDate: -1 }).lean();
  return rows.map((c) => ({ ...c, receiver: toReceiver(c.studentId) }));
};

export const getDispatchReport = asyncHandler(async (req, res) => {
  const rows = await resolveDispatchReport(req.query);
  res.json({ success: true, data: rows });
});

const csvEscape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export const exportDispatchReportCSV = asyncHandler(async (req, res) => {
  const { type = "daily" } = req.query;
  const rows = await resolveDispatchReport(req.query);

  if (!rows.length) {
    return res.json({ success: true, message: "No records found", data: [] });
  }

  let csvRows;
  if (type === "expense") {
    csvRows = rows.map((e) => ({
      Date: e.expenseDate ? new Date(e.expenseDate).toLocaleDateString("en-GB") : "",
      Category: e.category,
      Item: e.item,
      Quantity: e.quantity,
      UnitPrice: e.unitPrice,
      Total: e.total,
      Vendor: e.vendor || "",
      BillNumber: e.billNumber || "",
      PaymentMode: e.paymentMode,
      Batch: e.dispatchBatch?.batchNumber || "",
      PaidBy: e.paidBy?.name || "",
      Notes: e.notes || "",
    }));
  } else if (type === "batch") {
    csvRows = rows.map((b) => ({
      BatchNumber: b.batchNumber,
      DispatchDate: b.dispatchDate ? new Date(b.dispatchDate).toLocaleDateString("en-GB") : "",
      CourierOffice: b.courierOffice || "",
      Status: b.status,
      TrackingNumber: b.speedPost?.trackingNumber || "",
      TotalCharges: b.speedPost?.totalCharges || 0,
      Weight: b.speedPost?.weight || 0,
      PostedBy: b.postedBy?.name || "",
    }));
  } else {
    csvRows = rows.map((c) => ({
      CertificateNumber: c.certificateNumber,
      Candidate: c.receiver?.candidateName || "",
      Email: c.receiver?.email || "",
      Mobile: c.receiver?.mobile || "",
      Course: c.courseId?.title || "",
      Status: c.dispatchStatus,
      Batch: c.dispatchBatch?.batchNumber || "",
      TrackingNumber: c.trackingNumber || "",
      DispatchDate: c.dispatchDate ? new Date(c.dispatchDate).toLocaleDateString("en-GB") : "",
      DeliveredDate: c.deliveredDate ? new Date(c.deliveredDate).toLocaleDateString("en-GB") : "",
      Remarks: c.dispatchRemarks || "",
    }));
  }

  const headers = Object.keys(csvRows[0]).join(",");
  const csv = [headers, ...csvRows.map((r) => Object.values(r).map(csvEscape).join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=dispatch-${type}-report-${Date.now()}.csv`);
  res.send(csv);
});
