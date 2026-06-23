// import mongoose from "mongoose";

// const documentSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     description: { type: String, default: "" },
//     fileUrl: { type: String, required: true },
//     originalName: { type: String, default: "" },
//     fileType: { type: String, default: "" },
//     courseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       default: null,
//     },
//     uploadedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     reviewedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "under-review", "approved", "rejected"],
//       default: "pending",
//     },
//     reviewNotes: { type: String, default: "" },
//     reviewedAt: { type: Date, default: null },
//   },
//   { timestamps: true },
// );

// export default mongoose.model("Document", documentSchema);





// import mongoose from "mongoose";

// const documentSchema = new mongoose.Schema(
// {
//   registration: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Registration",
//     required: true,
//   },

//   type: {
//     type: String,
//     required: true,
//   },

//   fileName: {
//     type: String,
//     required: true,
//   },

//   fileUrl: {
//     type: String,
//     required: true,
//   },

//   uploadedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     default: null,
//   },

//   verified: {
//     type: Boolean,
//     default: false,
//   },

//   verifiedAt: {
//     type: Date,
//     default: null,
//   },
// },
// {
//   timestamps: true,
// }
// );

// const Document =
//   mongoose.models.Document ||
//   mongoose.model("Document", documentSchema);

// export default Document;







import mongoose from "mongoose";

const documentSchema =
new mongoose.Schema(
{
registration:{
type:
mongoose.Schema.Types.ObjectId,
ref:"Registration",
required:true,
},

type:{
type:String,
required:true,
},

fileName:{
type:String,
required:true,
},

fileUrl:{
type:String,
required:true,
},

uploadedBy:{
type:
mongoose.Schema.Types.ObjectId,
ref:"User",
},
},
{
timestamps:true,
}
);

const Document =
mongoose.models.Document ||
mongoose.model(
"Document",
documentSchema
);

export default Document;