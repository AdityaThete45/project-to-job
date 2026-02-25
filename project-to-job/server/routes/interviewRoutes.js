const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const interviewController = require("../controllers/interviewController");

// Company sends request
router.post(
  "/",
  protect,
  authorize("company"),
  interviewController.sendInterviewRequest
);

// Company views interviews
router.get(
  "/company",
  protect,
  authorize("company"),
  interviewController.getCompanyInterviews
);

// Student views requests
router.get(
  "/my-requests",
  protect,
  authorize("student"),
  interviewController.getStudentRequests
);

// Student accepts/rejects interview
router.put(
  "/:id",
  protect,
  authorize("student"),
  interviewController.updateInterviewStatus
);

module.exports = router;