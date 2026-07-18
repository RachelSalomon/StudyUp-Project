/**
 * Seed demo data — WARNING: deletes all existing data!
 * To update users without losing data, run: npm run migrate-users
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Task = require("../models/Task");
const Post = require("../models/Post");
const Friendship = require("../models/Friendship");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studyup";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Task.deleteMany({}),
    Post.deleteMany({}),
    Friendship.deleteMany({}),
  ]);

  const users = await User.create([
    {
      name: "Shani Salomon",
      email: "shani_salomon@studyup.com",
      password: "123456",
      role: "admin",
      approvalStatus: "approved",
      permissions: ["edit_course", "add_members", "search_advanced", "view_analytics"],
      bio: "Admin",
    },
    {
      name: "Rachel Salomon",
      email: "rachel_salomon@studyup.com",
      password: "123456",
      role: "student",
      bio: "Computer Science student",
    },
    {
      name: "Rachel Biru",
      email: "rachel_biru@studyup.com",
      password: "123456",
      role: "student",
      bio: "Computer Science student",
    },
  ]);

  const [shani, rachel, rachelBiru] = users;

  const courses = await Course.create([
    {
      creator: shani._id,
      manager: shani._id,
      name: "Android 2.0",
      description: "Mobile development course study group",
      professor: "Dr. Cohen",
      credits: 3,
      category: "Mobile",
      isPrivate: false,
      members: [shani._id, rachel._id, rachelBiru._id],
    },
    {
      creator: shani._id,
      manager: shani._id,
      name: "Blockchain",
      description: "Blockchain project group",
      professor: "Dr. Levi",
      credits: 4,
      category: "Blockchain",
      isPrivate: true,
      members: [shani._id, rachel._id],
    },
    {
      creator: rachelBiru._id,
      manager: rachelBiru._id,
      name: "Computer Networks",
      description: "Networks and Socket.io study group",
      professor: "Dr. Weiss",
      credits: 3,
      category: "Networks",
      isPrivate: false,
      members: [rachelBiru._id, shani._id],
    },
  ]);

  const [android, blockchain, networks] = courses;

  await User.findByIdAndUpdate(shani._id, {
    managedCourses: [android._id, blockchain._id],
    joinedGroups: [android._id, blockchain._id],
  });
  await User.findByIdAndUpdate(rachel._id, {
    joinedGroups: [android._id, blockchain._id],
  });
  await User.findByIdAndUpdate(rachelBiru._id, {
    managedCourses: [networks._id],
    joinedGroups: [android._id, networks._id],
  });

  await Friendship.create([
    { requester: shani._id, recipient: rachel._id, status: "accepted" },
    { requester: rachelBiru._id, recipient: shani._id, status: "accepted" },
  ]);

  await Task.create([
    {
      user: shani._id,
      title: "Finish final project",
      course: android._id,
      priority: "high",
      status: "in-progress",
      category: "Project",
    },
    {
      user: rachelBiru._id,
      title: "Review jQuery chapter",
      course: android._id,
      priority: "medium",
      status: "pending",
      category: "Reading",
    },
    {
      user: shani._id,
      title: "Study TCP/IP layers",
      course: networks._id,
      priority: "high",
      status: "pending",
      category: "Exam Prep",
    },
  ]);

  await Post.create([
    {
      author: shani._id,
      content: "Welcome to StudyUp! Share study updates with your groups and friends.",
      course: android._id,
    },
    {
      author: rachelBiru._id,
      content: "Anyone want to review MVC before the exam?",
      course: android._id,
    },
  ]);

  console.log("\nSeed completed! (password: 123456 for all)");
  console.log("  shani_salomon@studyup.com   (admin)");
  console.log("  rachel_salomon@studyup.com  (student)");
  console.log("  rachel_biru@studyup.com     (student)\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
