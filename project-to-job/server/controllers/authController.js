const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
exports.registerUser = async (req, res) => {
  try {
    console.log("Incoming data:", req.body);

    const {
      name,
      email,
      password,
      role,
      college,
      branch,
      cgpa,
      graduationYear,
      skills,
      githubUsername,   
      companyName,
      industry,
      companySize
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,

      // Student fields
      college,
      branch,
      cgpa,
      graduationYear,
      skills,
      githubUsername,

      // Company fields
      companyName,
      industry,
      companySize
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt email:", email);

    const user = await User.findOne({ email });

    console.log("User found in DB:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials - user not found" });
    }

    const isMatch = await user.matchPassword(password);

    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials - password wrong" });
    }

    res.json({
      token: generateToken(user._id),
      role: user.role,
      name: user.name,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};