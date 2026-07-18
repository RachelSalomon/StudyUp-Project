const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  listUsers,
  getUserProfile,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/users", protect, listUsers);

// Profile GET routes (Split to support optional ID parameter without crashing)
// Route for getting the current logged-in user's profile
router.get("/profile", protect, getUserProfile);
// Route for getting a specific user's profile by ID
router.get("/profile/:id", protect, getUserProfile);

// Profile PUT routes (Split to support optional ID parameter without crashing)
// Route for updating the current logged-in user's profile
router.put("/profile", protect, updateUser);
// Route for updating a specific user's profile by ID
router.put("/profile/:id", protect, updateUser);

// Profile DELETE route (Requires specific ID)
router.delete("/profile/:id", protect, deleteUser);

module.exports = router;
