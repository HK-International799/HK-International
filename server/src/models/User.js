import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "student",
    },
    adminLoginId: {
      type: String,
      unique: true,
      sparse: true,
    },

    isFirstLogin: { type: Boolean, default: true },

    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
