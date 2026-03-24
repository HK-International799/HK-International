import Document from "../models/Document.js";

export const uploadDocument = async (req, res) => {
  try {
    const doc = await Document.create({ ...req.body, uploadedBy: req.user._id });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: "Error uploading document", error: err.message });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const docs = await Document.find(filter)
      .populate("uploadedBy", "name email")
      .populate("reviewedBy", "name email")
      .populate("courseId", "title")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching documents", error: err.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate("uploadedBy", "name email")
      .populate("reviewedBy", "name email");
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Error fetching document", error: err.message });
  }
};

export const reviewDocument = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status, reviewNotes, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Error reviewing document", error: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting document", error: err.message });
  }
};
