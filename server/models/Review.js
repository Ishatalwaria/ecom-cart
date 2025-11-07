const mongoose = require('mongoose');
console.log('Review model loaded');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Create a compound index to ensure a user can only review a product once
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

console.log('Review model defined with schema');
const ReviewModel = mongoose.model('Review', reviewSchema);
console.log('Review model exported');

module.exports = ReviewModel; 