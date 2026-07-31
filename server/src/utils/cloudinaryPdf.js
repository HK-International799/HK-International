import streamifier from "streamifier";

// ✅ FIX: This file previously called `cloudinary.config()` a second time,
// independently of `src/config/cloudinary.js`, using untrimmed
// `process.env` values. Two separate configuration calls for the same
// SDK singleton is a classic source of "which one actually wins" bugs —
// in this case the untrimmed values here were the ones taking effect
// for assignment submissions, producing the "Invalid Signature" errors
// in production. There must be exactly ONE place that calls
// `cloudinary.config()`. We now import the already-configured,
// trimmed, validated instance instead.
import cloudinary from "../config/cloudinary.js";

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original file name (used as display name)
 * @param {string} folder - Cloudinary folder path
 * @returns {{ url: string, public_id: string }}
 */
export const uploadPdfToCloudinary = (
  buffer,
  originalName,
  folder = "assignments/files"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw", // PDFs, DOCX, PPTX, CSV etc. must use "raw"
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", {
            message: error?.message,
            http_code: error?.http_code,
            folder,
          });
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id, // consistent key name across the codebase
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes a file from Cloudinary by public_id.
 * Uses the SAME resource_type ("raw") as the upload above — a mismatch
 * here would silently fail to delete the old file.
 * @param {string} publicId
 */
export const deletePdfFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};
