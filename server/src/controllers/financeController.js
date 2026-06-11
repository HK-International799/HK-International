import LearnerPayment      from "../models/LearnerPayment.js";
import CourseEnrollmentFee from "../models/CourseEnrollmentFee.js";
import User                from "../models/User.js";
import Course              from "../models/Course.js";
import asyncHandler        from "../utils/asyncHandler.js";
import ApiError            from "../utils/ApiError.js";
import auditService        from "../services/auditService.js";
import cloudinary          from "../config/cloudinary.js";
import streamifier         from "streamifier";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Calculate payment summary for a learner + course combination.
 * Returns: totalCourseFee, totalPaid, balance, status, paymentCount
 */
const calcSummary = async (learnerId, courseId) => {
  const records = await LearnerPayment.find({
    learnerId,
    courseId,
    isDeleted: false,
  }).sort({ paymentDate: 1 }).lean();

  if (records.length === 0) {
    return {
      totalCourseFee: 0,
      totalPaid:      0,
      balance:        0,
      status:         "not_paid",
      paymentCount:   0,
      records,
    };
  }

  // Use the most recently set totalCourseFee (last record has the latest value)
  const totalCourseFee = records[records.length - 1].totalCourseFee;

  const totalPaid = records.reduce((sum, r) => {
    // Don't count refunds as positive payments
    if (r.status === "refund_issued") return sum - r.amount;
    return sum + r.amount;
  }, 0);

  const balance = Math.max(0, totalCourseFee - totalPaid);

  let status;
  if (totalPaid <= 0)                    status = "not_paid";
  else if (balance <= 0)                 status = "fully_paid";
  else if (totalPaid > 0 && balance > 0) status = "part_payment";
  else                                   status = "balance_pending";

  return { totalCourseFee, totalPaid, balance, status, paymentCount: records.length, records };
};

/**
 * Determine the payment status for a single record in context of all records.
 */
const resolveRecordStatus = (amount, totalCourseFee, allPaidSoFar, mode) => {
  if (mode === "refund_issued") return "refund_issued";
  if (mode === "adjustment")    return "adjustment";
  if (allPaidSoFar >= totalCourseFee) return "fully_paid";
  if (allPaidSoFar > 0)               return "part_payment";
  return "balance_pending";
};

/* ═══════════════════════════════════════════════════════════════════════════
   COURSE ENROLLMENT FEES
═══════════════════════════════════════════════════════════════════════════ */

// ── Set / update course fee ────────────────────────────────────────────────
export const setCourseFee = asyncHandler(async (req, res) => {
  const { courseId, fee, currency, notes } = req.body;

  if (!courseId || fee === undefined) {
    throw new ApiError(400, "courseId and fee are required");
  }
  if (Number(fee) < 0) throw new ApiError(400, "Fee cannot be negative");

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  const record = await CourseEnrollmentFee.findOneAndUpdate(
    { courseId },
    { fee: Number(fee), currency: currency || "GBP", notes: notes || "", updatedBy: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );

  await auditService.log({
    action:      "FINANCE_COURSE_FEE_SET",
    entity:      "CourseEnrollmentFee",
    entityId:    record._id,
    performedBy: req.user._id,
    details:     `Course fee set: ${course.title} = ${fee} ${currency || "GBP"}`,
  });

  res.json({ success: true, data: record });
});

// ── Get all course fees ────────────────────────────────────────────────────
export const getAllCourseFees = asyncHandler(async (_req, res) => {
  const fees = await CourseEnrollmentFee.find()
    .populate("courseId", "title status")
    .populate("updatedBy", "name")
    .sort({ updatedAt: -1 })
    .lean();

  res.json({ success: true, data: fees });
});

// ── Get fee for single course ──────────────────────────────────────────────
export const getCourseFee = asyncHandler(async (req, res) => {
  const fee = await CourseEnrollmentFee.findOne({ courseId: req.params.courseId })
    .populate("courseId", "title")
    .lean();

  res.json({ success: true, data: fee || null });
});

/* ═══════════════════════════════════════════════════════════════════════════
   PAYMENT RECORDING
═══════════════════════════════════════════════════════════════════════════ */

// ── Record a manual payment (installment) ─────────────────────────────────
export const recordPayment = asyncHandler(async (req, res) => {
  const {
    learnerId,
    courseId,
    totalCourseFee,
    amount,
    currency,
    paymentDate,
    paymentMode,
    referenceNumber,
    remarks,
    status: manualStatus,
  } = req.body;

  // Validation
  if (!learnerId)      throw new ApiError(400, "learnerId is required");
  if (!courseId)       throw new ApiError(400, "courseId is required");
  if (!paymentMode)    throw new ApiError(400, "paymentMode is required");
  if (amount === undefined || amount === null) throw new ApiError(400, "amount is required");
  if (Number(amount) < 0) throw new ApiError(400, "amount cannot be negative");
  if (totalCourseFee === undefined) throw new ApiError(400, "totalCourseFee is required");

  // Verify learner exists
  const learner = await User.findById(learnerId).select("name email role");
  if (!learner) throw new ApiError(404, "Learner not found");

  // Verify course exists
  const course = await Course.findById(courseId).select("title");
  if (!course) throw new ApiError(404, "Course not found");

  // Handle proof file upload (multipart)
  let proofUrl       = "";
  let proofPublicId  = "";

  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "finance/proofs", resource_type: "auto" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    proofUrl      = uploadResult.secure_url;
    proofPublicId = uploadResult.public_id;
  }

  // Calculate running total to determine status
  const existing = await LearnerPayment.find({
    learnerId, courseId, isDeleted: false,
  }).lean();

  const paidSoFar    = existing.reduce((s, r) => s + (r.status === "refund_issued" ? -r.amount : r.amount), 0);
  const newTotalPaid = paidSoFar + Number(amount);
  const computedStatus = manualStatus || (
    newTotalPaid >= Number(totalCourseFee) ? "fully_paid" :
    newTotalPaid > 0 ? "part_payment" : "balance_pending"
  );

  const payment = await LearnerPayment.create({
    learnerId,
    courseId,
    totalCourseFee: Number(totalCourseFee),
    amount:          Number(amount),
    currency:        currency || "GBP",
    paymentDate:     paymentDate ? new Date(paymentDate) : new Date(),
    paymentMode,
    referenceNumber: referenceNumber || "",
    remarks:         remarks || "",
    status:          computedStatus,
    proofUrl,
    proofPublicId,
    recordedBy:      req.user._id,
  });

  await auditService.log({
    action:      "FINANCE_PAYMENT_RECORDED",
    entity:      "LearnerPayment",
    entityId:    payment._id,
    performedBy: req.user._id,
    details:     `Payment of ${amount} recorded for ${learner.email} — ${course.title}`,
  });

  // Return with updated summary
  const summary = await calcSummary(learnerId, courseId);

  res.status(201).json({
    success: true,
    message: "Payment recorded successfully",
    data:    { payment, summary },
  });
});

// ── Get all payments (paginated, filterable) ───────────────────────────────
export const getAllPayments = asyncHandler(async (req, res) => {
  const {
    learnerId, courseId, paymentMode, status,
    search, dateFrom, dateTo,
    page = 1, limit = 30,
  } = req.query;

  const filter = { isDeleted: false };
  if (learnerId)   filter.learnerId   = learnerId;
  if (courseId)    filter.courseId    = courseId;
  if (paymentMode) filter.paymentMode = paymentMode;
  if (status)      filter.status      = status;
  if (dateFrom || dateTo) {
    filter.paymentDate = {};
    if (dateFrom) filter.paymentDate.$gte = new Date(dateFrom);
    if (dateTo)   filter.paymentDate.$lte = new Date(new Date(dateTo).setHours(23,59,59));
  }

  // Search by reference number or remarks
  if (search) {
    filter.$or = [
      { referenceNumber: { $regex: search, $options: "i" } },
      { remarks:         { $regex: search, $options: "i" } },
    ];
  }

  const [payments, total] = await Promise.all([
    LearnerPayment.find(filter)
      .populate("learnerId",  "name email mobile")
      .populate("courseId",   "title")
      .populate("recordedBy", "name")
      .sort({ paymentDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    LearnerPayment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { payments, total, page: Number(page), limit: Number(limit) },
  });
});

// ── Get single payment ─────────────────────────────────────────────────────
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await LearnerPayment.findOne({
    _id: req.params.id, isDeleted: false,
  })
    .populate("learnerId",          "name email mobile role")
    .populate("courseId",           "title status")
    .populate("recordedBy",         "name email")
    .populate("razorpayPaymentRef", "orderId paymentId amount status")
    .lean();

  if (!payment) throw new ApiError(404, "Payment record not found");

  res.json({ success: true, data: payment });
});

// ── Update a payment record ────────────────────────────────────────────────
export const updatePayment = asyncHandler(async (req, res) => {
  const allowed = [
    "amount", "paymentDate", "paymentMode", "referenceNumber",
    "remarks", "status", "totalCourseFee", "currency",
    "invoiceGenerated", "invoiceUrl", "receiptGenerated", "receiptUrl",
  ];

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  // Handle proof file upload
  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "finance/proofs", resource_type: "auto" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    updates.proofUrl      = uploadResult.secure_url;
    updates.proofPublicId = uploadResult.public_id;
  }

  const payment = await LearnerPayment.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    updates,
    { new: true, runValidators: true }
  );

  if (!payment) throw new ApiError(404, "Payment record not found");

  await auditService.log({
    action:      "FINANCE_PAYMENT_UPDATED",
    entity:      "LearnerPayment",
    entityId:    payment._id,
    performedBy: req.user._id,
    details:     `Payment record updated`,
  });

  res.json({ success: true, data: payment });
});

// ── Soft-delete a payment (super_admin only) ───────────────────────────────
export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await LearnerPayment.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, deletedBy: req.user._id, deletedAt: new Date() },
    { new: true }
  );

  if (!payment) throw new ApiError(404, "Payment record not found");

  await auditService.log({
    action:      "FINANCE_PAYMENT_DELETED",
    entity:      "LearnerPayment",
    entityId:    payment._id,
    performedBy: req.user._id,
    details:     `Payment record soft-deleted`,
  });

  res.json({ success: true, message: "Payment record deleted" });
});

/* ═══════════════════════════════════════════════════════════════════════════
   LEARNER PAYMENT PROFILE
═══════════════════════════════════════════════════════════════════════════ */

// ── All payments for a learner (across all courses) ────────────────────────
export const getLearnerPayments = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { courseId } = req.query;

  // Learners can only see their own records
  if (req.user.role === "student" && req.user._id.toString() !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const filter = { learnerId: userId, isDeleted: false };
  if (courseId) filter.courseId = courseId;

  const payments = await LearnerPayment.find(filter)
    .populate("courseId",   "title")
    .populate("recordedBy", "name")
    .sort({ paymentDate: -1 })
    .lean();

  res.json({ success: true, data: payments });
});

// ── Payment summary for a specific learner + course ────────────────────────
export const getLearnerCourseSummary = asyncHandler(async (req, res) => {
  const { userId, courseId } = req.params;

  if (req.user.role === "student" && req.user._id.toString() !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const learner = await User.findById(userId).select("name email mobile").lean();
  if (!learner) throw new ApiError(404, "Learner not found");

  const course = await Course.findById(courseId).select("title").lean();
  if (!course) throw new ApiError(404, "Course not found");

  const summary = await calcSummary(userId, courseId);

  // Check configured fee for this course
  const feeConfig = await CourseEnrollmentFee.findOne({ courseId }).lean();

  res.json({
    success: true,
    data: {
      learner,
      course,
      feeConfig: feeConfig || null,
      ...summary,
    },
  });
});

// ── Full learner finance overview (all courses, all payments) ──────────────
export const getLearnerFinanceOverview = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (req.user.role === "student" && req.user._id.toString() !== userId) {
    throw new ApiError(403, "Access denied");
  }

  const learner = await User.findById(userId).select("name email mobile enrolledCourses").lean();
  if (!learner) throw new ApiError(404, "Learner not found");

  // Get all payment records for this learner
  const allPayments = await LearnerPayment.find({ learnerId: userId, isDeleted: false })
    .populate("courseId", "title")
    .sort({ paymentDate: -1 })
    .lean();

  // Group by courseId
  const courseMap = {};
  for (const p of allPayments) {
    const cid = p.courseId?._id?.toString() || p.courseId?.toString();
    if (!courseMap[cid]) {
      courseMap[cid] = {
        course:          p.courseId,
        totalCourseFee:  p.totalCourseFee,
        payments:        [],
      };
    }
    courseMap[cid].payments.push(p);
  }

  // Build summary per course
  const courses = Object.values(courseMap).map((c) => {
    const totalPaid = c.payments.reduce((s, r) => s + (r.status === "refund_issued" ? -r.amount : r.amount), 0);
    const balance   = Math.max(0, c.totalCourseFee - totalPaid);
    const status    = totalPaid <= 0 ? "not_paid"
                    : balance <= 0   ? "fully_paid"
                    : "part_payment";

    return {
      course:         c.course,
      totalCourseFee: c.totalCourseFee,
      totalPaid,
      balance,
      status,
      paymentCount:   c.payments.length,
      payments:       c.payments,
    };
  });

  const grandTotalFee  = courses.reduce((s, c) => s + c.totalCourseFee, 0);
  const grandTotalPaid = courses.reduce((s, c) => s + c.totalPaid, 0);
  const grandBalance   = courses.reduce((s, c) => s + c.balance, 0);

  res.json({
    success: true,
    data: {
      learner,
      courses,
      totals: { grandTotalFee, grandTotalPaid, grandBalance },
    },
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   FINANCE DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */

export const getFinanceDashboard = asyncHandler(async (_req, res) => {
  const now         = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOf6M    = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalRevenueAgg,
    monthlyRevenueAgg,
    statusCountsAgg,
    paymentModeAgg,
    recentPayments,
    monthlyTrendAgg,
  ] = await Promise.all([

    // All-time total received
    LearnerPayment.aggregate([
      { $match: { isDeleted: false, status: { $nin: ["refund_issued"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // This month revenue
    LearnerPayment.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentDate: { $gte: startOfMonth },
          status: { $nin: ["refund_issued"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // Counts by status (distinct learner+course combos, approximate via payments)
    LearnerPayment.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Revenue by payment mode
    LearnerPayment.aggregate([
      { $match: { isDeleted: false, status: { $nin: ["refund_issued"] } } },
      { $group: { _id: "$paymentMode", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    // Recent 10 payments
    LearnerPayment.find({ isDeleted: false })
      .populate("learnerId", "name email")
      .populate("courseId",  "title")
      .sort({ paymentDate: -1 })
      .limit(10)
      .lean(),

    // Monthly trend (last 6 months)
    LearnerPayment.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentDate: { $gte: startOf6M },
          status: { $nin: ["refund_issued"] },
        },
      },
      {
        $group: {
          _id:      { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } },
          revenue:  { $sum: "$amount" },
          count:    { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const byStatus = {};
  for (const s of statusCountsAgg) byStatus[s._id] = s.count;

  res.json({
    success: true,
    data: {
      totalRevenue:      totalRevenueAgg[0]?.total   || 0,
      monthlyRevenue:    monthlyRevenueAgg[0]?.total  || 0,
      fullyPaidCount:    byStatus["fully_paid"]       || 0,
      partPaymentCount:  byStatus["part_payment"]     || 0,
      pendingCount:      byStatus["balance_pending"]  || 0,
      refundCount:       byStatus["refund_issued"]    || 0,
      paymentModes:      paymentModeAgg.map((m) => ({
        mode:  m._id || "other",
        total: m.total,
        count: m.count,
      })),
      recentPayments,
      monthlyTrend: monthlyTrendAgg.map((m) => ({
        month:   `${months[m._id.month - 1]} ${m._id.year}`,
        revenue: m.revenue,
        count:   m.count,
      })),
    },
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   REPORTS & EXPORT
═══════════════════════════════════════════════════════════════════════════ */

// ── Revenue report ─────────────────────────────────────────────────────────
export const getRevenueReport = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, courseId, paymentMode } = req.query;

  const match = { isDeleted: false, status: { $nin: ["refund_issued"] } };
  if (courseId)    match.courseId    = new (await import("mongoose")).default.Types.ObjectId(courseId);
  if (paymentMode) match.paymentMode = paymentMode;
  if (dateFrom || dateTo) {
    match.paymentDate = {};
    if (dateFrom) match.paymentDate.$gte = new Date(dateFrom);
    if (dateTo)   match.paymentDate.$lte = new Date(new Date(dateTo).setHours(23,59,59));
  }

  const [payments, summary] = await Promise.all([
    LearnerPayment.find(match)
      .populate("learnerId", "name email")
      .populate("courseId",  "title")
      .sort({ paymentDate: -1 })
      .lean(),
    LearnerPayment.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      payments,
      total: summary[0]?.total || 0,
      count: summary[0]?.count || 0,
    },
  });
});

// ── Pending payments report ────────────────────────────────────────────────
export const getPendingReport = asyncHandler(async (_req, res) => {
  // Get all part_payment and balance_pending records
  // Group by learnerId + courseId to show outstanding balance per enrollment

  const raw = await LearnerPayment.aggregate([
    {
      $match: { isDeleted: false },
    },
    {
      $group: {
        _id:            { learnerId: "$learnerId", courseId: "$courseId" },
        totalCourseFee: { $last:  "$totalCourseFee" },
        totalPaid: {
          $sum: {
            $cond: [{ $eq: ["$status", "refund_issued"] }, { $multiply: ["$amount", -1] }, "$amount"],
          },
        },
        lastPayment:   { $max: "$paymentDate" },
        paymentCount:  { $sum: 1 },
      },
    },
    {
      $addFields: {
        balance: { $max: [0, { $subtract: ["$totalCourseFee", "$totalPaid"] }] },
      },
    },
    {
      $match: { balance: { $gt: 0 } },
    },
    { $sort: { balance: -1 } },
  ]);

  // Populate learner + course
  const populated = await Promise.all(
    raw.map(async (r) => {
      const [learner, course] = await Promise.all([
        User.findById(r._id.learnerId).select("name email mobile").lean(),
        Course.findById(r._id.courseId).select("title").lean(),
      ]);
      return { ...r, learner, course };
    })
  );

  const totalOutstanding = populated.reduce((s, r) => s + r.balance, 0);

  res.json({
    success: true,
    data: { records: populated, totalOutstanding, count: populated.length },
  });
});

// ── Export payments as CSV ─────────────────────────────────────────────────
export const exportPaymentsCSV = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, courseId, learnerId, paymentMode, status } = req.query;

  const filter = { isDeleted: false };
  if (learnerId)   filter.learnerId   = learnerId;
  if (courseId)    filter.courseId    = courseId;
  if (paymentMode) filter.paymentMode = paymentMode;
  if (status)      filter.status      = status;
  if (dateFrom || dateTo) {
    filter.paymentDate = {};
    if (dateFrom) filter.paymentDate.$gte = new Date(dateFrom);
    if (dateTo)   filter.paymentDate.$lte = new Date(new Date(dateTo).setHours(23,59,59));
  }

  const payments = await LearnerPayment.find(filter)
    .populate("learnerId", "name email mobile")
    .populate("courseId",  "title")
    .populate("recordedBy","name")
    .sort({ paymentDate: -1 })
    .lean();

  const rows = payments.map((p) => ({
    Date:         p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "",
    LearnerName:  p.learnerId?.name  || "",
    LearnerEmail: p.learnerId?.email || "",
    LearnerPhone: p.learnerId?.mobile || "",
    Course:       p.courseId?.title  || "",
    CourseFee:    p.totalCourseFee,
    AmountPaid:   p.amount,
    Currency:     p.currency,
    PaymentMode:  p.paymentMode,
    Reference:    p.referenceNumber || "",
    Status:       p.status,
    Remarks:      p.remarks || "",
    RecordedBy:   p.recordedBy?.name || "",
    CreatedAt:    p.createdAt ? new Date(p.createdAt).toISOString() : "",
  }));

  if (rows.length === 0) {
    return res.json({ success: true, message: "No records found", data: [] });
  }

  const headers = Object.keys(rows[0]).join(",");
  const csv     = [
    headers,
    ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=finance-payments-${Date.now()}.csv`);
  res.send(csv);
});
