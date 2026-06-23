/**
 * Analytics Controller
 * Provides detailed aggregated statistics for dashboard visualization
 */

const Task = require("../models/Task");
const Course = require("../models/Course");
const User = require("../models/User");

// Get comprehensive task analytics with aggregations
const getTaskAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate tasks by course
    const tasksByCourse = await Task.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: "$course",
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
          },
          avgCompletion: { $avg: "$completionPercentage" },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseData",
        },
      },
      { $unwind: { path: "$courseData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          courseName: { $ifNull: ["$courseData.name", "No Course"] },
          totalTasks: "$count",
          completedTasks: "$completed",
          completionRate: {
            $cond: [
              { $eq: ["$count", 0] },
              0,
              {
                $multiply: [{ $divide: ["$completed", "$count"] }, 100],
              },
            ],
          },
          avgCompletion: { $round: ["$avgCompletion", 2] },
        },
      },
    ]);

    // Aggregate tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 1,
          priority: "$_id",
          totalTasks: "$count",
          completedTasks: "$completed",
          completionRate: {
            $cond: [
              { $eq: ["$count", 0] },
              0,
              {
                $multiply: [{ $divide: ["$completed", "$count"] }, 100],
              },
            ],
          },
        },
      },
    ]);

    // Aggregate tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: { user: userId, isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Overall task statistics
    const allTasks = await Task.find({ user: userId, isDeleted: false });
    const completedTasks = allTasks.filter((t) => t.isCompleted).length;
    const overallCompletion =
      allTasks.length > 0
        ? ((completedTasks / allTasks.length) * 100).toFixed(2)
        : 0;
    const avgProgress =
      allTasks.length > 0
        ? (
            allTasks.reduce((sum, t) => sum + t.completionPercentage, 0) /
            allTasks.length
          ).toFixed(2)
        : 0;

    // Upcoming tasks (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingTasks = await Task.find({
      user: userId,
      dueDate: { $gte: new Date(), $lte: nextWeek },
      isDeleted: false,
    }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTasks: allTasks.length,
          completedTasks,
          pendingTasks: allTasks.length - completedTasks,
          completionRate: parseFloat(overallCompletion),
          avgProgress: parseFloat(avgProgress),
        },
        tasksByCourse,
        tasksByPriority,
        tasksByStatus,
        upcomingTasks: upcomingTasks.slice(0, 5),
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

// Get course enrollment analytics
const getCourseAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const courseStats = await Course.aggregate([
      {
        $match: {
          $or: [{ creator: userId }, { manager: userId }, { members: userId }],
        },
      },
      {
        $project: {
          name: 1,
          professor: 1,
          credits: 1,
          memberCount: { $size: "$members" },
          pendingCount: { $size: "$pendingMembers" },
          status: 1,
          category: 1,
          isCreator: { $eq: ["$creator", userId] },
          isManager: { $eq: ["$manager", userId] },
        },
      },
    ]);

    // Task completion stats per course
    const courseTaskStats = await Task.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: "$course",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
          },
          avgProgress: { $avg: "$completionPercentage" },
        },
      },
      { $sort: { totalTasks: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        enrolledCourses: courseStats,
        courseTaskStats,
        totalEnrolled: courseStats.length,
      },
    });
  } catch (error) {
    console.error("getCourseAnalytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get course analytics",
      error: error.message,
    });
  }
};

// Get user progress over time (simulated data for trends)
const getProgressTrends = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = 30;
    const trends = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const tasksThatDay = await Task.countDocuments({
        user: userId,
        createdAt: { $gte: date, $lt: nextDate },
        isDeleted: false,
      });

      const completedThatDay = await Task.countDocuments({
        user: userId,
        completedAt: { $gte: date, $lt: nextDate },
        isDeleted: false,
      });

      trends.push({
        date: date.toISOString().split("T")[0],
        tasksCreated: tasksThatDay,
        tasksCompleted: completedThatDay,
      });
    }

    res.status(200).json({
      success: true,
      data: { trends },
    });
  } catch (error) {
    console.error("getProgressTrends error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get progress trends",
      error: error.message,
    });
  }
};

module.exports = {
  getTaskAnalytics,
  getCourseAnalytics,
  getProgressTrends,
};
