const Order = require("../models/Order");

exports.placeOrder = async (req, res) => {
  try {
    const { userId, products, address, paymentMode, amount } = req.body; // Updated to match frontend fields

    // Validate if required fields are present
    if (!userId || !products || !address || !paymentMode || !amount) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    // Create a new order object
    const newOrder = new Order({
      userId,
      products,
      address, // Save the address
      totalPrice: amount, // Total price is passed as 'amount' from frontend
      paymentStatus: paymentMode === "online" ? "Pending" : "Paid", // Set payment status based on payment method
      status: "Placed", // Set initial status
    });

    // Save the new order to the database
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate("products.productId").sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({ message: 'Cannot cancel a delivered order' });
    }

    order.status = 'Cancelled';
    await order.save();
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({
      status: order.status,
      estimatedDelivery: order.estimatedDelivery || "In process",
    });
  } catch (err) {
    res.status(500).json({ message: "Error tracking order" });
  }
};
