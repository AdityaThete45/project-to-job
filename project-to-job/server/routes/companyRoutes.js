const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const companyController = require("../controllers/companyController");

// Company searches students
router.get(
  "/search",
  protect,
  authorize("company"),
  companyController.searchStudents
);

// Company views student profile
router.get(
  "/student/:id",
  protect,
  authorize("company"),
  companyController.getStudentProfile
);

module.exports = router;
