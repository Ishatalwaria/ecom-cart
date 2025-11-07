const User = require("../models/User");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    console.log("Update user request:", {
      userId: req.params.id,
      requestBody: req.body,
      authenticatedUser: req.user ? req.user._id : 'None'
    });
    
    const { name, email, phone, address } = req.body;
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log("User not found:", req.params.id);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is authorized to update this profile
    if (req.user._id.toString() !== req.params.id && !req.user.isAdmin) {
      console.log("Authorization failed:", {
        requestUser: req.user._id.toString(),
        targetUser: req.params.id
      });
      return res.status(401).json({ message: "Not authorized to update this profile" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update user
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    const updatedUser = await user.save();
    console.log("User updated successfully:", updatedUser._id);

    // Return user data without password
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// @desc    Get user details
// @route   GET /api/users/:id
// @access  Private
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is authorized to view this profile
    if (req.user._id.toString() !== req.params.id && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized to view this profile" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error getting user details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/user/:userId
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    // Check if user is authorized to view orders
    if (req.user._id.toString() !== req.params.id && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized to view these orders" });
    }

    const orders = await Order.find({ userId: req.params.id })
      .sort({ createdAt: -1 }); // Sort by date, newest first
    
    res.json(orders);
  } catch (err) {
    console.error("Error getting user orders:", err);
    res.status(500).json({ message: "Server error" });
  }
}; 