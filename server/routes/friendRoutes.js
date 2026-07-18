const express = require("express");
const {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
} = require("../controllers/friendController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getFriends);
router.get("/pending", protect, getPendingRequests);
router.post("/request", protect, sendFriendRequest);
router.put("/:id/accept", protect, acceptFriendRequest);
router.delete("/:id", protect, removeFriend);

module.exports = router;
