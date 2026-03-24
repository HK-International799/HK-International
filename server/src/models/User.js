import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true, // "User@Email.com" → "user@email.com" — prevents duplicate accounts
    },
    mobile: {
      type: String,
      required: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "student",
    },

    isFirstLogin: {
      type: Boolean,
      default: true,
    },

    // For students: courses they are enrolled in
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    // For tutors: courses assigned to them by admin
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    // Optional profile picture (Cloudinary URL)
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
