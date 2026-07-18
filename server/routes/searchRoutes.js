const express = require("express");
const {
  searchTasks,
  searchCourses,
  searchPosts,
  searchUsers,
  getTaskAnalytics,
} = require("../controllers/searchController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Search endpoints with multi-parameter filtering
router.get("/tasks", protect, searchTasks);
router.get("/courses", protect, searchCourses);
router.get("/posts", protect, searchPosts);
router.get("/users", protect, searchUsers);

// Analytics endpoint for dashboard
router.get("/tasks/analytics", protect, getTaskAnalytics);

module.exports = router;
