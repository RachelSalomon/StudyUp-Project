const Course = require("../models/Course");

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("getCourses error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to get courses",
        error: error.message,
      });
  }
};

const createCourse = async (req, res) => {
  try {
    const { name, professor, credits } = req.body;
    const newCourse = await Course.create({
      user: req.user.id,
      name,
      professor,
      credits,
    });

    res.status(201).json({ success: true, data: newCourse });
  } catch (error) {
    console.error("createCourse error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create course",
        error: error.message,
      });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (course.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Not authorized to delete this course",
        });
    }

    await course.deleteOne();
    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("deleteCourse error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete course",
        error: error.message,
      });
  }
};

module.exports = {
  getCourses,
  createCourse,
  deleteCourse,
};
