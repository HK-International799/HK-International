import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    videoUrl: String,

    materials: [
      {
        title: String,
        fileUrl: String,
      },
    ],

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    duration: Number, // seconds
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);