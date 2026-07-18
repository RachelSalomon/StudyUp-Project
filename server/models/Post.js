const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    tags: [String],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
