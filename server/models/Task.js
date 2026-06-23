const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },
    // Priority level for filtering
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    // Task status
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "overdue"],
      default: "pending",
    },
    // Due date (for urgency filtering)
    dueDate: {
      type: Date,
    },
    // Task completion (legacy, kept for backward compatibility)
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // Category for filtering
    category: {
      type: String,
      trim: true,
      default: "",
    },
    // Tags for filtering
    tags: [String],
    // Assignment to specific student (if in group context)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Completion percentage
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Estimated hours to complete
    estimatedHours: {
      type: Number,
      default: 0,
    },
    // Actual hours spent
    actualHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Method to check urgency based on dueDate and priority
taskSchema.methods.getUrgency = function () {
  if (!this.dueDate) return "none";
  const now = new Date();
  const daysUntilDue = Math.ceil((this.dueDate - now) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue === 0) return "today";
  if (daysUntilDue <= 3) return "urgent";
  if (daysUntilDue <= 7) return "soon";
  return "later";
};

// Method to mark as completed
taskSchema.methods.markCompleted = async function () {
  this.isCompleted = true;
  this.status = "completed";
  this.completionPercentage = 100;
  await this.save();
};

module.exports = mongoose.model("Task", taskSchema);
