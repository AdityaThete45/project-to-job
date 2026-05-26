const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const companyController = require("../controllers/companyController");

router.get("/search", protect, authorize("company"), companyController.searchStudents);
router.get("/stats", protect, authorize("company"), companyController.getCompanyStats);
router.get("/top-candidates", protect, authorize("company"), companyController.getTopCandidates);
router.get("/student/:id", protect, authorize("company"), companyController.getStudentProfile);
router.get("/student/:id/ai-summary", protect, authorize("company"), companyController.getStudentAISummary);

module.exports = router;