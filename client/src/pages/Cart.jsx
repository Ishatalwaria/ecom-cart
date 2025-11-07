import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading, error, userId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    console.log("Cart component - User data:", user);
    console.log("Cart component - UserId from context:", userId);
  }, [user, userId]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <div className="cart-container"><p>Loading your cart...</p></div>;
  }

  if (error) {
    return (
      <div className="cart-container">
        <p className="error-message">{error}</p>
        <p>Debug: User ID = {userId || 'Not found'}</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="continue-shopping" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {cart.map(item => (
            <div className="cart-item" key={item._id}>
              <img src={item.image} alt={item.name} />
              <div className="details">
                <h3>{item.name}</h3>
                <p>Price: ₹{item.price}</p>
                <div className="qty-controls">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
                <button className="remove" onClick={() => removeFromCart(item._id)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <h3>Total: ₹{total}</h3>
            <div className="cart-actions">
              <button className="clear" onClick={clearCart}>Clear Cart</button>
              <button className="continue-shopping" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
              <button className="checkout" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
