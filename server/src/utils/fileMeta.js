/**
 * fileMeta
 *
 * Shared helpers so every document-upload path (registration KYC docs,
 * general course documents) stores consistent, trustworthy file metadata,
 * and so every download path can safely reconstruct a Content-Disposition
 * filename that matches the actual uploaded file type.
 *
 * Root cause this addresses: the download filename/extension must reflect
 * the ACTUAL file content, not a user-editable "title" that could drift
 * from the real MIME type (e.g. a "document.pdf" must never be served as
 * "document.docx").
 */

// MIME type → canonical extension. Deliberately conservative: only types
// already accepted by middleware/upload.js's filters are listed, so this
// never invents an extension for a file type the app doesn't allow anyway.
const MIME_EXTENSION_MAP = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "text/csv": "csv",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Derive the extension from an original filename, e.g. "Passport.PDF" -> "pdf".
 */
export const extensionFromFilename = (filename = "") => {
  const match = /\.([a-zA-Z0-9]+)$/.exec(String(filename || "").trim());
  return match ? match[1].toLowerCase() : "";
};

/**
 * Resolve the extension that should actually be used for storage/download,
 * trusting the real MIME type over a possibly-wrong client-supplied
 * filename extension when the two disagree.
 */
export const resolveExtension = (originalName, mimeType) => {
  const fromMime = MIME_EXTENSION_MAP[mimeType];
  if (fromMime) return fromMime;
  return extensionFromFilename(originalName);
};

/**
 * Build the metadata block stored on a Document record for a given
 * multer file object (memoryStorage — has originalname, mimetype, size).
 *
 * `displayName` lets a caller pass a user-provided display title (e.g. a
 * "title" form field); when absent, the original filename is used as the
 * display name, per Registration Requirement 4.
 */
export const buildFileMeta = (file, displayName) => {
  const originalName = file?.originalname || "file";
  const mimeType = file?.mimetype || "";
  const extension = resolveExtension(originalName, mimeType);

  const cleanDisplayName = (displayName || "").trim();

  return {
    originalName,
    mimeType,
    extension,
    size: file?.size || 0,
    // Preserve the user-provided/original name for display + download.
    fileName: cleanDisplayName || originalName,
    title: cleanDisplayName || originalName,
  };
};

/**
 * Build a Content-Disposition-safe filename for downloads: uses the
 * stored display filename, but always forces the extension that matches
 * the real stored MIME type/extension so a mismatched title can never
 * cause a wrong-extension download.
 */
export const buildDownloadFilename = (doc) => {
  const base =
    (doc?.fileName || doc?.originalName || doc?.title || "document")
      .toString()
      .trim();

  const correctExt = doc?.extension || extensionFromFilename(doc?.originalName);
  const baseExt = extensionFromFilename(base);

  let finalName = base;
  if (correctExt && baseExt !== correctExt) {
    // Strip any (possibly wrong) extension already on the base name, then
    // append the correct one.
    finalName = baseExt
      ? base.slice(0, -(baseExt.length + 1))
      : base;
    finalName = `${finalName}.${correctExt}`;
  } else if (correctExt && !baseExt) {
    finalName = `${base}.${correctExt}`;
  }

  // Strip characters that break Content-Disposition / filesystems.
  return finalName.replace(/["\r\n]/g, "").trim() || `document.${correctExt || "bin"}`;
};

export default {
  extensionFromFilename,
  resolveExtension,
  buildFileMeta,
  buildDownloadFilename,
};
