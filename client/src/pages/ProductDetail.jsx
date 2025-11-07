import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import './ProductDetail.css' // ✅ Import styles
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../context/WishlistContext'
import { getImageUrl } from '../utils/imageUtils'
import ReviewForm from '../components/ReviewForm'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)
  const [showGoToCart, setShowGoToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewCount, setReviewCount] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const { addToCart, cart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const navigate = useNavigate()

  // Mock reviews data (would come from API in real app)
  const [reviewsData, setReviewsData] = useState([
    { id: 1, user: "Sarah J.", rating: 5, date: "2023-05-10", comment: "Excellent quality and fast delivery. Exactly as described!" },
    { id: 2, user: "Mike T.", rating: 4, date: "2023-04-22", comment: "Good product overall. Slightly smaller than I expected, but great value." },
    { id: 3, user: "Emma R.", rating: 5, date: "2023-03-15", comment: "Perfect! I've ordered this twice now and love it." },
    { id: 4, user: "David M.", rating: 3, date: "2023-02-28", comment: "It's okay. Material quality could be better, but it serves its purpose." }
  ])

  // Debug user authentication state
  useEffect(() => {
    console.log("ProductDetail - Auth state:", { user, isAuthenticated });
    
    // Debug localStorage directly
    try {
      const storedUser = localStorage.getItem('user');
      const userId = localStorage.getItem('userId');
      console.log("Direct localStorage check:", { 
        storedUser: storedUser ? JSON.parse(storedUser) : null,
        userId
      });
    } catch (err) {
      console.error("Error checking localStorage:", err);
    }
  }, [user, isAuthenticated]);

  // Check if product is already in cart when page loads
  useEffect(() => {
    if (product && cart.some(item => item._id === product._id)) {
      setShowGoToCart(true);
    }
  }, [product, cart]);

  // Fetch product data
  useEffect(() => {
    axios.get(`https://shop-mate-ecommerce.onrender.com/api/products/${id}`)
      .then(res => {
        if (res.data) {
          setProduct(res.data)
        } else {
          console.error("No product data returned.")
          setError("Product not found")
          showError("Product not found")
        }
      })
      .catch(err => {
        console.error("Error fetching product:", err)
        setError("Error loading product")
        showError("Error loading product details")
      })
  }, [id, showError])

  // Fetch reviews
  useEffect(() => {
    if (id) {
      console.log("Fetching reviews for product ID:", id);
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    try {
      console.log("Making API call to fetch reviews");
      // Fetch reviews
      const reviewsRes = await axios.get(`https://shop-mate-ecommerce.onrender.com/api/reviews/product/${id}`);
      console.log("Reviews data received:", reviewsRes.data);
      setReviews(reviewsRes.data);
      
      // Fetch review count
      const countRes = await axios.get(`https://shop-mate-ecommerce.onrender.com/api/reviews/count/${id}`);
      console.log("Review count received:", countRes.data);
      setReviewCount(countRes.data.count);
      
      // Fetch average rating
      const ratingRes = await axios.get(`https://shop-mate-ecommerce.onrender.com/api/reviews/rating/${id}`);
      console.log("Average rating received:", ratingRes.data);
      setAverageRating(ratingRes.data.avgRating || 0);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = () => {
    // Check localStorage directly as a backup
    const hasStoredUser = localStorage.getItem('user') || localStorage.getItem('userId');
    
    if (!isAuthenticated && !hasStoredUser) {
      showInfo("Please log in to add items to your cart")
      navigate('/login')
      return
    }

    if (product) {
      const productWithQuantity = { ...product, quantity }
      addToCart(productWithQuantity)
      setShowGoToCart(true)
    }
  }

  const handleGoToCart = () => {
    navigate('/cart');
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.countInStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleToggleWishlist = async () => {
    // Get token directly from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      showInfo("Please log in to add items to your wishlist");
      navigate('/login');
      return;
    }

    if (product) {
      try {
        if (isInWishlist(product._id)) {
          await removeFromWishlist(product._id);
        } else {
          await addToWishlist(product);
        }
      } catch (error) {
        console.error("Error updating wishlist:", error);
      }
    }
  };

  const handleOpenReviewForm = () => {
    // Get token directly from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      showInfo("Please log in to write a review");
      navigate('/login');
      return;
    }
    setShowReviewForm(true);
  };

  const handleReviewSuccess = (newReview) => {
    // Add the new review to the existing reviews
    setReviews([newReview, ...reviews]);
    // Update review count
    setReviewCount(prevCount => prevCount + 1);
    // Recalculate average rating
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0) + newReview.rating;
    setAverageRating(totalRating / (reviews.length + 1));
    // Show success message
    showSuccess("Your review has been added");
  };

  // Generate star display for ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star filled"></i>);
      } else if (i - 0.5 <= rating) {
        stars.push(<i key={i} className="fas fa-star-half-alt filled"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return stars;
  };

  if (error) {
    return (
      <div className="section">
        <div className="container">
          <div className="alert alert-danger">{error}</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {product ? (
          <>
            <div className="product-detail-container">
              <div className="product-detail-left">
                <div className="product-image-wrapper">
                  <img 
                    src={getImageUrl(product.image)} 
                    alt={product.name} 
                    className="product-detail-img" 
                  />
                </div>
              </div>
              
              <div className="product-detail-right">
                <div className="product-breadcrumb">
                  <span onClick={() => navigate('/')}>Home</span> /
                  {/* <span onClick={() => navigate(`/category/${product.category}`)}>{product.category || 'Products'}</span> / */}
                  <span className="active">{product.name}</span>
                </div>
                
                <h1 className="product-title">{product.name}</h1>
                
                <div className="product-meta">
                  <div className="product-rating">
                    <div className="stars">
                      {renderStars(averageRating)}
                    </div>
                    <span className="rating-text">{averageRating.toFixed(1)} ({reviewCount} reviews)</span>
                  </div>
                  
                  <div className="product-category">
                    <span className="badge">{product.category || 'General'}</span>
                  </div>
                </div>
                
                <div className="product-price-container">
                  <h2 className="product-price">₹{product.price}</h2>
                  {product.oldPrice && (
                    <span className="product-old-price">₹{product.oldPrice}</span>
                  )}
                </div>
                
                <div className="product-stock-container">
                  {product.countInStock > 10 ? (
                    <div className="stock in-stock">
                      <i className="fas fa-check-circle"></i> In Stock
                    </div>
                  ) : product.countInStock > 0 ? (
                    <div className="stock limited">
                      <i className="fas fa-exclamation-circle"></i> Only {product.countInStock} left
                    </div>
                  ) : (
                    <div className="stock out-of-stock">
                      <i className="fas fa-times-circle"></i> Out of Stock
                    </div>
                  )}
                </div>
                
                <div className="short-description">
                  <p>{product.shortDescription || product.description?.substring(0, 120) + "..."}</p>
                </div>
                
                {product.countInStock > 0 && (
                  <div className="quantity-selector">
                    <span className="quantity-label">Quantity:</span>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn" 
                        onClick={decreaseQuantity} 
                        disabled={quantity <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="quantity-value">{quantity}</span>
                      <button 
                        className="quantity-btn" 
                        onClick={increaseQuantity} 
                        disabled={quantity >= product.countInStock}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="product-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={!product.countInStock}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    {product.countInStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  
                  {showGoToCart && (
                    <button 
                      className="go-to-cart-btn" 
                      onClick={handleGoToCart}
                    >
                      <i className="fas fa-shopping-bag"></i>
                      Go to Cart
                    </button>
                  )}
                  
                  <button 
                    className={`wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`}
                    onClick={handleToggleWishlist}
                  >
                    <i className={isInWishlist(product._id) ? "fas fa-heart" : "far fa-heart"}></i>
                  </button>
                </div>
                
                <div className="product-delivery">
                  <div className="delivery-option">
                    <i className="fas fa-truck"></i>
                    <span>Free shipping on orders over ₹500</span>
                  </div>
                  <div className="delivery-option">
                    <i className="fas fa-undo"></i>
                    <span>30-day returns policy</span>
                  </div>
                  <div className="delivery-option">
                    <i className="fas fa-shield-alt"></i>
                    <span>Secure payment</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="product-details-tabs">
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specifications')}
                >
                  Specifications
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({reviewCount})
                </button>
              </div>
              
              <div className="tabs-content">
                {activeTab === 'description' && (
                  <div className="tab-pane">
                    <p className="description-text">{product.description}</p>
                  </div>
                )}
                
                {activeTab === 'specifications' && (
                  <div className="tab-pane">
                    <table className="specs-table">
                      <tbody>
                        {product.brand && (
                          <tr>
                            <td>Brand</td>
                            <td>{product.brand}</td>
                          </tr>
                        )}
                        {product.weight && (
                          <tr>
                            <td>Weight</td>
                            <td>{product.weight}</td>
                          </tr>
                        )}
                        {product.dimensions && (
                          <tr>
                            <td>Dimensions</td>
                            <td>{product.dimensions}</td>
                          </tr>
                        )}
                        {product.material && (
                          <tr>
                            <td>Material</td>
                            <td>{product.material}</td>
                          </tr>
                        )}
                        <tr>
                          <td>Category</td>
                          <td>{product.category || 'General'}</td>
                        </tr>
                        <tr>
                          <td>In Stock</td>
                          <td>{product.countInStock > 0 ? 'Yes' : 'No'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="tab-pane">
                    <div className="reviews-summary">
                      <div className="overall-rating">
                        <div className="rating-number">{averageRating.toFixed(1)}</div>
                        <div className="rating-stars">
                          {renderStars(averageRating)}
                        </div>
                        <div className="rating-count">Based on {reviewCount} reviews</div>
                      </div>
                      
                      <button className="write-review-btn" onClick={handleOpenReviewForm}>
                        <i className="fas fa-pen"></i> Write a Review
                      </button>
                    </div>
                    
                    <div className="reviews-list">
                      {reviews.length > 0 ? (
                        reviews.map(review => (
                          <div key={review._id} className="review-item">
                            <div className="review-header">
                              <div className="reviewer-name">{review.userName}</div>
                              <div className="review-date">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                            <div className="review-rating">
                              {renderStars(review.rating)}
                              <span className="rating-value">{review.rating}/5</span>
                            </div>
                            <div className="review-text">
                              <p>{review.comment}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-reviews-message">
                          <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Review Form Modal */}
            {showReviewForm && (
              <ReviewForm 
                productId={product._id} 
                onSuccess={handleReviewSuccess} 
                onClose={() => setShowReviewForm(false)} 
              />
            )}
          </>
        ) : (
          <div className="text-center mt-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading product details...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
