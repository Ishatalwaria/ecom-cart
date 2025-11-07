import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import './ProductDetail.css' // ✅ Import styles
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getImageUrl } from '../utils/imageUtils'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)
  const [showGoToCart, setShowGoToCart] = useState(false)
  const { addToCart, cart } = useCart()
  const { user, loading } = useAuth()
  const { showError, showInfo } = useToast()
  const navigate = useNavigate()

  // Debug user authentication state
  useEffect(() => {
    console.log("ProductDetail - Auth state:", { user, loading });
    
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
  }, [user, loading]);

  // Check if product is already in cart when page loads
  useEffect(() => {
    if (product && cart.some(item => item._id === product._id)) {
      setShowGoToCart(true);
    }
  }, [product, cart]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
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

  const handleAddToCart = () => {
    // Check localStorage directly as a backup
    const hasStoredUser = localStorage.getItem('user') || localStorage.getItem('userId');
    
    if (!user && !hasStoredUser) {
      showInfo("Please log in to add items to your cart")
      navigate('/login')
      return
    }

    if (product) {
      console.log("Adding product to cart:", product)
      console.log("Current user:", user)
      addToCart(product)
      setShowGoToCart(true)
      // Toast notification is now handled in the CartContext
    }
  }

  const handleGoToCart = () => {
    navigate('/cart');
  }

  if (loading) {
    return (
      <div className="section">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading product details...</p>
        </div>
      </div>
    );
  }

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

  // Get auth status considering both user object and localStorage
  const isLoggedIn = !!user || !!localStorage.getItem('user') || !!localStorage.getItem('userId');

  return (
    <div className="section fade-in">
      <div className="container">
        {product ? (
          <div className="product-detail">
            <div className="grid grid-1 grid-md-2 gap-4">
              <div className="product-image-container">
                <img 
                  src={getImageUrl(product.image)} 
                  alt={product.name} 
                  className="product-detail-img" 
                />
              </div>
              <div className="product-info slide-in-up">
                <h1 className="product-title">{product.name}</h1>
                <div className="product-category">
                  <span className="badge badge-primary">{product.category || 'General'}</span>
                </div>
                <p className="product-description">{product.description}</p>
                <h2 className="product-price">₹{product.price}</h2>
                <div className="product-stock">
                  {product.countInStock > 0 ? (
                    <span className="badge badge-success">In Stock ({product.countInStock})</span>
                  ) : (
                    <span className="badge badge-danger">Out of Stock</span>
                  )}
                </div>
                
                <div className="product-actions mt-4">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleAddToCart}
                    disabled={!product.countInStock}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-plus me-2" viewBox="0 0 16 16">
                      <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9V5.5z"/>
                      <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                    Add to Cart
                  </button>
                  
                  {showGoToCart && (
                    <button 
                      className="btn btn-outline-primary btn-lg cart-action-btn ms-2" 
                      onClick={handleGoToCart}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-fill me-2" viewBox="0 0 16 16">
                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                      </svg>
                      Go to Cart
                    </button>
                  )}
                </div>
                
                {isLoggedIn ? (
                  <div className="auth-status logged-in">
                    <p className="mb-0">Logged in as: {user?.name || user?.email || "User"}</p>
                  </div>
                ) : (
                  <div className="auth-status logged-out">
                    <p className="mb-0">Please log in to add items to cart</p>
                    <button 
                      className="btn btn-sm btn-secondary mt-2" 
                      onClick={() => navigate('/login')}
                    >
                      Login Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
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
