import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

/**
 * IMPORTANT: Vercel dashboard values are sometimes pasted with a
 * trailing newline/space (very common when copy-pasting from a
 * password manager or terminal). Cloudinary's signature is a hash of
 * the exact byte string, so a single stray whitespace character will
 * produce a valid-looking cloud_name (it still shows up in the request
 * URL) while the API key/secret cause "Invalid Signature" errors.
 * Trimming here defends against that class of bug without needing to
 * touch anything in the Vercel dashboard.
 */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

// Never log actual secret values. Only log presence/absence so
// production logs are safe to share when debugging.
console.log("[cloudinary] config loaded:", {
  cloud_name_present: !!cloudName,
  api_key_present: !!apiKey,
  api_secret_present: !!apiSecret,
});

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "[cloudinary] Missing one or more required environment variables " +
      "(CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). " +
      "File uploads will fail until these are set correctly in Vercel " +
      "(Production AND Preview environments)."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
