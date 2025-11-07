const express = require("express");
const router = express.Router();
const { placeOrder, getOrdersByUser , cancelOrder , trackOrder } = require("../controllers/orderController");

// POST /api/orders/ - place an order
router.post("/", placeOrder);

// GET /api/orders/:userId - get user's orders
router.get("/:userId", getOrdersByUser);
router.put('/:orderId/cancel', cancelOrder)
router.get('/:orderId/track', trackOrder);
module.exports = router;
