/**
 * Update demo users WITHOUT deleting tasks, groups, or posts.
 * Run once: node scripts/migrate-users.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Task = require("../models/Task");
const Post = require("../models/Post");
const Friendship = require("../models/Friendship");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studyup";
const PASSWORD = "123456";

const USER_UPDATES = [
  {
    oldEmails: ["maya@studyup.com", "shani@studyup.com"],
    email: "shani_salomon@studyup.com",
    name: "Shani Salomon",
    role: "admin",
    permissions: ["edit_course", "add_members", "search_advanced", "view_analytics"],
    approvalStatus: "approved",
  },
  {
    oldEmails: ["rachel@studyup.com"],
    email: "rachel_salomon@studyup.com",
    name: "Rachel Salomon",
    role: "student",
  },
  {
    oldEmails: ["david@studyup.com"],
    email: "rachel_biru@studyup.com",
    name: "Rachel Biru",
    role: "student",
  },
];

async function mergeIntoTarget(fromUser, toUser) {
  const fromId = fromUser._id;
  const toId = toUser._id;

  await Task.updateMany({ user: fromId }, { user: toId });
  await Post.updateMany({ author: fromId }, { author: toId });
  await Friendship.updateMany({ requester: fromId }, { requester: toId });
  await Friendship.updateMany({ recipient: fromId }, { recipient: toId });

  const courses = await Course.find({
    $or: [
      { creator: fromId },
      { manager: fromId },
      { members: fromId },
      { "pendingMembers.userId": fromId },
    ],
  });

  for (const course of courses) {
    if (course.creator?.toString() === fromId.toString()) course.creator = toId;
    if (course.manager?.toString() === fromId.toString()) course.manager = toId;

    course.members = course.members.filter((m) => m.toString() !== fromId.toString());
    if (!course.members.some((m) => m.toString() === toId.toString())) {
      course.members.push(toId);
    }

    course.pendingMembers.forEach((p) => {
      if (p.userId?.toString() === fromId.toString()) p.userId = toId;
    });

    await course.save();
  }

  fromUser.status = "inactive";
  await fromUser.save({ validateBeforeSave: false });
  console.log(`  Merged old account ${fromUser.email} into ${toUser.email}`);
}

async function updateUser(entry) {
  let user = null;
  for (const oldEmail of entry.oldEmails) {
    user = await User.findOne({ email: oldEmail });
    if (user) break;
  }

  if (!user) {
    user = await User.findOne({ email: entry.email });
  }

  if (!user) {
    user = await User.create({
      email: entry.email,
      name: entry.name,
      password: PASSWORD,
      role: entry.role,
      approvalStatus: entry.approvalStatus || "approved",
      permissions: entry.permissions || [],
    });
    console.log(`  Created ${entry.email}`);
    return user;
  }

  const taken = await User.findOne({
    email: entry.email,
    _id: { $ne: user._id },
  });
  if (taken) {
    console.log(`  ${entry.email} already exists — keeping existing account`);
    taken.password = PASSWORD;
    taken.name = entry.name;
    taken.role = entry.role;
    if (entry.permissions) taken.permissions = entry.permissions;
    taken.status = "active";
    await taken.save();
    return taken;
  }

  user.email = entry.email;
  user.name = entry.name;
  user.role = entry.role;
  if (entry.permissions) user.permissions = entry.permissions;
  if (entry.approvalStatus) user.approvalStatus = entry.approvalStatus;
  user.status = "active";
  user.password = PASSWORD;
  await user.save();
  console.log(`  Updated → ${entry.email} (${entry.name})`);
  return user;
}

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\nUpdating users (keeping all data)...\n");

  await updateUser(USER_UPDATES[0]);
  await updateUser(USER_UPDATES[1]);
  const shani = await updateUser(USER_UPDATES[2]);

  const yossi = await User.findOne({ email: "yossi@studyup.com" });
  if (yossi && shani && yossi._id.toString() !== shani._id.toString()) {
    await mergeIntoTarget(yossi, shani);
  }

  console.log("\nDone! Accounts (password: 123456):");
  console.log("  shani_salomon@studyup.com   (Shani Salomon, admin)");
  console.log("  rachel_salomon@studyup.com  (Rachel Salomon, student)");
  console.log("  rachel_biru@studyup.com     (Rachel Biru, student)");
  console.log("\nAll existing tasks, groups, and posts were preserved.\n");

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
