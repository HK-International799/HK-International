import Document from "../models/Document.js";

// ✅ Upload Document (Student Only Recommended)
export const uploadDocument = async (req, res) => {
  try {


    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const { title, description, courseId } = req.body;

    const allowedTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
];

if (!allowedTypes.includes(req.file.mimetype)) {
  return res.status(400).json({ message: "Invalid file type" });
}

    // Optional: restrict only students
    // if (req.user.role !== "student") {
    //   return res.status(403).json({ message: "Only students can upload" });
    // }

    const document = await Document.create({
      title,
      description,
      courseId: courseId || null,
      uploadedBy: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Documents (Role-Based Smart Fetch)
export const getAllDocuments = async (req, res) => {
  try {
    const { status, courseId, page = 1, limit = 10 } = req.query;

    let filter = {};

    // 🎯 Student → only their docs
    if (req.user.role === "student") {
      filter.uploadedBy = req.user.id;
    }

    // 🎯 Admin/Tutor → full access + filters
    if (status) filter.status = status;
    if (courseId) filter.courseId = courseId;

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate("uploadedBy", "name email")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      Document.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Single Document (Secure Access)
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("uploadedBy", "name email")
      .populate("reviewedBy", "name email");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // 🔐 Student can only view own doc
    if (
      req.user.role === "student" &&
      document.uploadedBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Review Document (Admin/Tutor Workflow)
export const reviewDocument = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!["approved", "rejected", "under-review"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.status = status;
    document.reviewNotes = reviewNotes || "";
    document.reviewedBy = req.user.id;
    document.reviewedAt = new Date();

    await document.save();

    res.status(200).json({
      success: true,
      message: "Review updated",
      data: document,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Document (Admin Only)
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: "Document deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};