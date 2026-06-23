const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    // Creator/owner of the course
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Manager(s) of the course
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    professor: {
      type: String,
      trim: true,
      default: "",
    },
    credits: {
      type: Number,
      default: 0,
    },
    // Course code (e.g., "CS101")
    courseCode: {
      type: String,
      trim: true,
      default: "",
    },
    // Members (students enrolled in this course)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Pending member requests
    pendingMembers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Course status
    status: {
      type: String,
      enum: ["active", "archived", "draft"],
      default: "active",
    },
    // Course metadata
    category: {
      type: String,
      trim: true,
      default: "",
    },
    tags: [String],
    // Privacy level
    isPrivate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Method to check if a user is manager of this course
courseSchema.methods.isManager = function (userId) {
  return (
    this.manager?.toString() === userId.toString() ||
    this.creator?.toString() === userId.toString()
  );
};

// Method to check if a user is a member
courseSchema.methods.isMember = function (userId) {
  return this.members?.some(
    (member) => member.toString() === userId.toString(),
  );
};

// Method to add a member
courseSchema.methods.addMember = async function (userId) {
  if (!this.isMember(userId)) {
    this.members.push(userId);
    this.pendingMembers = this.pendingMembers.filter(
      (p) => p.userId.toString() !== userId.toString(),
    );
    await this.save();
  }
};

module.exports = mongoose.model("Course", courseSchema);
