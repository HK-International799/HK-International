import mongoose from "mongoose";
import dotenv from "dotenv";

// dotenv.config() is already called in server.js before this file is imported.
// Do NOT call it again here.

dotenv.config();
console.log(process.env.MONGO_URI)
const connectDB = async () => {
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;