const express = require("express");
const {
  getCourses,
  browseCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addMember,
  removeMember,
  requestJoin,
  approveMember,
  rejectMember,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCourses);
router.get("/browse", protect, browseCourses);
router.post("/", protect, createCourse);
router.put("/:id", protect, updateCourse);
router.delete("/:id", protect, deleteCourse);
router.post("/:id/join", protect, requestJoin);
router.post("/:id/approve", protect, approveMember);
router.post("/:id/reject", protect, rejectMember);
router.post("/:id/members", protect, addMember);
router.delete("/:id/members", protect, removeMember);

module.exports = router;
