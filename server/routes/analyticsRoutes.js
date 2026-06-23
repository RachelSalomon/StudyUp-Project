const express = require("express");
const {
  getTaskAnalytics,
  getCourseAnalytics,
  getProgressTrends,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/tasks", protect, getTaskAnalytics);
router.get("/courses", protect, getCourseAnalytics);
router.get("/trends", protect, getProgressTrends);

module.exports = router;
