const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ===== REGISTER =====
exports.registerUser = async (req, res) => {
  try {
    const {
      name, email, password, role,
      college, branch, cgpa, graduationYear, skills, githubUsername,
      companyName, industry, companySize
    } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (!["student", "company"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (role === "student" && !githubUsername) {
      return res.status(400).json({ message: "GitHub username is required for students." });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      college: college || "",
      branch: branch || "",
      cgpa: cgpa ? Number(cgpa) : null,
      graduationYear: graduationYear ? Number(graduationYear) : null,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : []),
      githubUsername: githubUsername ? githubUsername.trim() : "",
      companyName: companyName || "",
      industry: industry || "",
      companySize: companySize || ""
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully."
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }
    res.status(500).json({ message: "Server error during registration." });
  }
};

// ===== LOGIN =====
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    res.json({
      token: generateToken(user._id),
      role: user.role,
      name: user.name,
      userId: user._id.toString()
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// ===== FORGOT PASSWORD =====
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // To prevent user enumeration, return success even if user not found
    if (!user) {
      return res.json({
        success: true,
        message: "If an account matches that email, password reset instructions have been sent."
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and save to database (expiring in 10 minutes)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    // Reset URL
    const CLIENT_URL = process.env.CLIENT_URL || "https://p2j-frontend.onrender.com";
    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send email
    const { sendPasswordResetEmail } = require("../services/emailService");
    await sendPasswordResetEmail(user, resetUrl);

    res.json({
      success: true,
      message: "If an account matches that email, password reset instructions have been sent."
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error during password reset request." });
  }
};

// ===== RESET PASSWORD =====
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Hash the token from request to match the stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Set new password (bcrypt hashing triggers in User.js Schema.pre('save'))
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful. You can now log in with your new password."
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
};