const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const interviewController = require("../controllers/interviewController");

router.post("/", protect, authorize("company"), interviewController.sendInterviewRequest);
router.get("/company", protect, authorize("company"), interviewController.getCompanyInterviews);
router.get("/my-requests", protect, authorize("student"), interviewController.getStudentRequests);
router.put("/:id", protect, authorize("student"), interviewController.updateInterviewStatus);
router.put("/:id/schedule", protect, authorize("company"), interviewController.scheduleInterview);

module.exports = router;