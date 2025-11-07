const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  console.log(`Fetching reviews for product ID: ${req.params.productId}`);
  try {
    // Convert string ID to ObjectId
    const productId = mongoose.Types.ObjectId.isValid(req.params.productId) 
      ? new mongoose.Types.ObjectId(req.params.productId)
      : req.params.productId;
      
    console.log('Converted product ID:', productId);
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${reviews.length} reviews`);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get review count for a product
router.get('/count/:productId', async (req, res) => {
  console.log(`Counting reviews for product ID: ${req.params.productId}`);
  try {
    // Convert string ID to ObjectId
    const productId = mongoose.Types.ObjectId.isValid(req.params.productId) 
      ? new mongoose.Types.ObjectId(req.params.productId)
      : req.params.productId;
      
    const count = await Review.countDocuments({ product: productId });
    console.log(`Review count: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching review count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get average rating for a product
router.get('/rating/:productId', async (req, res) => {
  console.log(`Calculating average rating for product ID: ${req.params.productId}`);
  try {
    // Convert string ID to ObjectId
    const productId = mongoose.Types.ObjectId.isValid(req.params.productId) 
      ? new mongoose.Types.ObjectId(req.params.productId)
      : req.params.productId;
    
    const result = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    const avgRating = result.length > 0 ? result[0].avgRating : 0;
    console.log(`Average rating: ${avgRating}`);
    res.json({ avgRating });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new review (requires authentication)
router.post('/', protect, async (req, res) => {
  console.log('Creating a new review, received data:', req.body);
  try {
    const { productId, rating, comment } = req.body;
    
    // Convert string ID to ObjectId
    const prodId = mongoose.Types.ObjectId.isValid(productId) 
      ? new mongoose.Types.ObjectId(productId)
      : productId;
    
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id)
      : req.user.id;
    
    console.log(`Converting IDs - Product: ${prodId}, User: ${userId}`);
    
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ 
      user: userId, 
      product: prodId 
    });
    
    if (existingReview) {
      console.log('User already reviewed this product');
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    // Verify product exists
    const product = await Product.findById(prodId);
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('Creating new review with data:', {
      user: userId,
      product: prodId,
      rating,
      comment,
      userName: req.user.name
    });
    
    const newReview = new Review({
      user: userId,
      product: prodId,
      rating,
      comment,
      userName: req.user.name || 'Anonymous'
    });
    
    const savedReview = await newReview.save();
    console.log('Review saved successfully:', savedReview);
    
    // Update product with review count and average rating
    await updateProductRatings(prodId);
    
    res.json(savedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a review (requires authentication)
router.put('/:id', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Verify the review belongs to the user
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this review' });
    }
    
    // Update review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    
    const updatedReview = await review.save();
    
    // Update product ratings
    await updateProductRatings(review.product);
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review (requires authentication)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Verify the review belongs to the user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this review' });
    }
    
    const productId = review.product;
    
    await Review.deleteOne({ _id: review._id });
    
    // Update product ratings
    await updateProductRatings(productId);
    
    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update product ratings
async function updateProductRatings(productId) {
  try {
    const reviews = await Review.find({ product: productId });
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    // Update product
    await Product.findByIdAndUpdate(productId, {
      numReviews: reviews.length,
      rating: averageRating
    });
  } catch (error) {
    console.error('Error updating product ratings:', error);
  }
}

module.exports = router; 