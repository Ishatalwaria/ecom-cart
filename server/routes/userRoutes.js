const express = require("express");
const router = express.Router();
const { updateUser, getUserDetails, getUserOrders } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Update user profile
router.put("/:id", protect, updateUser);

// Get user details
router.get("/:id", protect, getUserDetails);

// Get user orders
router.get("/:id/orders", protect, getUserOrders);

module.exports = router; 