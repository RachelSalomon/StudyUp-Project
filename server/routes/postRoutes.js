const express = require("express");
const {
  getFeed,
  getMyPosts,
  listPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/feed", protect, getFeed);
router.get("/mine", protect, getMyPosts);
router.get("/group/:courseId", protect, listPosts);
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
