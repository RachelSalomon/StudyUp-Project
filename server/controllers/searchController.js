/**
 * Advanced Search & Filter Controller
 * Implements complex multi-parameter filtering for Tasks and Courses
 */

const Task = require("../models/Task");
const Course = require("../models/Course");
const Post = require("../models/Post");
const User = require("../models/User");
const Friendship = require("../models/Friendship");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Advanced task search with 3+ parameters
const searchTasks = async (req, res) => {
  try {
    const {
      title,
      courseName,
      status,
      priority,
      dueDateRange,
      category,
      tags,
      assignedTo,
    } = req.query;

    const userId = req.user._id;
    let filter = { user: userId, isDeleted: false };

    if (title && title.trim()) {
      filter.title = { $regex: escapeRegex(title.trim()), $options: "i" };
    }

    // Filter by course / group name
    if (courseName && courseName.trim()) {
      const courses = await Course.find({
        name: { $regex: escapeRegex(courseName.trim()), $options: "i" },
      });
      const courseIds = courses.map((c) => c._id);
      if (courseIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          count: 0,
          message: "No groups matched that name",
        });
      }
      filter.course = { $in: courseIds };
    }

    // Filter by status (include checkbox-completed tasks)
    if (status === "completed") {
      filter.$or = [{ status: "completed" }, { isCompleted: true }];
    } else if (status) {
      filter.status = status;
      filter.isCompleted = { $ne: true };
    }

    if (priority) {
      filter.priority = priority;
    }

    if (dueDateRange) {
      const [startDate, endDate] = dueDateRange.split(",");
      if (startDate && endDate) {
        filter.dueDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
    }

    if (category && category.trim()) {
      filter.category = { $regex: escapeRegex(category.trim()), $options: "i" };
    }

    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagArray.length) filter.tags = { $in: tagArray };
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
      .populate("course", "name")
      .populate("assignedTo", "name email")
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("searchTasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search tasks",
      error: error.message,
    });
  }
};

// Advanced course search with 3+ parameters
const searchCourses = async (req, res) => {
  try {
    const { name, professor, category, status, tags, minCredits, maxCredits } =
      req.query;

    let filter = {
      $or: [
        { creator: req.user.id },
        { manager: req.user.id },
        { members: req.user.id },
      ],
    };

    // Filter by course name
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // Filter by professor
    if (professor) {
      filter.professor = { $regex: professor, $options: "i" };
    }

    // Filter by category
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(",");
      filter.tags = { $in: tagArray };
    }

    // Filter by credit range
    if (minCredits || maxCredits) {
      filter.credits = {};
      if (minCredits) filter.credits.$gte = parseInt(minCredits);
      if (maxCredits) filter.credits.$lte = parseInt(maxCredits);
    }

    const courses = await Course.find(filter)
      .populate("creator", "name email")
      .populate("manager", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    console.error("searchCourses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search courses",
      error: error.message,
    });
  }
};

// Get analytics for tasks (completion rates, priority distribution, etc.)
const getTaskAnalytics = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id, isDeleted: false });

    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = tasks.filter((t) => !t.isCompleted).length;
    const byPriority = {
      high: tasks.filter((t) => t.priority === "high").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      low: tasks.filter((t) => t.priority === "low").length,
    };
    const byCourse = {};
    tasks.forEach((t) => {
      const courseName = t.course?.toString() || "No Course";
      byCourse[courseName] = (byCourse[courseName] || 0) + 1;
    });

    const completionRate =
      tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
    const averageCompletionPercentage =
      tasks.length > 0
        ? tasks.reduce((sum, t) => sum + t.completionPercentage, 0) /
          tasks.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalTasks: tasks.length,
        completed,
        pending,
        completionRate: completionRate.toFixed(2),
        byPriority,
        byCourse,
        averageCompletionPercentage: averageCompletionPercentage.toFixed(2),
      },
    });
  } catch (error) {
    console.error("getTaskAnalytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get task analytics",
      error: error.message,
    });
  }
};

// Advanced post search with 3+ parameters
const searchPosts = async (req, res) => {
  try {
    const { authorName, courseName, content, tags, dateRange } = req.query;
    const userId = req.user.id;

    const friendships = await Friendship.find({
      status: "accepted",
      $or: [{ requester: userId }, { recipient: userId }],
    });
    const friendIds = friendships.map((f) =>
      f.requester.toString() === userId.toString() ? f.recipient : f.requester,
    );

    const courses = await Course.find({
      $or: [{ creator: userId }, { manager: userId }, { members: userId }],
    }).select("_id name");
    const courseIds = courses.map((c) => c._id);

    let filter = {
      isDeleted: false,
      $or: [
        { author: userId },
        { author: { $in: friendIds }, course: null },
        { author: { $in: friendIds }, course: { $in: courseIds } },
        { course: { $in: courseIds } },
      ],
    };

    if (authorName) {
      const authors = await User.find({
        name: { $regex: authorName, $options: "i" },
      }).select("_id");
      filter.author = { $in: authors.map((a) => a._id) };
      delete filter.$or;
    }

    if (courseName) {
      const matched = await Course.find({
        name: { $regex: courseName, $options: "i" },
        _id: { $in: courseIds },
      }).select("_id");
      filter.course = { $in: matched.map((c) => c._id) };
    }

    if (content) {
      filter.content = { $regex: content, $options: "i" };
    }

    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(",");
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
    }

    const posts = await Post.find(filter)
      .populate("author", "name email")
      .populate("course", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts, count: posts.length });
  } catch (error) {
    console.error("searchPosts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search posts",
      error: error.message,
    });
  }
};

// Advanced user search with 3+ parameters
const searchUsers = async (req, res) => {
  try {
    const { name, email, role, bio, status, theme } = req.query;

    let filter = { status: status || "active" };

    if (name && name.trim()) {
      const term = escapeRegex(name.trim());
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ];
    }

    if (email && email.trim()) {
      filter.email = { $regex: escapeRegex(email.trim()), $options: "i" };
    }

    if (role) filter.role = role;
    if (bio && bio.trim()) filter.bio = { $regex: escapeRegex(bio.trim()), $options: "i" };
    if (theme) filter["preferences.theme"] = theme;

    const users = await User.find(filter)
      .select("name email role bio status preferences.theme createdAt")
      .sort({ name: 1 });

    const data = users.map((u) => {
      const isSelf = u._id.toString() === req.user._id.toString();
      return isSelf
        ? u
        : { _id: u._id, name: u.name, role: u.role, bio: u.bio, email: u.email };
    });

    res.status(200).json({ success: true, data, count: data.length });
  } catch (error) {
    console.error("searchUsers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message,
    });
  }
};

module.exports = {
  searchTasks,
  searchCourses,
  searchPosts,
  searchUsers,
  getTaskAnalytics,
};
