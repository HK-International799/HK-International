// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   type: { type: String, enum: ["info", "warning", "assignment", "grade"], default: "info" },
//   title: String,
//   body: String,
//   isRead: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("Notification", notificationSchema);


import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["info", "warning", "assignment", "grade", "message"],
      default: "info",
    },

    title: {
      type: String,
      trim: true,
    },

    body: {
      type: String,
      trim: true,
    },

    // Optional: ID of the related resource (assignment, submission, message etc.)
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Optional: URL or route path to navigate to on click
    link: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // use timestamps: true — no manual createdAt
);

// Index for fast user notification feed
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);