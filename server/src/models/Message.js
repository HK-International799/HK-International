import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
