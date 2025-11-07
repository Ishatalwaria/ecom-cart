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
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="container mt-5"><p className="text-danger">{error}</p></div>
  }

  // Get auth status considering both user object and localStorage
  const isLoggedIn = !!user || !!localStorage.getItem('user') || !!localStorage.getItem('userId');

  return (
    <div className="container mt-5">
      {product ? (
        <div className="row align-items-center">
          <div className="col-md-6">
            <img 
              src={getImageUrl(product.image)} 
              alt={product.name} 
              className="img-fluid" 
            />
          </div>
          <div className="col-md-6">
            <h2 className="product-title">{product.name}</h2>
            <p className="product-description">{product.description}</p>
            <h3 className="product-price">₹{product.price}</h3>
            
            <div className="product-actions">
              <button className="btn btn-success" onClick={handleAddToCart}>
                Add to Cart
              </button>
              
              {showGoToCart && (
                <button 
                  className="btn btn-primary cart-action-btn" 
                  onClick={handleGoToCart}
                >
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
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading product details...</p>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
