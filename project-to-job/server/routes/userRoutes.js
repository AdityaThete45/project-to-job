const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getStudentTrustMetrics, getMyProfile, updateProfile } = require("../controllers/userController");
const User = require("../models/User");

// My profile
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateProfile);

// Dashboard routes (legacy)
router.get("/student-dashboard", protect, authorize("student"), (req, res) => {
  res.json({ message: "Welcome Student Dashboard" });
});
router.get("/company-dashboard", protect, authorize("company"), (req, res) => {
  res.json({ message: "Welcome Company Dashboard" });
});

// Get all students (for company filtering)
router.get("/students", protect, authorize("company"), async (req, res) => {
  try {
    const { minCgpa, college, skill, search } = req.query;
    let filter = { role: "student" };

    if (minCgpa) filter.cgpa = { $gte: Number(minCgpa) };
    if (college) filter.college = { $regex: college, $options: "i" };
    if (skill) filter.skills = { $in: [new RegExp(skill, "i")] };
    if (search) filter.name = { $regex: search, $options: "i" };

    const students = await User.find(filter).select("-password").sort({ trustScore: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Trust metrics for a student
router.get("/:id/trust", protect, getStudentTrustMetrics);

module.exports = router;