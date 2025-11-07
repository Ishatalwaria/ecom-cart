const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
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
      name: {
        type: String
      },
      brand: {
        type: String
      },
      category: {
        type: String
      },
      price: {
        type: Number
      },
      description: {
        type: String
      },
      image: {
        type: String
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
