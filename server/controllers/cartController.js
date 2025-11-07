const Cart = require("../models/Cart");
const mongoose = require('mongoose');
exports.addToCart = async (req, res) => {
  let { userId, productId, quantity } = req.body;

   if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId, quantity }]
      });
    } else {
      const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCart = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }
  try {
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeItem = async (req, res) => {
  const { userId, productId } = req.body;

   if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid userId or productId" });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.clearCart = async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }
  
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = [];
    await cart.save();
    res.json({ message: "Cart cleared", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
