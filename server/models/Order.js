const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: String, // Add name for easy frontend rendering
      price: Number, // Optional: cache price at time of order
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  amount: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
    default: "Placed"
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending"
  },
  paymentMode: {
    type: String,
    enum: ["COD", "Online"],
    default: "COD"
  },
  estimatedDelivery: {
    type: Date,
    default: function () {
      // Estimated delivery in 5 days from now
      const now = new Date();
      return new Date(now.setDate(now.getDate() + 5));
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
