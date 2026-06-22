const Task = require("../models/Task");

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
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

const createTask = async (req, res) => {
  try {
    const { title, description, course, dueDate, isCompleted } = req.body;

    const newTask = await Task.create({
      user: req.user.id,
      title,
      description,
      course,
      dueDate,
      isCompleted,
    });

    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const { title, description, course, dueDate, isCompleted } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (course !== undefined) task.course = course;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;

    const updated = await task.save();
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

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await task.deleteOne();
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

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
