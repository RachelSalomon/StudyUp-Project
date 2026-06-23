const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.post("/:id/complete", protect, completeTask);

module.exports = router;
