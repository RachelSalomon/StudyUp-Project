/**
 * Create or fix the 3 team users + reset passwords to 123456.
 * Does NOT delete tasks, groups, or posts.
 *
 * Run: npm run ensure-users
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studyup";
const PASSWORD = "123456";

const TEAM = [
  {
    email: "shani_salomon@studyup.com",
    name: "Shani Salomon",
    role: "admin",
    oldEmails: ["maya@studyup.com", "shani@studyup.com"],
  },
  {
    email: "rachel_salomon@studyup.com",
    name: "Rachel Salomon",
    role: "student",
    oldEmails: ["rachel@studyup.com"],
  },
  {
    email: "rachel_biru@studyup.com",
    name: "Rachel Biru",
    role: "student",
    oldEmails: ["david@studyup.com"],
  },
];

async function findExisting(def) {
  let user = await User.findOne({ email: def.email });
  if (user) return user;

  for (const old of def.oldEmails) {
    user = await User.findOne({ email: old });
    if (user) return user;
  }

  // Match by similar name as last resort
  const firstName = def.name.split(" ")[0].toLowerCase();
  const candidates = await User.find({
    status: { $ne: "inactive" },
    name: { $regex: firstName, $options: "i" },
  });
  if (candidates.length === 1) return candidates[0];

  return null;
}

async function ensureUser(def) {
  let user = await findExisting(def);

  if (!user) {
    user = new User({
      email: def.email,
      name: def.name,
      password: PASSWORD,
      role: def.role,
      status: "active",
      approvalStatus: "approved",
      permissions:
        def.role === "admin"
          ? ["edit_course", "add_members", "search_advanced", "view_analytics"]
          : [],
    });
    await user.save();
    console.log(`  CREATED  ${def.email}`);
    return user;
  }

  user.email = def.email;
  user.name = def.name;
  user.role = def.role;
  if (def.role === "admin") {
    user.permissions = ["edit_course", "add_members", "search_advanced", "view_analytics"];
  } else {
    user.permissions = [];
  }
  user.status = "active";
  user.approvalStatus = "approved";
  user.password = PASSWORD;
  await user.save();
  console.log(`  FIXED    ${def.email} (${def.role})`);
  return user;
}

async function run() {
  if (!process.env.JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET is missing in .env — login will fail after password check!\n");
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\nEnsuring team accounts...\n");

  for (const def of TEAM) {
    await ensureUser(def);
  }

  console.log("\nAll accounts ready (password: 123456):");
  TEAM.forEach((u) => console.log(`  ${u.email}`));

  console.log("\nUsers currently in database:");
  const all = await User.find({ status: { $ne: "inactive" } }).select("email name role");
  all.forEach((u) => console.log(`  ${u.email} — ${u.name} (${u.role})`));

  console.log("\nNow: start server (npm start), then log in again.\n");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
