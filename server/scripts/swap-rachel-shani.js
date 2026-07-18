/**
 * Swap all content between Rachel Salomon and Shani Salomon.
 * After running: Shani's account has Rachel's data (and vice versa).
 * Names/emails/passwords stay on each account — only content moves.
 *
 * Run: npm run swap-rachel-shani
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Task = require("../models/Task");
const Post = require("../models/Post");
const Friendship = require("../models/Friendship");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studyup";

const RACHEL_EMAIL = "rachel_salomon@studyup.com";
const SHANI_EMAIL = "shani_salomon@studyup.com";

function swapRef(id, idA, idB, tempId) {
  if (!id) return id;
  const s = id.toString();
  if (s === idA.toString()) return tempId;
  if (s === idB.toString()) return idA;
  if (s === tempId.toString()) return idB;
  return id;
}

async function swapScalarRefs(Model, fields, idA, idB, tempId) {
  for (const field of fields) {
    await Model.updateMany({ [field]: idA }, { $set: { [field]: tempId } });
    await Model.updateMany({ [field]: idB }, { $set: { [field]: idA } });
    await Model.updateMany({ [field]: tempId }, { $set: { [field]: idB } });
  }
}

async function swapCourses(idA, idB, tempId) {
  const courses = await Course.find({
    $or: [
      { creator: idA },
      { creator: idB },
      { manager: idA },
      { manager: idB },
      { members: idA },
      { members: idB },
      { "pendingMembers.userId": idA },
      { "pendingMembers.userId": idB },
    ],
  });

  for (const course of courses) {
    course.creator = swapRef(course.creator, idA, idB, tempId);
    course.manager = swapRef(course.manager, idA, idB, tempId);

    course.members = course.members.map((m) => swapRef(m, idA, idB, tempId));
    course.members = [...new Map(course.members.map((m) => [m.toString(), m])).values()];

    course.pendingMembers.forEach((p) => {
      p.userId = swapRef(p.userId, idA, idB, tempId);
    });

    await course.save();
  }
}

async function swapFriendships(idA, idB, tempId) {
  await Friendship.updateMany({ requester: idA }, { requester: tempId });
  await Friendship.updateMany({ requester: idB }, { requester: idA });
  await Friendship.updateMany({ requester: tempId }, { requester: idB });

  await Friendship.updateMany({ recipient: idA }, { recipient: tempId });
  await Friendship.updateMany({ recipient: idB }, { recipient: idA });
  await Friendship.updateMany({ recipient: tempId }, { recipient: idB });
}

async function swapUserMeta(userA, userB) {
  const tempGroups = [...userA.joinedGroups];
  const tempManaged = [...userA.managedCourses];

  userA.joinedGroups = [...userB.joinedGroups];
  userA.managedCourses = [...userB.managedCourses];
  userB.joinedGroups = tempGroups;
  userB.managedCourses = tempManaged;

  await userA.save();
  await userB.save();
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  const rachel = await User.findOne({ email: RACHEL_EMAIL });
  const shani = await User.findOne({ email: SHANI_EMAIL });

  if (!rachel || !shani) {
    console.error("Could not find both users:");
    console.error(`  ${RACHEL_EMAIL}: ${rachel ? "found" : "MISSING"}`);
    console.error(`  ${SHANI_EMAIL}: ${shani ? "found" : "MISSING"}`);
    process.exit(1);
  }

  const idA = rachel._id;
  const idB = shani._id;

  const tempUser = await User.create({
    name: "_swap_temp",
    email: `_swap_temp_${Date.now()}@internal.local`,
    password: "tempswap123",
    status: "inactive",
  });
  const tempId = tempUser._id;

  console.log("Swapping content between:");
  console.log(`  A: ${rachel.name} (${rachel.email})`);
  console.log(`  B: ${shani.name} (${shani.email})\n`);

  await swapScalarRefs(Task, ["user", "assignedTo"], idA, idB, tempId);
  console.log("  ✓ Tasks");

  await swapScalarRefs(Post, ["author"], idA, idB, tempId);
  console.log("  ✓ Posts");

  await swapCourses(idA, idB, tempId);
  console.log("  ✓ Groups (courses)");

  await swapFriendships(idA, idB, tempId);
  console.log("  ✓ Friendships");

  await swapUserMeta(rachel, shani);
  console.log("  ✓ User group memberships");

  await User.deleteOne({ _id: tempId });
  console.log("  ✓ Cleanup\n");

  const shaniTasks = await Task.countDocuments({ user: idB, isDeleted: false });
  const shaniPosts = await Post.countDocuments({ author: idB, isDeleted: false });
  const shaniGroups = await Course.countDocuments({
    $or: [{ creator: idB }, { manager: idB }, { members: idB }],
  });

  console.log("Done! Shani's account now has:");
  console.log(`  ${shaniTasks} tasks`);
  console.log(`  ${shaniPosts} posts`);
  console.log(`  ${shaniGroups} group links`);
  console.log("\nLog out and log in again as shani_salomon@studyup.com to see the data.\n");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Swap failed:", err);
  process.exit(1);
});
