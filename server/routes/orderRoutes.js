const express = require("express");
const router = express.Router();
const { placeOrder, getOrdersByUser, cancelOrder, trackOrder, getOrderById, updateOrderStatus } = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

// All order routes should be protected
router.use(protect);

// POST /api/orders/ - place an order
router.post("/", placeOrder);

// GET /api/orders/:id - get a specific order by ID
router.get("/:id", getOrderById);

// PUT /api/orders/:id/status - update order status (admin only)
router.put("/:id/status", admin, updateOrderStatus);

// GET /api/orders/user/:userId - get user's orders
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user is authorized to view orders
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized to view these orders" });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }); // Sort by date, newest first
    
    res.json(orders);
  } catch (err) {
    console.error("Error getting user orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/orders/:orderId/cancel - cancel an order
router.put('/:orderId/cancel', cancelOrder);

// GET /api/orders/:orderId/track - track an order
router.get('/:orderId/track', trackOrder);

module.exports = router;
