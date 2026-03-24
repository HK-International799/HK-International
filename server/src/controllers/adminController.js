import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Course from "../models/Course.js";
import emailService from "../services/emailService.js";

// Admin-only: Register new user (manual password)
export const registerUser = async (req, res) => {
  const { name, email, password, mobile, role, adminLoginId } = req.body;

  try {
    if (password && password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) { 
      return res.status(400).json({ msg: "Invalid mobile number" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      mobile: mobile,
      role: role || "student",
      adminLoginId: role === "admin" ? adminLoginId : undefined,
      isFirstLogin: role === "admin" ? false : true,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      // generatedPassword: password,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", errorMessage: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, mobile, role } = req.body;

    // ✅ VALIDATION
    if (!name || !email || !mobile || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (!["student", "tutor"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    // ✅ ONLY EMAIL CHECK (FIXED)
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists with this email",
      });
    }

    // 🔐 RANDOM PASSWORD
    const randomPassword = crypto.randomBytes(6).toString("hex");

    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const user = await User.create({
      name,
      email,
      mobile, // ✅ multiple users can have same mobile now
      passwordHash,
      role,
      isFirstLogin: true,
    });

    // 📧 EMAIL (optional)
    try {
      await emailService.sendWelcomeEmail(email, randomPassword);
    } catch (err) {
      console.warn("Email failed:", err.message);
    }

    res.status(201).json({
      msg: "User created successfully",
      user,
      credentials: {
        email,
        password: randomPassword,
      },
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error creating user",
      error: err.message,
    });
  }
};
// Login
export const loginUser = async (req, res) => {
  const { email, password, adminLoginId } = req.body;

  try {
    let user;
    if (adminLoginId) {
      user = await User.findOne({
        $or: [{ adminLoginId }, { email: adminLoginId }],
        role: "admin",
      });
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
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
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.isFirstLogin = false;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error changing password", error: err.message });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-passwordHash")
      .populate("enrolledCourses");
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
};

// Enroll student into course
export const enrollStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course)
      return res.status(404).json({ msg: "Student or course not found" });

    student.enrolledCourses.push(course._id);
    await student.save();

    res.status(200).json({ msg: "Student enrolled successfully", student });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error enrolling student", error: err.message });
  }
};

// Admin stats
export const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTutors = await User.countDocuments({ role: "tutor" });
    const totalCourses = await Course.countDocuments();

    res.json({ totalCourses, totalStudents, totalTutors });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// Recent activity
export const getRecentActivity = async (req, res) => {
  res.json([
    { user: "Anurag", action: "Enrolled in React Course", date: "2 mins ago" },
    { user: "Rahul", action: "Submitted Assignment", date: "10 mins ago" },
  ]);
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching users", error: err.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-passwordHash");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error updating user", error: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting user", error: err.message });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    ).select("-passwordHash");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error updating role", error: err.message });
  }
};
