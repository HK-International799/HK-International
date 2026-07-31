


// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

// /**
//  * Uploads a file buffer to Cloudinary.
//  * @param {Buffer} buffer - File buffer
//  * @param {string} originalName - Original file name (used as display name)
//  * @param {string} folder - Cloudinary folder path
//  * @returns {{ url: string, public_id: string }}
//  */
// export const uploadPdfToCloudinary = (buffer, originalName, folder = "assignments/files") => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         resource_type: "raw", // PDFs, DOCX, etc. must use "raw"
//         use_filename: true,
//         unique_filename: true,
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve({
//           url: result.secure_url,
//           public_id: result.public_id, // ✅ consistent key name
//         });
//       }
//     );

//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
// };

// /**
//  * Deletes a file from Cloudinary by public_id.
//  * @param {string} publicId
//  */
// export const deletePdfFromCloudinary = async (publicId) => {
//   if (!publicId) return;
//   try {
//     await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
//   } catch (err) {
//     console.error("Cloudinary delete error:", err.message);
//   }
// };


import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

/*
 * Cloudinary configuration
 *
 * These variables MUST exist in Vercel Production:
 *
 * CLOUDINARY_CLOUD_NAME
 * CLOUDINARY_API_KEY
 * CLOUDINARY_API_SECRET
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary.
 *
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} folder
 * @returns {{ url: string, public_id: string }}
 */
export const uploadPdfToCloudinary = (
  buffer,
  originalName,
  folder = "assignments/files"
) => {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return reject(new Error("Invalid or missing file buffer"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", {
            message: error.message,
            http_code: error.http_code,
          });

          return reject(error);
        }

        if (!result?.secure_url || !result?.public_id) {
          return reject(
            new Error("Cloudinary upload completed without file details")
          );
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes a file from Cloudinary by public_id.
 *
 * @param {string} publicId
 */
export const deletePdfFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
  } catch (err) {
    console.error("Cloudinary delete error:", {
      message: err.message,
      http_code: err.http_code,
    });
  }
};