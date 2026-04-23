

import multer from "multer";

// ── Memory storage ─────────────────────────────
const storage = multer.memoryStorage();

// ── File filter ─────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/csv",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX, PPT, PPTX, CSV files are allowed"), false);
  }
};

// ── Large file upload (Cloudinary) ─────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// ── Small CSV upload ─────────────────────────────
const uploadMemory = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
export { uploadMemory };