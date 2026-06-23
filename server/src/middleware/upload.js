

// import multer from "multer";

// // ── Memory storage ─────────────────────────────
// const storage = multer.memoryStorage();

// // ── File filter ─────────────────────────────
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "application/vnd.ms-powerpoint",
//     "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     "text/csv",
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF, DOC, DOCX, PPT, PPTX, CSV files are allowed"), false);
//   }
// };

// // ── Large file upload (Cloudinary) ─────────────────────────────
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 100MB
//   },
// });

// // ── Small CSV upload ─────────────────────────────
// const uploadMemory = multer({
//   storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// export default upload;
// export { uploadMemory };







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

// ── Registration KYC documents (images + PDF) ─────────────────────────────
// Additive: separate multer instance, does not touch the existing
// `upload` / `uploadMemory` exports or their filters/limits.
const registrationDocFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed"), false);
  }
};

const uploadRegistrationDocs = multer({
  storage,
  fileFilter: registrationDocFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB, per spec
  },
});

export default upload;
export { uploadMemory, uploadRegistrationDocs };