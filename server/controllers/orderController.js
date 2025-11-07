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
    
    // Prepare detailed tracking information
    const trackingInfo = {
      orderId: order._id,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery || "In process",
      trackingNumber: order.trackingNumber || "Not available",
      deliveryPartner: order.deliveryPartner || "FastShip",
      trackingHistory: order.trackingDetails || [],
      currentLocation: order.trackingDetails && order.trackingDetails.length > 0 
        ? order.trackingDetails[order.trackingDetails.length - 1].location 
        : "Processing center",
      paymentStatus: order.paymentStatus,
      orderDate: order.createdAt
    };
    
    res.json(trackingInfo);
  } catch (err) {
    console.error("Error tracking order:", err);
    res.status(500).json({ message: "Error tracking order: " + err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Verify user is authorized to view this order
    if (req.user._id.toString() !== order.userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    
    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Error fetching order: " + err.message });
  }
};

// Add a new endpoint to update order status with location (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, location, description } = req.body;
    
    // Verify user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized. Admin access required." });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Update order status
    order.status = status || order.status;
    
    // Add new tracking detail
    const newTrackingDetail = {
      status: status,
      location: location || "Warehouse",
      timestamp: new Date(),
      description: description || getStatusDescription(status)
    };
    
    // Initialize tracking details array if needed
    if (!order.trackingDetails) {
      order.trackingDetails = [];
    }
    
    // Add new tracking detail
    order.trackingDetails.push(newTrackingDetail);
    
    // Update estimated delivery for specific statuses
    if (status === "Shipped") {
      // 3 days from now
      const date = new Date();
      order.estimatedDelivery = new Date(date.setDate(date.getDate() + 3));
    } else if (status === "Out for Delivery") {
      // Today
      order.estimatedDelivery = new Date();
    }
    
    const updatedOrder = await order.save();
    
    res.json({
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Error updating order: " + err.message });
  }
};

// Helper function for status descriptions
function getStatusDescription(status) {
  const descriptions = {
    "Placed": "Order has been placed successfully",
    "Processing": "Order is being processed at our warehouse",
    "Shipped": "Order has been shipped and is on the way",
    "Out for Delivery": "Order is out for delivery and will be delivered today",
    "Delivered": "Order has been delivered successfully",
    "Cancelled": "Order has been cancelled"
  };
  
  return descriptions[status] || "Status updated";
}
