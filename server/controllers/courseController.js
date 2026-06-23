const Course = require("../models/Course");
const User = require("../models/User");

// Get courses where user is creator, manager, or member
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      $or: [
        { creator: req.user.id },
        { manager: req.user.id },
        { members: req.user.id },
      ],
    })
      .populate("creator", "name email")
      .populate("manager", "name email")
      .populate("members", "name email");

    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("getCourses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get courses",
      error: error.message,
    });
  }
};

// Create a new course and associate with creator
const createCourse = async (req, res) => {
  try {
    const {
      name,
      professor,
      credits,
      description,
      courseCode,
      category,
      isPrivate,
    } = req.body;

    const newCourse = await Course.create({
      creator: req.user.id,
      manager: req.user.id,
      name,
      professor,
      credits,
      description,
      courseCode,
      category,
      isPrivate,
      members: [req.user.id],
    });

    // Add course to user's managed courses list
    await User.findByIdAndUpdate(req.user.id, {
      $push: { managedCourses: newCourse._id },
    });

    // Corrected populate syntax for single mongoose documents to prevent runtime crashing
    const populated = await Course.findById(newCourse._id)
      .populate("creator", "name email")
      .populate("manager", "name email");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("createCourse error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// Update existing course metadata
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (!course.isManager(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    const {
      name,
      description,
      professor,
      credits,
      courseCode,
      category,
      tags,
      status,
      isPrivate,
    } = req.body;

    if (name !== undefined) course.name = name;
    if (description !== undefined) course.description = description;
    if (professor !== undefined) course.professor = professor;
    if (credits !== undefined) course.credits = credits;
    if (courseCode !== undefined) course.courseCode = courseCode;
    if (category !== undefined) course.category = category;
    if (tags !== undefined) course.tags = tags;
    if (status !== undefined) course.status = status;
    if (isPrivate !== undefined) course.isPrivate = isPrivate;

    await course.save();

    const updated = await Course.findById(course._id)
      .populate("creator", "name email")
      .populate("manager", "name email");

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("updateCourse error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    });
  }
};

// Remove a course from the database
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (
      course.creator.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    await User.findByIdAndUpdate(course.manager, {
      $pull: { managedCourses: course._id },
    });

    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("deleteCourse error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
      error: error.message,
    });
  }
};

// Enroll a new student into the course
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (!course.isManager(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add members to this course",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await course.addMember(userId);

    const updated = await Course.findById(course._id)
      .populate("creator", "name email")
      .populate("manager", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      data: updated,
      message: "Member added successfully",
    });
  } catch (error) {
    console.error("addMember error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message,
    });
  }
};

// Remove a student from the course enrollment
const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (!course.isManager(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove members from this course",
      });
    }

    course.members = course.members.filter(
      (m) => m.toString() !== userId.toString(),
    );
    await course.save();

    const updated = await Course.findById(course._id)
      .populate("creator", "name email")
      .populate("manager", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      data: updated,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("removeMember error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addMember,
  removeMember,
};
