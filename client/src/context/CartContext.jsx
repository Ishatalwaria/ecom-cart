import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "./AuthContext";
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  
  const userId = user?._id;
  
  const fetchCart = async () => {
    if (!userId) {
      console.warn("User ID not found for fetching cart.");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      setCart(res.data.products.map(item => ({
        ...item.productId,
        quantity: item.quantity
      })));
    } catch (error) {
      console.error("Fetch cart failed:", error);
    }
  };

  const addToCart = async (product) => {
    
    if (!userId) {
      console.error("User ID missing while adding to cart");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/cart/add", {
        userId:userId,
        productId: product._id,
        quantity: 1
      });
      fetchCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.post("http://localhost:5000/api/cart/add", {
        userId,
        productId,
        quantity
      });
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete("http://localhost:5000/api/cart/remove", {
        data: { userId, productId }
      });
      fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const clearCart = async () => {
    try {
      await axios.post("http://localhost:5000/api/cart/clear", { userId });
      setCart([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
