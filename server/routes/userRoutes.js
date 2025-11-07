const express = require("express");
const router = express.Router();
const { updateUser, getUserDetails, getUserOrders } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Routes need to be in the correct order (specific routes before generic ones)

// Update user profile
router.put("/:id", protect, updateUser);

// Get user orders - more specific route comes first
router.get("/:id/orders", protect, getUserOrders);

// Get user details
router.get("/:id", protect, getUserDetails);

// Add a debug route to help troubleshoot
router.get("/", (req, res) => {
  res.json({ message: "User routes are working" });
});

module.exports = router; 