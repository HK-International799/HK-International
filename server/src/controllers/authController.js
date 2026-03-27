import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Register new user (Admin only)
 * POST /api/auth/register
 * Body: { name, email, password, role, adminLoginId }
 */
export const registerUser = async (req, res) => {
  const { name, email, password, mobile, role, adminLoginId } = req.body;

  try {
    // Validate password length
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    if (role === "admin") {
  if (adminSecretId !== process.env.ADMIN_SECRET_ID) {
    return res.status(403).json({
      message: "Invalid Admin Secret ID",
    });
  }
}

    // Validate role
    if (role && !["student", "tutor", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be student, tutor, or admin",
      });
    }

    // Validate name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    // Validate email
    if (!email || !email.includes("@")) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    // Check if user already exists (case-insensitive)
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      mobile: mobile,
      role: role || "student",
      adminLoginId: role === "admin" ? adminLoginId : undefined,
      isFirstLogin: role === "admin" ? false : true,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      message: "Error registering user",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password } or { adminLoginId, password }
 */
export const loginUser = async (req, res) => {
  const { email, password, adminLoginId } = req.body;

  try {
    // Validate password
    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    let user = null;

    // Find user by adminLoginId (for admin) or email
    if (adminLoginId) {
      user = await User.findOne({
        $or: [
          { adminLoginId: adminLoginId },
          { email: adminLoginId.toLowerCase() },
        ],
        role: "admin",
      });
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      return res.status(400).json({
        message: "Email or adminLoginId is required",
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Error logging in",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Change password (after first login)
 * POST /api/auth/change-password
 * Headers: { Authorization: Bearer token }
 * Body: { oldPassword, newPassword }
 */
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Verify user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // Validate inputs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Old password is incorrect",
      });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.isFirstLogin = false;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      message: "Error changing password",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Get current logged-in user profile
 * GET /api/auth/me
 * Headers: { Authorization: Bearer token }
 */
export const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user.id)
      .select("-passwordHash")
      .populate({
        path: "enrolledCourses",
        select: "title description thumbnail status",
      })
      .populate({
        path: "assignedCourses",
        select: "title description thumbnail status",
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({
      message: "Error fetching user profile",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
