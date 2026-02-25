const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const shortlistController = require("../controllers/shortlistController");

router.post(
  "/",
  protect,
  authorize("company"),
  shortlistController.addToShortlist
);

router.get(
  "/",
  protect,
  authorize("company"),
  shortlistController.getShortlist
);

router.get(
  "/student",
  protect,
  authorize("student"),
  shortlistController.getStudentShortlists
);

module.exports = router;

