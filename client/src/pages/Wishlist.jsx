import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const hasRefreshed = useRef(false);

  // Only refresh wishlist once when component mounts
  useEffect(() => {
    if (!hasRefreshed.current) {
      console.log("Wishlist Page - Initial load, refreshing wishlist");
      refreshWishlist();
      hasRefreshed.current = true;
    }
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
    showSuccess('Item removed from wishlist');
  };

  const handleAddToCart = (product) => {
    const productWithQuantity = { ...product, quantity: 1 };
    addToCart(productWithQuantity);
    showSuccess('Item added to cart');
  };

  if (loading) {
    return (
      <div className="section">
        <div className="container text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <i className="far fa-heart empty-icon"></i>
            <h2>Your wishlist is empty</h2>
            <p>Items added to your wishlist will be saved here</p>
            <Link to="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-items">
            {wishlist.map((item) => {
              const product = item.product || {};
              
              return (
                <div key={item._id} className="wishlist-item">
                  <div className="wishlist-item-image">
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name} 
                      onClick={() => navigate(`/product/${product._id}`)}
                    />
                  </div>
                  
                  <div className="wishlist-item-content">
                    <h3 onClick={() => navigate(`/product/${product._id}`)}>
                      {product.name}
                    </h3>
                    
                    <div className="wishlist-item-price">
                      ₹{product.price}
                    </div>
                    
                    <div className="wishlist-item-stock">
                      {product.countInStock > 0 ? (
                        <span className="in-stock">In Stock</span>
                      ) : (
                        <span className="out-of-stock">Out of Stock</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="wishlist-item-actions">
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.countInStock}
                    >
                      {product.countInStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      aria-label="Remove from wishlist"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist; 