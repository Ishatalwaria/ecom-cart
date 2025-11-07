// Orders.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Use AuthContext
import './Orders.css';

const Orders = () => {
  const { user, loading } = useAuth(); // Access the auth context
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id: orderId } = useParams(); // Get order ID from URL if viewing single order
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait until auth loading is complete
    
    if (user) {
      if (orderId) {
        // Fetch single order if orderId is in URL
        fetchSingleOrder(orderId);
      } else {
        // Fetch all orders based on userId
        fetchOrders(user._id);
      }
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [user, loading, navigate, orderId]);

  // Fetch single order by orderId
  const fetchSingleOrder = async (id) => {
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
        `http://localhost:5000/api/orders/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        setSelectedOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setIsLoading(false);
    }
  };

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
  const handleCancelOrder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please login again.');
        return;
      }
      
      await axios.put(
        `http://localhost:5000/api/orders/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setError('');
      // Show success message
      if (orderId) {
        // If viewing single order, update the selected order
        fetchSingleOrder(id);
      } else {
        // If viewing order list, update the order in the list
        setOrders(orders.map(order => 
          order._id === id 
            ? { ...order, status: 'Cancelled' } 
            : order
        ));
      }
      
      // Refresh orders after a short delay
      setTimeout(() => {
        if (orderId) {
          fetchSingleOrder(id);
        } else {
          fetchOrders(user._id);
        }
      }, 1000);
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Handle order tracking
  const handleTrackOrder = async (id) => {
    try {
      setTrackingInfo(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication error. Please login again.');
        return;
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/orders/${id}/track`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Show tracking info in modal
      setTrackingInfo(response.data);
      setShowTrackingModal(true);
    } catch (error) {
      console.error('Error tracking order:', error);
      setError(error.response?.data?.message || 'Failed to track order');
    }
  };

  // Close tracking modal
  const closeTrackingModal = () => {
    setShowTrackingModal(false);
  };

  // Tracking Modal Component
  const TrackingModal = ({ show, onClose, trackingInfo }) => {
    if (!show || !trackingInfo) return null;

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    };

    return (
      <div className="tracking-modal-overlay" onClick={onClose}>
        <div className="tracking-modal" onClick={e => e.stopPropagation()}>
          <div className="tracking-modal-header">
            <h3>Order Tracking</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          
          <div className="tracking-modal-body">
            <div className="tracking-overview">
              <div className="tracking-detail">
                <strong>Order ID:</strong> {trackingInfo.orderId}
              </div>
              <div className="tracking-detail">
                <strong>Status:</strong> 
                <span className={`badge status-${trackingInfo.status?.toLowerCase() || 'pending'}`}>
                  {trackingInfo.status}
                </span>
              </div>
              <div className="tracking-detail">
                <strong>Order Date:</strong> {formatDate(trackingInfo.orderDate)}
              </div>
              <div className="tracking-detail">
                <strong>Estimated Delivery:</strong> {formatDate(trackingInfo.estimatedDelivery)}
              </div>
              <div className="tracking-detail">
                <strong>Tracking Number:</strong> {trackingInfo.trackingNumber}
              </div>
              <div className="tracking-detail">
                <strong>Delivery Partner:</strong> {trackingInfo.deliveryPartner}
              </div>
              <div className="tracking-detail">
                <strong>Payment Status:</strong> {trackingInfo.paymentStatus}
              </div>
              <div className="tracking-detail">
                <strong>Current Location:</strong> {trackingInfo.currentLocation}
              </div>
            </div>
            
            <div className="tracking-timeline">
              <h4>Tracking History</h4>
              {trackingInfo.trackingHistory && trackingInfo.trackingHistory.length > 0 ? (
                <div className="timeline">
                  {trackingInfo.trackingHistory.map((item, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-icon">
                        <div className={`icon status-${item.status?.toLowerCase() || 'pending'}`}></div>
                      </div>
                      <div className="timeline-content">
                        <h5>{item.status}</h5>
                        <p>{item.description}</p>
                        <div className="timeline-details">
                          <span>{formatDate(item.timestamp)}</span>
                          {item.location && <span> • {item.location}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-tracking">No tracking history available yet</p>
              )}
            </div>
          </div>
          
          <div className="tracking-modal-footer">
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderDetails = (order) => {
    return (
      <div className="order-detail-page">
        <div className="order-detail-header">
          <h3>Order Details</h3>
          <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>
        
        <div className="order-detail-card">
          <div className="order-detail-section">
            <h4>Order Information</h4>
            <div className="order-detail-info">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className={`badge status-${order.status?.toLowerCase() || 'pending'}`}>{order.status || 'Pending'}</span></p>
              <p><strong>Total Amount:</strong> ₹{order.amount || order.totalPrice}</p>
              <p><strong>Payment Method:</strong> {order.paymentMode || 'COD'}</p>
              <p><strong>Payment Status:</strong> {order.paymentStatus || 'Pending'}</p>
            </div>
          </div>
          
          <div className="order-detail-section">
            <h4>Shipping Information</h4>
            <div className="order-detail-info">
              <p><strong>Shipping Address:</strong> {order.address}</p>
              <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Processing'}</p>
            </div>
          </div>
          
          <div className="order-detail-section">
            <h4>Products</h4>
            <div className="order-detail-products">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name || `Product ID: ${item.productId}`}</td>
                      <td>₹{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                  <tr className="order-total-row">
                    <td colSpan="3"><strong>Total</strong></td>
                    <td><strong>₹{order.amount || order.totalPrice}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="order-detail-actions">
            <button 
              className="btn btn-info"
              onClick={() => handleTrackOrder(order._id)}
            >
              Track Order
            </button>
            
            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
              <button 
                className="btn btn-danger"
                onClick={() => handleCancelOrder(order._id)}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    );
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

  // If viewing a single order
  if (orderId && selectedOrder) {
    return (
      <div className="orders-container">
        {error && <div className="alert alert-danger">{error}</div>}
        {renderOrderDetails(selectedOrder)}
      </div>
    );
  }

  // If viewing the order list
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
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  View Details
                </button>
                
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
      
      {/* Add the tracking modal */}
      <TrackingModal 
        show={showTrackingModal} 
        onClose={closeTrackingModal} 
        trackingInfo={trackingInfo} 
      />
    </div>
  );
};

export default Orders;
