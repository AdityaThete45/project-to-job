const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const projectController = require("../controllers/projectController");
const upload = require("../middleware/uploadMiddleware");

// ================= STUDENT ROUTES =================

// Create project
router.post(
  "/",
  protect,
  authorize("student"),
  upload.single("video"),
  projectController.createProject
);

// Student views own projects
router.get(
  "/my-projects",
  protect,
  authorize("student"),
  projectController.getMyProjects
);

// ================= COMPANY ROUTES =================

// Company views a student's projects
router.get(
  "/student/:studentId",
  protect,
  authorize("company"),
  projectController.getStudentProjects
);

// 🔥 IMPORTANT: STATUS ROUTE FIRST
router.get(
  "/:projectId/status",
  protect,
  authorize("company"),
  projectController.getProjectActionStatus
);

// Then get single project
router.get(
  "/:id",
  protect,
  authorize("company"),
  projectController.getProjectById
);

module.exports = router;