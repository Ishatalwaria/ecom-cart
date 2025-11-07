// Orders.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Use AuthContext
import './Orders.css';

const Orders = () => {
  const { user, loading } = useAuth(); // Access the auth context
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait until auth loading is complete
    
    if (user) {
      // Fetch orders based on userId
      fetchOrders(user._id);
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch orders by userId
  const fetchOrders = async (userId) => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/orders/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please login again.');
        return;
      }
      
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setError('');
      // Show success message
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: 'Cancelled' } 
          : order
      ));
      
      // Refresh orders after a short delay
      setTimeout(() => fetchOrders(user._id), 1000);
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Handle order tracking
  const handleTrackOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please login again.');
        return;
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/orders/${orderId}/track`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Show tracking info
      alert(`Order Status: ${response.data.status}\nEstimated Delivery: ${response.data.estimatedDelivery}`);
    } catch (error) {
      console.error('Error tracking order:', error);
      setError(error.response?.data?.message || 'Failed to track order');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="orders-container loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="orders-container not-logged-in">
        <p>Please log in to view your orders</p>
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
    <div className="orders-container">
      <h2>Your Orders</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/')}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order #{order._id.substring(0, 8)}</span>
                <span className={`order-status status-${order.status?.toLowerCase() || 'pending'}`}>
                  {order.status || 'Pending'}
                </span>
              </div>
              
              <div className="order-details">
                <p className="order-date">
                  <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="order-total">
                  <strong>Total:</strong> ₹{order.amount || order.totalPrice}
                </p>
                <p className="order-payment">
                  <strong>Payment:</strong> {order.paymentMode || 'COD'} 
                  ({order.paymentStatus || 'Pending'})
                </p>
                <p className="order-address">
                  <strong>Shipping Address:</strong> {order.address}
                </p>
              </div>
              
              <div className="order-items">
                <h5>Items</h5>
                <ul>
                  {order.products.map((item, index) => (
                    <li key={index}>
                      {item.name || `Product ID: ${item.productId}`} 
                      (x{item.quantity}) - 
                      ₹{item.price ? item.price * item.quantity : 'N/A'}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="order-actions">
                <button 
                  className="btn btn-info btn-sm"
                  onClick={() => handleTrackOrder(order._id)}
                >
                  Track Order
                </button>
                
                {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
