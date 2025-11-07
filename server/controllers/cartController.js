const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require('mongoose');

exports.addToCart = async (req, res) => {
  let { userId, productId, quantity } = req.body;

  // Check for required fields
  if (!userId || !productId) {
    return res.status(400).json({ message: "Missing required fields: userId and productId" });
  }

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  // Validate productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId format" });
  }

  // Authorize the request
  if (req.user && req.user._id.toString() !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized to modify this cart" });
  }

  // Ensure quantity is valid
  quantity = Math.max(1, quantity || 1);

  try {
    // First, get the product details
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart if it doesn't exist, with full product details
      cart = new Cart({
        userId,
        products: [{
          productId: product._id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          description: product.description,
          image: product.image,
          quantity
        }]
      });
    } else {
      // Find if the product is already in the cart
      const productIndex = cart.products.findIndex(p => 
        p.productId.toString() === productId);
      
      if (productIndex > -1) {
        // Replace the quantity instead of incrementing
        cart.products[productIndex].quantity = quantity;
        
        // Update product details in case they changed
        cart.products[productIndex].name = product.name;
        cart.products[productIndex].brand = product.brand;
        cart.products[productIndex].category = product.category;
        cart.products[productIndex].price = product.price;
        cart.products[productIndex].description = product.description;
        cart.products[productIndex].image = product.image;
      } else {
        // Add new product to cart with full details
        cart.products.push({
          productId: product._id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          description: product.description,
          image: product.image,
          quantity
        });
      }
    }

    await cart.save();
    
    // No need to populate since we're storing all details directly
    res.status(200).json(cart);
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getCart = async (req, res) => {
  const { userId } = req.params;

  // Validate userId
  if (!userId) {
    return res.status(400).json({ message: "Missing userId parameter" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  // Compare with authenticated user
  if (req.user && req.user._id.toString() !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized to access this cart" });
  }

  try {
    // No need to populate since we store full product details
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      // Return empty cart instead of 404
      return res.json({ userId, products: [] }); 
    }

    res.json(cart);
  } catch (err) {
    console.error("Error in getCart:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.removeItem = async (req, res) => {
  const { userId, productId } = req.body;

  // Check required fields
  if (!userId || !productId) {
    return res.status(400).json({ message: "Missing required fields: userId and productId" });
  }

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId format" });
  }

  // Authorize the request
  if (req.user && req.user._id.toString() !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized to modify this cart" });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the product from cart
    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    await cart.save();

    // No need to populate since we have full details
    res.json(cart);
  } catch (err) {
    console.error("Error in removeItem:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  const { userId } = req.body;

  // Check required field
  if (!userId) {
    return res.status(400).json({ message: "Missing required field: userId" });
  }

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }
  
  // Authorize the request
  if (req.user && req.user._id.toString() !== userId && !req.user.isAdmin) {
    return res.status(403).json({ message: "Not authorized to modify this cart" });
  }
  
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.json({ message: "Cart is already empty", cart: { userId, products: [] } });
    }

    cart.products = [];
    await cart.save();
    res.json({ message: "Cart cleared", cart });
  } catch (err) {
    console.error("Error in clearCart:", err);
    res.status(500).json({ message: err.message });
  }
};
