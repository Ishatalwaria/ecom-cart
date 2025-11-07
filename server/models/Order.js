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
  contactPhone: {
    type: String
  },
  contactEmail: {
    type: String
  },
  status: {
    type: String,
    enum: ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Placed"
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending", "Failed", "Refunded"],
    default: "Pending"
  },
  paymentMode: {
    type: String,
    enum: ["COD", "Online", "Card", "UPI"],
    default: "COD"
  },
  estimatedDelivery: {
    type: Date,
    default: function () {
      // Estimated delivery in 5 days from now
      const now = new Date();
      return new Date(now.setDate(now.getDate() + 5));
    }
  },
  trackingDetails: [
    {
      status: {
        type: String,
        required: true
      },
      location: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      description: String
    }
  ],
  trackingNumber: {
    type: String,
    default: function() {
      // Generate a random tracking number
      return 'TRK' + Math.floor(100000 + Math.random() * 900000);
    }
  },
  deliveryPartner: {
    type: String,
    default: "FastShip"
  }
}, { timestamps: true });

// Add a pre-save hook to update tracking details when status changes
orderSchema.pre('save', function(next) {
  // If this is a new order or status has been modified
  if (this.isNew || this.isModified('status')) {
    const newStatus = {
      status: this.status,
      location: "Warehouse",
      timestamp: new Date(),
      description: getStatusDescription(this.status)
    };
    
    // Add to tracking details
    if (!this.trackingDetails) {
      this.trackingDetails = [];
    }
    
    this.trackingDetails.push(newStatus);
  }
  next();
});

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

module.exports = mongoose.model("Order", orderSchema);
