const express = require("express");
const {
  getCourses,
  createCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCourses);
router.post("/", protect, createCourse);
router.delete("/:id", protect, deleteCourse);

module.exports = router;
