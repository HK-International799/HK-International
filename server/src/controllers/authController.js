import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin-only: Register new user
export const registerUser = async (req, res) => {
  const { name, email, password, role, adminLoginId } = req.body;

  try {
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Admin registration validation
    if (role === "admin") {
      console.log("Admin registration (DEV MODE)");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: role || "student",
      adminLoginId: role === "admin" ? adminLoginId : undefined,
      isFirstLogin: role === "admin" ? false : true, // 🔥 IMPORTANT FIX
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      generatedPassword: password, // 🔥 IMPORTANT (send once)
    });
  } catch (err) {
    res.status(500).json({
      message: "Error registering user",
      errorMessage: err.message,
    });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password, adminLoginId } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    let user;

    console.log("Login Body:", req.body);

    // 🔥 Flexible login
    if (adminLoginId) {
      user = await User.findOne({
        $or: [
          { adminLoginId: adminLoginId },
          { email: adminLoginId }, // fallback
        ],
        role: "admin",
      });
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Change Password (first login or user-initiated)
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.isFirstLogin = false;

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error changing password",
      error: err.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-passwordHash")
      .populate("enrolledCourses");

    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching user",
      error: err.message,
    });
  }
};
