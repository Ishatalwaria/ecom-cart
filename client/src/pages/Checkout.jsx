import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';  // Use AuthContext instead of UserContext
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();  // Using AuthContext
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
    }
    
    // Pre-fill address if user has one
    if (user && user.address) {
      try {
        // Try to parse the address if it's a JSON string
        const addressObj = typeof user.address === 'string' && user.address.startsWith('{') 
          ? JSON.parse(user.address) 
          : { street: user.address };
        
        setAddress(addressObj.street || addressObj.address || user.address);
      } catch (e) {
        // If parsing fails, just use the address string
        setAddress(user.address);
      }
    }
  }, [user, navigate]);

  // Calculate total amount for the cart
  useEffect(() => {
    const total = cart.reduce((acc, item) => {
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity, 10);
      if (!isNaN(price) && !isNaN(quantity)) {
        return acc + (price * quantity);
      }
      return acc;
    }, 0);
    setTotalAmount(total);
  }, [cart]);

  // Checkout logic
  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please log in to proceed with the checkout');
      setLoading(false);
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token missing. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      const orderData = {
        userId: user._id,
        products: cart.map(item => ({
          productId: item.productId || item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        amount: totalAmount,
        address,
        paymentMode: paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'Pending' : 'Paid',
      };

      console.log('Sending order data:', orderData);

      // Send the order data to the backend with the token
      const response = await axios.post(
        'http://localhost:5000/api/orders', 
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Order placed successfully!');
      
      // Clear the cart after successful order placement
      clearCart();
      
      // Redirect to order confirmation page after a delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.message || 'Error during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="checkout-container not-logged-in">
        <p>Please log in to view your cart and place an order.</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleCheckout}>
        <div className="form-group">
          <label>Delivery Address</label>
          <textarea
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your full delivery address"
            required
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label>Payment Method</label>
          <div className="payment-options">
            <div className="payment-option">
              <input
                type="radio"
                id="cod"
                name="payment"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              <label htmlFor="cod">Cash on Delivery</label>
            </div>
            
            <div className="payment-option">
              <input
                type="radio"
                id="online"
                name="payment"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
              />
              <label htmlFor="online">Online Payment</label>
            </div>
          </div>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <ul className="cart-items">
                {cart.map((item, index) => (
                  <li key={index} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="total-amount">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-success checkout-btn" 
          disabled={loading || cart.length === 0}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
