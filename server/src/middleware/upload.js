import multer from "multer";

// ── Disk storage for general file uploads ──────────────────────────────
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// ── Memory storage for CSV / in-memory processing ──────────────────────
const memoryStorage = multer.memoryStorage();

const upload = multer({ storage: diskStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadMemory = multer({ storage: memoryStorage, limits: { fileSize: 5 * 1024 * 1024 } });

export default upload;
export { uploadMemory };
