const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const newUser = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to login user",
      error: error.message,
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id || req.user._id)
      .select("-password")
      .populate("managedCourses")
      .populate("joinedGroups");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("getUserProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

// Update user profile
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;

    // Only allow users to update their own profile, unless admin
    if (userId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Allowed fields to update
    const { name, bio, avatar, theme, notifications, emailUpdates } = req.body;

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (theme !== undefined) user.preferences.theme = theme;
    if (notifications !== undefined)
      user.preferences.notifications = notifications;
    if (emailUpdates !== undefined)
      user.preferences.emailUpdates = emailUpdates;

    const updated = await user.save();

    res.status(200).json({
      success: true,
      data: updated,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Only allow users to delete their own account, unless admin
    if (userId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this user",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Set status to inactive instead of hard delete
    user.status = "inactive";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User account deactivated successfully",
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  deleteUser,
};
