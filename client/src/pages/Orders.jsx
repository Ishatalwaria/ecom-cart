// Orders.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext'; // Import the custom hook
import './Orders.css';

const Orders = () => {
  const { user } = useUser(); // Access the user context
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      // Fetch orders based on userId
      fetchOrders(user._id);
    }
  }, [user]);

  // Fetch orders by userId
  const fetchOrders = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/user/${userId}`);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully!");
      fetchOrders(user._id); // Refresh orders
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  // Handle order tracking
  const handleTrackOrder = (orderId) => {
    alert(`Tracking for Order ID: ${orderId} coming soon...`);
  };

  if (!user) {
    return <p>Please log in to view your orders</p>; // Display message if no user logged in
  }

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <h5>Order ID: {order._id}</h5>
            <p>Status: {order.status}</p>
            <p>Total: ₹{order.amount}</p>
            <p>Payment Mode: {order.paymentMode}</p>
            <p>Items: {order.products.map(item => (
              <span key={item.productId}>{item.productId.name} (x{item.quantity}), </span>
            ))}</p>
            
            <div className="order-actions">
              <button onClick={() => handleTrackOrder(order._id)}>Track Order</button>
              {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                <button onClick={() => handleCancelOrder(order._id)}>Cancel Order</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
