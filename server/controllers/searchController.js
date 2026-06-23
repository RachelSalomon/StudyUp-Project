/**
 * Advanced Search & Filter Controller
 * Implements complex multi-parameter filtering for Tasks and Courses
 */

const Task = require("../models/Task");
const Course = require("../models/Course");

// Advanced task search with 3+ parameters
const searchTasks = async (req, res) => {
  try {
    const {
      courseName,
      status,
      priority,
      dueDateRange,
      category,
      tags,
      assignedTo,
    } = req.query;

    let filter = { user: req.user.id, isDeleted: false };

    // Filter by course name
    if (courseName) {
      const courses = await Course.find({
        name: { $regex: courseName, $options: "i" },
      });
      const courseIds = courses.map((c) => c._id);
      filter.course = { $in: courseIds };
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    // Filter by due date range (e.g., "2024-01-01,2024-12-31")
    if (dueDateRange) {
      const [startDate, endDate] = dueDateRange.split(",");
      if (startDate && endDate) {
        filter.dueDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
    }

    // Filter by category
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // Filter by tags (multiple tags)
    if (tags) {
      const tagArray = tags.split(",");
      filter.tags = { $in: tagArray };
    }

    // Filter by assigned user
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

module.exports = {
  searchTasks,
  searchCourses,
  getTaskAnalytics,
};
