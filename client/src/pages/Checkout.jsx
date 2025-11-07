import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    phone: '',
    email: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
    }
    
    // Pre-fill address if user has one
    if (user) {
      try {
        // Try to parse the address if it's a JSON string
        let addressObj = {};
        if (user.address && typeof user.address === 'string') {
          if (user.address.startsWith('{')) {
            addressObj = JSON.parse(user.address);
          } else {
            addressObj = { street: user.address };
          }
        }
        
        setFormData({
          address: addressObj.street || '',
          area: addressObj.area || '',
          city: addressObj.city || '',
          state: addressObj.state || '',
          pincode: addressObj.pincode || '',
          country: addressObj.country || '',
          phone: user.phone || '',
          email: user.email || ''
        });
      } catch (e) {
        // If parsing fails, just use the address string
        setFormData(prev => ({
          ...prev,
          address: user.address || '',
          phone: user.phone || '',
          email: user.email || ''
        }));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to get current location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use a reverse geocoding service to get address from coordinates
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          const addressData = response.data.address;
          
          setFormData(prev => ({
            ...prev,
            address: addressData.road || addressData.pedestrian || '',
            area: addressData.suburb || addressData.neighbourhood || '',
            city: addressData.city || addressData.town || addressData.village || '',
            state: addressData.state || '',
            country: addressData.country || '',
            pincode: addressData.postcode || ''
          }));
          
          setGettingLocation(false);
        } catch (err) {
          console.error('Error getting location details:', err);
          setError('Failed to get location details. Please enter manually.');
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(`Error getting location: ${error.message}`);
        setGettingLocation(false);
      }
    );
  };

  // Compose full address from form data parts
  const composeAddress = () => {
    const addressObj = {
      street: formData.address,
      area: formData.area,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode
    };
    
    // Store as JSON string to maintain structure
    return JSON.stringify(addressObj);
  };

  // Get formatted address for display and database
  const getFormattedAddress = () => {
    return [
      formData.address,
      formData.area,
      formData.city,
      formData.state,
      formData.pincode,
      formData.country
    ].filter(Boolean).join(', ');
  };

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

    // Validate phone
    if (!formData.phone) {
      setError('Please provide a contact phone number');
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
        address: getFormattedAddress(),
        paymentMode: paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'Pending' : 'Paid',
        contactPhone: formData.phone,
        contactEmail: formData.email
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
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Phone Number*</label>
              <input
                type="tel"
                className="form-control"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your contact number"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Delivery Address</h3>
          <div className="location-btn-container mb-3">
            <button 
              type="button" 
              className="btn btn-outline-primary"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Getting Location...
                </>
              ) : (
                <>
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  Use Current Location
                </>
              )}
            </button>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Street Address*</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, house number"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Area/Locality</label>
            <input
              type="text"
              className="form-control"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Area, locality, landmark"
            />
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">City*</label>
              <input
                type="text"
                className="form-control"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Pincode*</label>
              <input
                type="text"
                className="form-control"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode/ZIP"
                required
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State/Province"
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-control"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Payment Method</h3>
          <div className="payment-options mb-3">
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="cod"
                name="payment"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              <label className="form-check-label" htmlFor="cod">Cash on Delivery</label>
            </div>
            
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="online"
                name="payment"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
              />
              <label className="form-check-label" htmlFor="online">Online Payment</label>
            </div>
          </div>
        </div>

        <div className="order-summary form-section">
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
          className="btn btn-success checkout-btn mt-3" 
          disabled={loading || cart.length === 0}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
