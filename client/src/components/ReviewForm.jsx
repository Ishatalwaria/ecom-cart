import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ReviewForm.css';

const ReviewForm = ({ productId, onSuccess, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || !comment.trim()) {
      showError('Please provide both a rating and a comment');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5000/api/reviews', {
        productId,
        rating,
        comment
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        showSuccess('Review submitted successfully!');
        onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarInput = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i}
          className={`star ${(hoverRating || rating) >= i ? 'filled' : ''}`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <i className={`fas fa-star`}></i>
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form-container">
        <div className="review-form-header">
          <h3>Write a Review</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group rating-input">
            <label>Your Rating</label>
            <div className="star-rating">
              {renderStarInput()}
              <span className="rating-text">{rating} out of 5 stars</span>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="reviewComment">Your Review</label>
            <textarea
              id="reviewComment"
              rows="5"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              required
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm; 