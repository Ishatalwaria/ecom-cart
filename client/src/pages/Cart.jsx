import React from 'react';
import { useCart } from '../context/CartContext';
import './cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
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
            <button className="clear" onClick={clearCart}>Clear Cart</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
