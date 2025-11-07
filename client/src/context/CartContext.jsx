import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "./AuthContext";
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Debug user object to see what's available
  useEffect(() => {
    console.log("AUTH USER DATA:", user);
  }, [user]);
  
  // Get userId directly from localStorage if not available from context
  const getUserId = () => {
    // Try from auth context first
    if (user && user._id) {
      console.log("Using user ID from auth context:", user._id);
      return user._id;
    }
    
    if (user && user.id) {
      console.log("Using user.id from auth context:", user.id);
      return user.id;
    }
    
    // Direct check of localStorage for userId (often set during login)
    const directUserId = localStorage.getItem('userId');
    if (directUserId) {
      console.log("Found direct userId in localStorage:", directUserId);
      return directUserId;
    }
    
    // Fallback to user object in localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Using localStorage user:", parsedUser);
        
        // Try different ID formats
        if (parsedUser._id) {
          console.log("Found _id in localStorage:", parsedUser._id);
          return parsedUser._id;
        }
        
        if (parsedUser.id) {
          console.log("Found id in localStorage:", parsedUser.id);
          return parsedUser.id;
        }
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }
    
    console.error("COULD NOT FIND USER ID IN ANY LOCATION");
    return null;
  };
  
  // Debug user ID
  useEffect(() => {
    const id = getUserId();
    console.log("User ID from getUserId:", id);
  }, [user]);

  const fetchCart = async () => {
    const currentUserId = getUserId();
    
    if (!currentUserId) {
      console.warn("User ID not found for fetching cart.");
      setError("Please log in to view your cart");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching cart for user:", currentUserId);
      
      const res = await axios.get(`http://localhost:5000/api/cart/${currentUserId}`);
      console.log("Cart response:", res.data);
      
      if (!res.data || !res.data.products) {
        console.error("Invalid cart data format:", res.data);
        setCart([]);
        return;
      }
      
      // With the updated model, we can just use the product details directly
      setCart(res.data.products.map(item => ({
        _id: item.productId, // Keep _id as the productId for consistency
        name: item.name,
        brand: item.brand,
        category: item.category,
        price: item.price,
        description: item.description,
        image: item.image,
        quantity: item.quantity
      })));
    } catch (error) {
      console.error("Fetch cart failed:", error);
      setError("Failed to fetch cart. Please try again.");
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    const currentUserId = getUserId();
    
    if (!currentUserId) {
      console.error("User ID missing while adding to cart");
      setError("You must be logged in to add items to cart");
      return;
    }

    if (!product || !product._id) {
      console.error("Invalid product object:", product);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Adding to cart:", { userId: currentUserId, productId: product._id });
      
      // First, check if the product is already in the cart
      const existingProduct = cart.find(item => item._id === product._id);
      const quantity = existingProduct ? existingProduct.quantity + 1 : 1;
      
      const response = await axios.post("http://localhost:5000/api/cart/add", {
        userId: currentUserId,
        productId: product._id,
        quantity: quantity
      });
      
      console.log("Add to cart response:", response.data);
      
      // Update the local cart immediately for better UX
      if (existingProduct) {
        // Update existing item
        setCart(prevCart => 
          prevCart.map(item => 
            item._id === product._id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          )
        );
      } else {
        // Add new item
        setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
      }
      
      // Then refresh from server to ensure consistency
      fetchCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const currentUserId = getUserId();
    
    if (!currentUserId) {
      console.error("User ID missing while updating quantity");
      setError("You must be logged in to update items");
      return;
    }
    
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Updating quantity:", { userId: currentUserId, productId, quantity });
      
      // Update locally first for better UX
      setCart(prevCart => 
        prevCart.map(item => 
          item._id === productId 
            ? { ...item, quantity } 
            : item
        )
      );
      
      // Important: Use the updated cart endpoint with the exact quantity (not increment)
      const response = await axios.post("http://localhost:5000/api/cart/add", {
        userId: currentUserId,
        productId,
        quantity // This should REPLACE the quantity, not add to it
      });
      
      console.log("Update quantity response:", response.data);
      
      // Refetch cart from server to ensure consistency
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update item quantity");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    const currentUserId = getUserId();
    
    if (!currentUserId) {
      console.error("User ID missing while removing from cart");
      setError("You must be logged in to remove items");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Removing from cart:", { userId: currentUserId, productId });
      
      // Update locally first for better UX
      setCart(prevCart => prevCart.filter(item => item._id !== productId));
      
      const response = await axios.delete("http://localhost:5000/api/cart/remove", {
        data: { userId: currentUserId, productId }
      });
      
      console.log("Remove from cart response:", response.data);
      
      // Refetch cart from server to ensure consistency
      fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError("Failed to remove item from cart");
      // Revert optimistic update on error
      fetchCart();
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    const currentUserId = getUserId();
    
    if (!currentUserId) {
      console.error("User ID missing while clearing cart");
      setError("You must be logged in to clear cart");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Clearing cart for user:", currentUserId);
      
      // Clear locally first for better UX
      setCart([]);
      
      const response = await axios.post("http://localhost:5000/api/cart/clear", { 
        userId: currentUserId 
      });
      
      console.log("Clear cart response:", response.data);
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Failed to clear cart");
      // Revert optimistic update on error
      fetchCart();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUserId = getUserId();
    console.log("Current user ID for cart:", currentUserId);
    
    if (currentUserId) {
      console.log("User ID available, fetching cart for:", currentUserId);
      fetchCart();
    } else {
      console.log("No user ID available, cart will be empty");
      setCart([]);
    }
  }, [user]); // Only depend on user object to avoid excessive fetching

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        loading,
        error,
        userId: getUserId(), // Expose userId for debugging
        refetchCart: fetchCart // Allow manual refresh of cart data
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
