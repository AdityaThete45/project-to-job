const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const aiController = require("../controllers/aiController");

// Secure all AI routes with JWT authentication
router.use(protect);

router.post("/resume", aiController.analyzeResume);
router.post("/project", aiController.auditProjectQuality);
router.post("/copilot", aiController.chatCopilot);
router.post("/interview", aiController.gradeInterview);
router.post("/roadmap", aiController.createRoadmap);

module.exports = router;
