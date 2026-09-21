// // import User from "../models/User.js";
// // import bcrypt from "bcryptjs";
// // import jwt from "jsonwebtoken";
// // import asyncHandler from "../utils/asyncHandler.js";
// // import ApiError from "../utils/ApiError.js";

// // // ── Register ───────────────────────────────────────────────────────────────
// // export const registerUser = asyncHandler(async (req, res) => {
// //   const { name, email, password, mobile, role, adminSecretId } = req.body;

// //   if (!name || !email || !password || !mobile) {
// //     throw new ApiError(400, "Name, email, password and mobile are required");
// //   }

// //   if (password.length < 8) {
// //     throw new ApiError(400, "Password must be at least 8 characters");
// //   }

// //   if (role && !["student", "tutor", "admin", "finance", "sales_agent"].includes(role)) {
// //     throw new ApiError(400, "Invalid role");
// //   }

// //   if (role === "admin") {
// //     if (!adminSecretId || adminSecretId !== process.env.ADMIN_SECRET_ID) {
// //       throw new ApiError(403, "Invalid Admin Secret ID");
// //     }
// //   }

// //   const userExists = await User.findOne({ email: email.toLowerCase() });
// //   if (userExists) {
// //     throw new ApiError(409, "User with this email already exists");
// //   }

// //   const hashedPassword = await bcrypt.hash(password, 10);

// //   const user = await User.create({
// //     name: name.trim(),
// //     email: email.toLowerCase(),
// //     passwordHash: hashedPassword,
// //     mobile,
// //     role: role || "student",
// //     isFirstLogin: role === "admin" ? false : true,
// //   });

// //   res.status(201).json({
// //     success: true,
// //     message: "User registered successfully",
// //     data: {
// //       id: user._id,
// //       name: user.name,
// //       email: user.email,
// //       mobile: user.mobile,
// //       role: user.role,
// //     },
// //   });
// // });

// // // ── Login ──────────────────────────────────────────────────────────────────
// // export const loginUser = asyncHandler(async (req, res) => {
// //   const { email, password, adminLoginId } = req.body;

// //   if (!password) throw new ApiError(400, "Password is required");

// //   let user = null;

// //   if (adminLoginId) {
// //     user = await User.findOne({
// //       $or: [{ email: adminLoginId.toLowerCase() }],
// //       role: { $in: ["admin", "super_admin"] },
// //     });
// //   } else if (email) {
// //     user = await User.findOne({ email: email.toLowerCase() });
// //   } else {
// //     throw new ApiError(400, "Email or adminLoginId is required");
// //   }

// //   if (!user) throw new ApiError(401, "Invalid credentials");

// //   const isValid = await bcrypt.compare(password, user.passwordHash);
// //   if (!isValid) throw new ApiError(401, "Invalid credentials");

// //   const token = jwt.sign(
// //     { id: user._id, role: user.role, email: user.email },
// //     process.env.JWT_SECRET,
// //     { expiresIn: "7d" },
// //   );

// //   res.json({
// //     success: true,
// //     message: "Login successful",
// //     data: {
// //       token,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         role: user.role,
// //         isFirstLogin: user.isFirstLogin,
// //         avatar: user.avatar,
// //       },
// //     },
// //   });
// // });

// // // ── Change Password ───────────────────────────────────────────────────────
// // export const changePassword = asyncHandler(async (req, res) => {
// //   const { oldPassword, newPassword } = req.body;

// //   if (!oldPassword || !newPassword) {
// //     throw new ApiError(400, "Old password and new password are required");
// //   }
// //   if (newPassword.length < 8) {
// //     throw new ApiError(400, "New password must be at least 8 characters");
// //   }
// //   if (oldPassword === newPassword) {
// //     throw new ApiError(400, "New password must be different from old password");
// //   }

// //   const user = await User.findById(req.user._id);
// //   if (!user) throw new ApiError(404, "User not found");

// //   const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
// //   if (!isMatch) throw new ApiError(401, "Old password is incorrect");

// //   user.passwordHash = await bcrypt.hash(newPassword, 10);
// //   user.isFirstLogin = false;
// //   await user.save();

// //   res.json({ success: true, message: "Password changed successfully" });
// // });

// // // ── Get Me ────────────────────────────────────────────────────────────────
// // export const getMe = asyncHandler(async (req, res) => {
// //   const user = await User.findById(req.user._id)
// //     .select("-passwordHash")
// //     .populate("enrolledCourses", "title description thumbnail status")
// //     .populate("assignedCourses", "title description thumbnail status")
// //     .populate("partnerInstitute")
// //     .populate("awardingOrganisation");

// //   if (!user) throw new ApiError(404, "User not found");

// //   res.json({ success: true, data: user });
// // });








// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import asyncHandler from "../utils/asyncHandler.js";
// import ApiError from "../utils/ApiError.js";

// // ── Register ───────────────────────────────────────────────────────────────
// export const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password, mobile, role, adminSecretId } = req.body;

//   if (!name || !email || !password || !mobile) {
//     throw new ApiError(400, "Name, email, password and mobile are required");
//   }

//   if (password.length < 8) {
//     throw new ApiError(400, "Password must be at least 8 characters");
//   }

//   if (role && !["student", "tutor", "admin", "finance", "sales_agent"].includes(role)) {
//     throw new ApiError(400, "Invalid role");
//   }

//   if (role === "admin") {
//     if (!adminSecretId || adminSecretId !== process.env.ADMIN_SECRET_ID) {
//       throw new ApiError(403, "Invalid Admin Secret ID");
//     }
//   }

//   const userExists = await User.findOne({ email: email.toLowerCase() });
//   if (userExists) {
//     throw new ApiError(409, "User with this email already exists");
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const user = await User.create({
//     name: name.trim(),
//     email: email.toLowerCase(),
//     passwordHash: hashedPassword,
//     mobile,
//     role: role || "student",
//     isFirstLogin: role === "admin" ? false : true,
//   });

//   res.status(201).json({
//     success: true,
//     message: "User registered successfully",
//     data: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       mobile: user.mobile,
//       role: user.role,
//     },
//   });
// });

// // ── Login ──────────────────────────────────────────────────────────────────
// export const loginUser = asyncHandler(async (req, res) => {
//   const { email, password, adminLoginId } = req.body;

//   if (!password) throw new ApiError(400, "Password is required");

//   let user = null;

//   if (adminLoginId) {
//     user = await User.findOne({
//       $or: [{ email: adminLoginId.toLowerCase() }],
//       role: { $in: ["admin", "super_admin"] },
//     });
//   } else if (email) {
//     user = await User.findOne({ email: email.toLowerCase() });
//   } else {
//     throw new ApiError(400, "Email or adminLoginId is required");
//   }

//   if (!user) throw new ApiError(401, "Invalid credentials");

//   const isValid = await bcrypt.compare(password, user.passwordHash);
//   if (!isValid) throw new ApiError(401, "Invalid credentials");

//   const token = jwt.sign(
//     { id: user._id, role: user.role, email: user.email },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" },
//   );

//   // Additive: track last login for the Learner 360° profile. Fire-and-forget
//   // so it can never affect or delay the existing login response.
//   User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }).catch(() => {});

//   res.json({
//     success: true,
//     message: "Login successful",
//     data: {
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isFirstLogin: user.isFirstLogin,
//         avatar: user.avatar,
//       },
//     },
//   });
// });

// // ── Change Password ───────────────────────────────────────────────────────
// export const changePassword = asyncHandler(async (req, res) => {
//   const { oldPassword, newPassword } = req.body;

//   if (!oldPassword || !newPassword) {
//     throw new ApiError(400, "Old password and new password are required");
//   }
//   if (newPassword.length < 8) {
//     throw new ApiError(400, "New password must be at least 8 characters");
//   }
//   if (oldPassword === newPassword) {
//     throw new ApiError(400, "New password must be different from old password");
//   }

//   const user = await User.findById(req.user._id);
//   if (!user) throw new ApiError(404, "User not found");

//   const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
//   if (!isMatch) throw new ApiError(401, "Old password is incorrect");

//   user.passwordHash = await bcrypt.hash(newPassword, 10);
//   user.isFirstLogin = false;
//   await user.save();

//   res.json({ success: true, message: "Password changed successfully" });
// });

// // ── Get Me ────────────────────────────────────────────────────────────────
// export const getMe = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id)
//     .select("-passwordHash")
//     .populate("enrolledCourses", "title description thumbnail status")
//     .populate("assignedCourses", "title description thumbnail status")
//     .populate("partnerInstitute")
//     .populate("awardingOrganisation");

//   if (!user) throw new ApiError(404, "User not found");

//   res.json({ success: true, data: user });
// });




// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import asyncHandler from "../utils/asyncHandler.js";
// import ApiError from "../utils/ApiError.js";

// // ── Register ───────────────────────────────────────────────────────────────
// export const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password, mobile, role, adminSecretId } = req.body;

//   if (!name || !email || !password || !mobile) {
//     throw new ApiError(400, "Name, email, password and mobile are required");
//   }

//   if (password.length < 8) {
//     throw new ApiError(400, "Password must be at least 8 characters");
//   }

//   if (role && !["student", "tutor", "admin", "finance", "sales_agent"].includes(role)) {
//     throw new ApiError(400, "Invalid role");
//   }

//   if (role === "admin") {
//     if (!adminSecretId || adminSecretId !== process.env.ADMIN_SECRET_ID) {
//       throw new ApiError(403, "Invalid Admin Secret ID");
//     }
//   }

//   const userExists = await User.findOne({ email: email.toLowerCase() });
//   if (userExists) {
//     throw new ApiError(409, "User with this email already exists");
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const user = await User.create({
//     name: name.trim(),
//     email: email.toLowerCase(),
//     passwordHash: hashedPassword,
//     mobile,
//     role: role || "student",
//     isFirstLogin: role === "admin" ? false : true,
//   });

//   res.status(201).json({
//     success: true,
//     message: "User registered successfully",
//     data: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       mobile: user.mobile,
//       role: user.role,
//     },
//   });
// });

// // ── Login ──────────────────────────────────────────────────────────────────
// export const loginUser = asyncHandler(async (req, res) => {
//   const { email, password, adminLoginId } = req.body;

//   if (!password) throw new ApiError(400, "Password is required");

//   let user = null;

//   if (adminLoginId) {
//     user = await User.findOne({
//       $or: [{ email: adminLoginId.toLowerCase() }],
//       role: { $in: ["admin", "super_admin"] },
//     });
//   } else if (email) {
//     user = await User.findOne({ email: email.toLowerCase() });
//   } else {
//     throw new ApiError(400, "Email or adminLoginId is required");
//   }

//   if (!user) throw new ApiError(401, "Invalid credentials");

//   const isValid = await bcrypt.compare(password, user.passwordHash);
//   if (!isValid) throw new ApiError(401, "Invalid credentials");

//   const token = jwt.sign(
//     { id: user._id, role: user.role, email: user.email },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" },
//   );

//   res.json({
//     success: true,
//     message: "Login successful",
//     data: {
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isFirstLogin: user.isFirstLogin,
//         avatar: user.avatar,
//       },
//     },
//   });
// });

// // ── Change Password ───────────────────────────────────────────────────────
// export const changePassword = asyncHandler(async (req, res) => {
//   const { oldPassword, newPassword } = req.body;

//   if (!oldPassword || !newPassword) {
//     throw new ApiError(400, "Old password and new password are required");
//   }
//   if (newPassword.length < 8) {
//     throw new ApiError(400, "New password must be at least 8 characters");
//   }
//   if (oldPassword === newPassword) {
//     throw new ApiError(400, "New password must be different from old password");
//   }

//   const user = await User.findById(req.user._id);
//   if (!user) throw new ApiError(404, "User not found");

//   const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
//   if (!isMatch) throw new ApiError(401, "Old password is incorrect");

//   user.passwordHash = await bcrypt.hash(newPassword, 10);
//   user.isFirstLogin = false;
//   await user.save();

//   res.json({ success: true, message: "Password changed successfully" });
// });

// // ── Get Me ────────────────────────────────────────────────────────────────
// export const getMe = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id)
//     .select("-passwordHash")
//     .populate("enrolledCourses", "title description thumbnail status")
//     .populate("assignedCourses", "title description thumbnail status")
//     .populate("partnerInstitute")
//     .populate("awardingOrganisation");

//   if (!user) throw new ApiError(404, "User not found");

//   res.json({ success: true, data: user });
// });








import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import emailService from "../services/emailService.js";
import {
  FORGOT_PASSWORD_MESSAGE,
  INVALID_TOKEN_MESSAGE,
  RESET_REQUEST_COOLDOWN_MS,
  RESET_TOKEN_TTL_MINUTES,
  RESET_TOKEN_TTL_MS,
  buildResetUrl,
  enforceMinDuration,
  generateResetToken,
  hashResetToken,
  isValidTokenFormat,
  validatePasswordStrength,
} from "../utils/passwordReset.js";

// ── Register ───────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, role, adminSecretId } = req.body;

  if (!name || !email || !password || !mobile) {
    throw new ApiError(400, "Name, email, password and mobile are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  if (role && !["student", "tutor", "admin", "finance", "sales_agent"].includes(role)) {
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
    { expiresIn: "7d" },
  );

  // Additive: track last login for the Learner 360° profile. Fire-and-forget
  // so it can never affect or delay the existing login response.
  User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }).catch(() => {});

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

// ── Forgot Password ───────────────────────────────────────────────────────
// POST /api/auth/forgot-password   { email }
//
// ALWAYS answers with the same generic 200 — whether the account exists,
// whether the email could be sent, or whether the request was throttled —
// so the endpoint can never be used to discover registered emails.
export const forgotPassword = asyncHandler(async (req, res) => {
  const startedAt = Date.now();

  // Only accept a plain string (blocks NoSQL operator injection such as
  // {"email": {"$ne": null}}); the route's validate() already checked format.
  const email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

  const user = email
    ? await User.findOne({ email }).select("+passwordResetExpires")
    : null;

  if (user) {
    // Everything below is user-specific, so failures are logged and
    // swallowed: surfacing an error here would reveal that the account exists.
    try {
      // Per-account cooldown: if a link was issued in the last minute, don't
      // send another (stops someone flooding a victim's inbox).
      const lastIssuedAt = user.passwordResetExpires
        ? user.passwordResetExpires.getTime() - RESET_TOKEN_TTL_MS
        : 0;
      const inCooldown = Date.now() - lastIssuedAt < RESET_REQUEST_COOLDOWN_MS;

      if (!inCooldown) {
        const { token, hashedToken, expiresAt } = generateResetToken();
        const resetLink = buildResetUrl(token); // throws if base URL is missing/insecure

        // Overwrites any earlier token → the previous link stops working.
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              passwordResetToken: hashedToken,
              passwordResetExpires: expiresAt,
            },
          },
        );

        try {
          await emailService.sendPasswordResetEmail(
            user.email,
            user.displayName || user.name,
            resetLink,
            RESET_TOKEN_TTL_MINUTES,
          );
        } catch (mailErr) {
          console.error(
            `[forgotPassword] Failed to send reset email: ${mailErr.message}`,
          );
          // Nothing was delivered, so don't leave a live token behind.
          await User.updateOne(
            { _id: user._id },
            { $unset: { passwordResetToken: "", passwordResetExpires: "" } },
          ).catch(() => {});
        }
      }
    } catch (err) {
      console.error(`[forgotPassword] ${err.message}`);
    }
  }

  // Keep response time similar for existing / non-existing accounts.
  await enforceMinDuration(startedAt);

  res.json({ success: true, message: FORGOT_PASSWORD_MESSAGE });
});

// Finds the user whose stored token hash matches AND has not expired.
const findUserByResetToken = async (token, projection = "_id") => {
  if (!isValidTokenFormat(token)) return null;

  return User.findOne({
    passwordResetToken: hashResetToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select(projection);
};

// ── Validate Reset Token ──────────────────────────────────────────────────
// POST /api/auth/validate-reset-token   { token }
// Lets the reset page show "link expired" up-front instead of after the
// user has typed a new password. Does NOT consume the token.
// (POST + body keeps the token out of URLs and server access logs.)
export const validateResetToken = asyncHandler(async (req, res) => {
  const user = await findUserByResetToken(req.body.token);
  if (!user) throw new ApiError(400, INVALID_TOKEN_MESSAGE);

  res.json({ success: true, message: "Reset link is valid" });
});

// ── Reset Password ────────────────────────────────────────────────────────
// POST /api/auth/reset-password   { token, password, confirmPassword }
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const strengthError = validatePasswordStrength(password);
  if (strengthError) throw new ApiError(400, strengthError);

  // Cheap check first, so bcrypt work is never spent on bad tokens.
  const user = await findUserByResetToken(token);
  if (!user) throw new ApiError(400, INVALID_TOKEN_MESSAGE);

  // Same hashing method + cost as registerUser / changePassword.
  const passwordHash = await bcrypt.hash(password, 10);

  // Atomic consume: the filter re-checks hash + expiry and the same update
  // clears the token, so two simultaneous requests with one link can't both win.
  const updated = await User.findOneAndUpdate(
    {
      _id: user._id,
      passwordResetToken: hashResetToken(token),
      passwordResetExpires: { $gt: new Date() },
    },
    {
      $set: { passwordHash, isFirstLogin: false },
      $unset: { passwordResetToken: "", passwordResetExpires: "" },
    },
    { new: true, projection: { _id: 1 } },
  );

  if (!updated) throw new ApiError(400, INVALID_TOKEN_MESSAGE);

  console.info(`[resetPassword] Password reset completed for user ${user._id}`);

  res.json({
    success: true,
    message:
      "Password has been reset successfully. You can now log in with your new password.",
  });
});
