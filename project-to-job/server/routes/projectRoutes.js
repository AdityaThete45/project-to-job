const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const projectController = require("../controllers/projectController");
const upload = require("../middleware/uploadMiddleware");

// Student: create project
router.post("/", protect, authorize("student"), upload.single("video"), projectController.createProject);

// Student: view own projects
router.get("/my-projects", protect, authorize("student"), projectController.getMyProjects);

// Student: delete own project
router.delete("/:id", protect, authorize("student"), projectController.deleteProject);

// Company: view a student's projects
router.get("/student/:studentId", protect, authorize("company"), projectController.getStudentProjects);

// IMPORTANT: status route before :id
router.get("/:projectId/status", protect, authorize("company"), projectController.getProjectActionStatus);

// Company: get single project detail
router.get("/:id", protect, authorize("company"), projectController.getProjectById);

module.exports = router;