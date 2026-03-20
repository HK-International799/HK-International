import { v2 as cloudinary } from "cloudinary";

// This file is imported after dotenv.config() runs in server.js,
// so process.env values are already available here.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;