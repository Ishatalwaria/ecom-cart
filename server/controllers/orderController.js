const Order = require("../models/Order");
const User = require("../models/User");

exports.placeOrder = async (req, res) => {
  try {
    console.log("Received order data:", req.body);
    const { userId, products, address, paymentMode, amount } = req.body;

    // Validate if required fields are present
    if (!userId || !products || !address || !paymentMode || !amount) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    // Verify user is authorized to place order for this userId
    if (req.user && req.user._id.toString() !== userId) {
      console.error(`User ${req.user._id} attempted to place order for ${userId}`);
      return res.status(403).json({ message: "Not authorized to place order for this user" });
    }

    // Format products array to match schema
    const formattedProducts = products.map(product => ({
      productId: product.productId,
      name: product.name,
      price: product.price,
      quantity: product.quantity
    }));

    // Create a new order object
    const newOrder = new Order({
      userId,
      products: formattedProducts,
      address,
      amount, // Using amount directly as totalPrice
      paymentStatus: paymentMode === "online" ? "Pending" : "Paid",
      paymentMode: paymentMode === "online" ? "Online" : "COD",
      status: "Placed",
    });

    // Save the new order to the database
    const savedOrder = await newOrder.save();
    console.log("Order saved successfully:", savedOrder._id);
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ message: "Server error during order placement: " + err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify user is authorized to view orders
    if (req.user && req.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view these orders" });
    }
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders: " + err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user is authorized to cancel the order
    if (req.user && req.user._id.toString() !== order.userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({ message: 'Cannot cancel a delivered order' });
    }

    order.status = 'Cancelled';
    await order.save();
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: 'Server error during cancellation: ' + error.message });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Verify user is authorized to track the order
    if (req.user && req.user._id.toString() !== order.userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to track this order" });
    }
    
    res.json({
      status: order.status,
      estimatedDelivery: order.estimatedDelivery || "In process",
    });
  } catch (err) {
    console.error("Error tracking order:", err);
    res.status(500).json({ message: "Error tracking order: " + err.message });
  }
};
