import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

/**
 * Uploads a PDF buffer to Cloudinary.
 * Returns { url, publicId }
 */
export const uploadPdfToCloudinary = (buffer, folder = "scenario-exams/pdfs") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw", // PDFs must use resource_type: raw
        format: "pdf",
        allowed_formats: ["pdf"],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes a file from Cloudinary by public ID.
 */
export const deletePdfFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};