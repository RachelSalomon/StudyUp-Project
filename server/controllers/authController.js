const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const MANAGER_PERMISSIONS = [
  "edit_course",
  "add_members",
  "search_advanced",
  "view_analytics",
];

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const userRole = ["student", "manager"].includes(role) ? role : "student";
    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: userRole,
      approvalStatus: userRole === "manager" ? "pending" : "approved",
    };

    if (userRole === "manager") {
      userData.permissions = MANAGER_PERMISSIONS;
    }

    const newUser = await User.create(userData);

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
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.status === "inactive" || !(await user.matchPassword(password))) {
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

const listUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "active" })
      .select("name email role bio createdAt")
      .sort({ name: 1 });

    const data = users.map((u) => {
      const isSelf = u._id.toString() === req.user.id;
      return isSelf
        ? u
        : { _id: u._id, name: u.name, role: u.role, bio: u.bio };
    });

    res.status(200).json({ success: true, data, count: data.length });
  } catch (error) {
    console.error("listUsers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list users",
      error: error.message,
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const targetId = req.params.id || req.user._id;
    const isSelf = targetId.toString() === req.user._id.toString();

    const user = await User.findById(targetId)
      .select("-password")
      .populate("managedCourses")
      .populate("joinedGroups");

    if (!user || user.status === "inactive") {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!isSelf && req.user.role !== "admin") {
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          bio: user.bio,
          role: user.role,
        },
      });
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
  listUsers,
  getUserProfile,
  updateUser,
  deleteUser,
};
