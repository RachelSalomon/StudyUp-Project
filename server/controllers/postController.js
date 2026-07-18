const Post = require("../models/Post");
const Course = require("../models/Course");
const Friendship = require("../models/Friendship");

async function getAccessibleCourseIds(userId) {
  const courses = await Course.find({
    $or: [{ creator: userId }, { manager: userId }, { members: userId }],
  }).select("_id");
  return courses.map((c) => c._id);
}

async function getFriendIds(userId) {
  const friendships = await Friendship.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  });
  return friendships.map((f) =>
    f.requester.toString() === userId.toString() ? f.recipient : f.requester,
  );
}

const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const [courseIds, friendIds] = await Promise.all([
      getAccessibleCourseIds(userId),
      getFriendIds(userId),
    ]);

    const posts = await Post.find({
      isDeleted: false,
      $or: [
        { author: userId },
        { author: { $in: friendIds }, course: null },
        { author: { $in: friendIds }, course: { $in: courseIds } },
        { course: { $in: courseIds } },
      ],
    })
      .populate("author", "name email")
      .populate("course", "name isPrivate")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: posts, count: posts.length });
  } catch (error) {
    console.error("getFeed error:", error);
    res.status(500).json({ success: false, message: "Failed to load feed", error: error.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id, isDeleted: false })
      .populate("author", "name email")
      .populate("course", "name isPrivate")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts, count: posts.length });
  } catch (error) {
    console.error("getMyPosts error:", error);
    res.status(500).json({ success: false, message: "Failed to load posts", error: error.message });
  }
};

const listPosts = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (
      course.isPrivate &&
      !course.isMember(req.user.id) &&
      !course.isManager(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied to private group posts" });
    }

    const posts = await Post.find({ course: course._id, isDeleted: false })
      .populate("author", "name email")
      .populate("course", "name isPrivate")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts, count: posts.length });
  } catch (error) {
    console.error("listPosts error:", error);
    res.status(500).json({ success: false, message: "Failed to list posts", error: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { content, course, tags } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Post content is required" });
    }

    if (course) {
      const courseDoc = await Course.findById(course);
      if (!courseDoc) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }
      if (
        courseDoc.isPrivate &&
        !courseDoc.isMember(req.user.id) &&
        !courseDoc.isManager(req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Cannot post in a private group you are not a member of",
        });
      }
    }

    const post = await Post.create({
      author: req.user.id,
      content: content.trim(),
      course: course || null,
      tags: tags || [],
    });

    const populated = await Post.findById(post._id)
      .populate("author", "name email")
      .populate("course", "name isPrivate");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("createPost error:", error);
    res.status(500).json({ success: false, message: "Failed to create post", error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You can only edit your own posts" });
    }

    const { content, tags } = req.body;
    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({ success: false, message: "Post content cannot be empty" });
      }
      post.content = content.trim();
    }
    if (tags !== undefined) post.tags = tags;

    await post.save();

    const populated = await Post.findById(post._id)
      .populate("author", "name email")
      .populate("course", "name isPrivate");

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    console.error("updatePost error:", error);
    res.status(500).json({ success: false, message: "Failed to update post", error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You can only delete your own posts" });
    }

    post.isDeleted = true;
    await post.save();
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("deletePost error:", error);
    res.status(500).json({ success: false, message: "Failed to delete post", error: error.message });
  }
};

module.exports = {
  getFeed,
  getMyPosts,
  listPosts,
  createPost,
  updatePost,
  deletePost,
};
