const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "manager", "admin"],
      default: "student",
    },
    // Permissions: fine-grained access control
    permissions: {
      type: [String],
      default: [],
      // student: []
      // manager: ["edit_course", "add_members", "search_advanced", "view_analytics"]
      // admin: all permissions
    },
    // Courses managed by this user (for manager role)
    managedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // Profile information
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    // Account status
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    // Approval status (for new manager registrations)
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Metadata
    joinedGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      emailUpdates: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Check if user has a specific permission
userSchema.methods.hasPermission = function (permission) {
  if (this.role === "admin") return true;
  return this.permissions.includes(permission);
};

// Check if user is manager or admin
userSchema.methods.isManagerOrAdmin = function () {
  return ["manager", "admin"].includes(this.role);
};

module.exports = mongoose.model("User", userSchema);
