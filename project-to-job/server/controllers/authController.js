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