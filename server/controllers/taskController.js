const Task = require("../models/Task");

// Get all active tasks for the logged-in user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id, isDeleted: false })
      .populate("course", "name")
      .populate("assignedTo", "name email");

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error("getTasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get tasks",
      error: error.message,
    });
  }
};

// Create a new task and associate it with a course
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      dueDate,
      priority,
      status,
      category,
      tags,
      assignedTo,
      estimatedHours,
    } = req.body;

    const newTask = await Task.create({
      user: req.user.id,
      title,
      description,
      course: course || null, // Ensure empty strings don't crash ObjectId casting
      dueDate,
      priority,
      status,
      category,
      tags,
      assignedTo: assignedTo || null,
      estimatedHours,
    });

    // Corrected single document populate structure to prevent Mongoose runtime errors
    const populated = await Task.findById(newTask._id)
      .populate("course", "name")
      .populate("assignedTo", "name email");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// Update task metadata and progress states
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const {
      title,
      description,
      course,
      dueDate,
      priority,
      status,
      category,
      tags,
      assignedTo,
      completionPercentage,
      estimatedHours,
      actualHours,
      isCompleted,
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (course !== undefined) task.course = course || null;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (category !== undefined) task.category = category;
    if (tags !== undefined) task.tags = tags;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (completionPercentage !== undefined)
      task.completionPercentage = completionPercentage;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (isCompleted !== undefined) {
      task.isCompleted = isCompleted;
      if (isCompleted) {
        task.status = "completed";
        task.completionPercentage = 100;
      }
    }

    await task.save();

    const updated = await Task.findById(task._id)
      .populate("course", "name")
      .populate("assignedTo", "name email");

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("updateTask error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// Soft delete a task by toggling the flag
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    task.isDeleted = true;
    await task.save();

    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("deleteTask error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

// Mark task as completed using internal document methods
const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    await task.markCompleted();

    const updated = await Task.findById(task._id)
      .populate("course", "name")
      .populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      data: updated,
      message: "Task marked as completed",
    });
  } catch (error) {
    console.error("completeTask error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete task",
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
};
