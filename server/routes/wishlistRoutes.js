const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Get user's wishlist (requires authentication)
router.get('/', protect, async (req, res) => {
  console.log('GET /api/wishlist - Fetching wishlist for user:', req.user.id);
  try {
    // Ensure user ID is valid ObjectId
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id)
      : req.user.id;
    
    console.log('Looking up wishlist items with userId:', userId);
    
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate('product', 'name price image countInStock rating numReviews');
    
    console.log(`Found ${wishlistItems.length} wishlist items`);
    
    // Debug the populated data
    wishlistItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        id: item._id,
        productId: item.product?._id || 'No product ID',
        productName: item.product?.name || 'No product name',
        productPopulated: !!item.product
      });
    });
    
    res.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add product to wishlist (requires authentication)
router.post('/', protect, async (req, res) => {
  console.log('POST /api/wishlist - Adding item to wishlist:', req.body);
  try {
    const { productId } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is already in wishlist
    const existingItem = await Wishlist.findOne({
      user: req.user.id,
      product: productId
    });
    
    if (existingItem) {
      console.log('Product already in wishlist:', productId);
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add to wishlist
    const wishlistItem = new Wishlist({
      user: req.user.id,
      product: productId
    });
    
    const savedItem = await wishlistItem.save();
    console.log('Item added to wishlist:', savedItem);
    
    // Return the saved item with product details
    const populatedItem = await Wishlist.findById(savedItem._id)
      .populate('product', 'name price image countInStock rating numReviews');
    
    console.log('Returning populated item:', populatedItem);
    res.status(201).json(populatedItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove product from wishlist (requires authentication)
router.delete('/:productId', protect, async (req, res) => {
  console.log('DELETE /api/wishlist/:productId - Removing item:', req.params.productId);
  try {
    // Convert string ID to ObjectId if needed
    const productId = mongoose.Types.ObjectId.isValid(req.params.productId) 
      ? new mongoose.Types.ObjectId(req.params.productId)
      : req.params.productId;
      
    console.log('Looking for wishlist item with productId:', productId);
    
    const wishlistItem = await Wishlist.findOne({
      user: req.user.id,
      product: productId
    });
    
    if (!wishlistItem) {
      console.log('Product not found in wishlist');
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    
    console.log('Deleting wishlist item:', wishlistItem._id);
    await Wishlist.deleteOne({ _id: wishlistItem._id });
    
    res.json({ message: 'Product removed from wishlist', productId: req.params.productId });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if product is in wishlist (requires authentication)
router.get('/check/:productId', protect, async (req, res) => {
  console.log('GET /api/wishlist/check/:productId - Checking wishlist status:', req.params.productId);
  try {
    const exists = await Wishlist.exists({
      user: req.user.id,
      product: req.params.productId
    });
    
    console.log('Product in wishlist:', !!exists);
    res.json({ inWishlist: !!exists });
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 