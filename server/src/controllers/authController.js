import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// ── Register ───────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, role, adminSecretId } = req.body;

  if (!name || !email || !password || !mobile) {
    throw new ApiError(400, "Name, email, password and mobile are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  if (role && !["student", "tutor", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  if (role === "admin") {
    if (!adminSecretId || adminSecretId !== process.env.ADMIN_SECRET_ID) {
      throw new ApiError(403, "Invalid Admin Secret ID");
    }
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash: hashedPassword,
    mobile,
    role: role || "student",
    isFirstLogin: role === "admin" ? false : true,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
  });
});

// ── Login ──────────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, adminLoginId } = req.body;

  if (!password) throw new ApiError(400, "Password is required");

  let user = null;

  if (adminLoginId) {
    user = await User.findOne({
      $or: [{ email: adminLoginId.toLowerCase() }],
      role: { $in: ["admin", "super_admin"] },
    });
  } else if (email) {
    user = await User.findOne({ email: email.toLowerCase() });
  } else {
    throw new ApiError(400, "Email or adminLoginId is required");
  }

  if (!user) throw new ApiError(401, "Invalid credentials");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        avatar: user.avatar,
      },
    },
  });
});

// ── Change Password ───────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters");
  }
  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different from old password");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) throw new ApiError(401, "Old password is incorrect");

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.isFirstLogin = false;
  await user.save();

  res.json({ success: true, message: "Password changed successfully" });
});

// ── Get Me ────────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-passwordHash")
    .populate("enrolledCourses", "title description thumbnail status")
    .populate("assignedCourses", "title description thumbnail status")
    .populate("partnerInstitute")
    .populate("awardingOrganisation");

  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, data: user });
});
