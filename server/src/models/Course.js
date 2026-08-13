// import mongoose from "mongoose";

// const courseSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       default: "",
//     },

//     thumbnail: {
//       type: String, // Cloudinary URL
//       default: "",
//     },

//     // Sections hold the lessons — no top-level lessons array (avoids duplication)
//     sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],

//     // The tutor responsible for this course (assigned by admin)
//     assignedTutor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     // The admin who created this course
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },

//     // Workflow state
//     status: {
//       type: String,
//       enum: ["draft", "published", "archived"],
//       default: "draft",
//     },

//     enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },

//   { timestamps: true },
// );

// export default mongoose.model("Course", courseSchema);




import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
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

    thumbnail: {
      type: String, // Cloudinary URL
      default: "",
    },

    // Sections hold the lessons — no top-level lessons array (avoids duplication)
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],

    // The tutor responsible for this course (assigned by admin)
    assignedTutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // The admin who created this course
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Workflow state
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ── Certificate-template support (additive) ─────────────────────────────
    // Small, optional extension requested by the certificate feature — see
    // build-prompt §2. No course code / duration field existed before this.
    // Accrediting body is intentionally NOT duplicated here: it is resolved
    // from the existing AwardingOrganisation.courses[] back-reference at
    // certificate-generation/verification time (see certificateController.js
    // resolveAwardingOrganisation) so there is only one source of truth.
    courseCode: { type: String, default: "", trim: true },
    durationText: { type: String, default: "", trim: true }, // e.g. "1 Day", "6 Weeks"
  },

  { timestamps: true },
);

export default mongoose.model("Course", courseSchema);
