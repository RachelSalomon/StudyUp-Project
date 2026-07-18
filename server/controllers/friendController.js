const Friendship = require("../models/Friendship");
const User = require("../models/User");

const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendships = await Friendship.find({
      status: "accepted",
      $or: [{ requester: userId }, { recipient: userId }],
    })
      .populate("requester", "name email bio")
      .populate("recipient", "name email bio");

    const friends = friendships.map((f) =>
      f.requester._id.toString() === userId.toString() ? f.recipient : f.requester,
    );

    res.status(200).json({ success: true, data: friends, count: friends.length });
  } catch (error) {
    console.error("getFriends error:", error);
    res.status(500).json({ success: false, message: "Failed to get friends", error: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const pending = await Friendship.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("requester", "name email");

    res.status(200).json({ success: true, data: pending, count: pending.length });
  } catch (error) {
    console.error("getPendingRequests error:", error);
    res.status(500).json({ success: false, message: "Failed to get requests", error: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot add yourself as a friend" });
    }

    const target = await User.findById(userId);
    if (!target || target.status === "inactive") {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id },
      ],
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Friend request already exists" });
    }

    const friendship = await Friendship.create({
      requester: req.user.id,
      recipient: userId,
      status: "pending",
    });

    res.status(201).json({ success: true, data: friendship, message: "Friend request sent" });
  } catch (error) {
    console.error("sendFriendRequest error:", error);
    res.status(500).json({ success: false, message: "Failed to send request", error: error.message });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.id);
    if (!friendship) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    if (friendship.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    friendship.status = "accepted";
    await friendship.save();
    res.status(200).json({ success: true, data: friendship, message: "Friend request accepted" });
  } catch (error) {
    console.error("acceptFriendRequest error:", error);
    res.status(500).json({ success: false, message: "Failed to accept request", error: error.message });
  }
};

const removeFriend = async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.id);
    if (!friendship) {
      return res.status(404).json({ success: false, message: "Friendship not found" });
    }

    const isParticipant =
      friendship.requester.toString() === req.user.id ||
      friendship.recipient.toString() === req.user.id;

    if (!isParticipant && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await friendship.deleteOne();
    res.status(200).json({ success: true, message: "Friend removed" });
  } catch (error) {
    console.error("removeFriend error:", error);
    res.status(500).json({ success: false, message: "Failed to remove friend", error: error.message });
  }
};

module.exports = {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
};
