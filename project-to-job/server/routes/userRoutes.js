const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const User = require("../models/User");

// 🔥 Import trust controller
const { getStudentTrustMetrics } = require("../controllers/userController");


// ================= DASHBOARD ROUTES =================

// Student-only route
router.get("/student-dashboard", protect, authorize("student"), (req, res) => {
  res.json({ message: "Welcome Student Dashboard" });
});

// Company-only route
router.get("/company-dashboard", protect, authorize("company"), (req, res) => {
  res.json({ message: "Welcome Company Dashboard" });
});


// ================= STUDENT FILTER ROUTE =================

// Get all students (for company filtering)
router.get("/students", protect, authorize("company"), async (req, res) => {
  try {
    const { minCgpa, college, skill } = req.query;

    let filter = { role: "student" };

    if (minCgpa) {
      filter.cgpa = { $gte: Number(minCgpa) };
    }

    if (college) {
      filter.college = college;
    }

    if (skill) {
      filter.skills = { $in: [skill] };
    }

    const students = await User.find(filter).select("-password");

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ================= TRUST METRICS ROUTE =================

// 🔥 NEW ROUTE
router.get("/:id/trust", protect, getStudentTrustMetrics);


module.exports = router;