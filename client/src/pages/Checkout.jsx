import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';  // To access user context
import { useCart } from '../context/CartContext';  // To access cart context

const Checkout = () => {
  const { user } = useUser();  // Accessing the logged-in user
  const { cartItems, clearCart } = useCart();  // Accessing cart data
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate total amount for the cart
  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalAmount(total);
  }, [cartItems]);

  // Checkout logic
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to proceed with the checkout');
      return;
    }

    try {
      const orderData = {
        userId: user._id,
        products: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        amount: totalAmount,
        address,
        paymentMode: paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'Pending' : 'Paid',
      };

      // Send the order data to the backend
      const response = await axios.post('http://localhost:5000/api/orders', orderData);

      // Clear the cart after successful order placement
      clearCart();

      alert('Order placed successfully!');
    } catch (error) {
      alert('Error during checkout');
    }
  };

  if (!user) {
    return <p>Please log in to view your cart and place an order.</p>;
  }

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>
      <form onSubmit={handleCheckout}>
        <div className="mb-3">
          <label>Address</label>
          <input
            type="text"
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Payment Method</label>
          <select
            className="form-control"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="COD">Cash on Delivery</option>
            <option value="online">Online Payment</option>
          </select>
        </div>

        <div className="mb-3">
          <h5>Order Summary</h5>
          <ul>
            {cartItems.map((item) => (
              <li key={item._id}>
                {item.name} (x{item.quantity}) - ₹{item.price * item.quantity}
              </li>
            ))}
          </ul>
          <p>Total Amount: ₹{totalAmount}</p>
        </div>

        <button className="btn btn-success">Place Order</button>
      </form>
    </div>
  );
};

export default Checkout;
