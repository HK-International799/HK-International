// // import mongoose from "mongoose";

// // const messageSchema = new mongoose.Schema({
// //   senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// //   receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// //   courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
// //   content: { type: String, required: true },
// //   isRead: { type: Boolean, default: false },
// //   timestamp: { type: Date, default: Date.now }
// // });

// // export default mongoose.model("Message", messageSchema);



// import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema(
//   {
//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     receiverId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // Optional: context of which course the conversation is about
//     courseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       default: null,
//     },

//     content: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     isRead: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true } // createdAt and updatedAt — consistent with all other models
// );

// // Index for fast thread fetching between two users
// messageSchema.index({ senderId: 1, receiverId: 1 });
// messageSchema.index({ receiverId: 1, senderId: 1 });

// export default mongoose.model("Message", messageSchema);



import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Single optimized index
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);