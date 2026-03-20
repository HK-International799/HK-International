// import mongoose from "mongoose";

// const lessonSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },

//     description: String,

//     videoUrl: String,

//     materials: [
//       {
//         title: String,
//         fileUrl: String,
//       },
//     ],

//     sectionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Section",
//       required: true,
//     },

//     order: {
//       type: Number,
//       default: 0,
//     },

//     duration: Number, // seconds
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Lesson", lessonSchema);


import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String, // Cloudinary video URL
      default: "",
    },

    materials: [
      {
        title: { type: String, trim: true },
        fileUrl: { type: String }, // Cloudinary file URL
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

    duration: {
      type: Number, // seconds
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);