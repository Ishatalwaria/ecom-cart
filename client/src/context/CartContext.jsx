import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError, showCartNotification } = useToast();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Debug user object to see what's available
  useEffect(() => {
    console.log("AUTH USER DATA:", user);
  }, [user]);
  
  // Get authentication token
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };
  
  // Get userId from auth context or localStorage
  const getUserId = () => {
    // Try from auth context first
    if (user && user._id) {
      return user._id.toString();
    }
    
    if (user && user.id) {
      return user.id.toString();
    }
    
    // Fallback to user object in localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        // Try different ID formats
        if (parsedUser._id) {
          return parsedUser._id.toString();
        }
        
        if (parsedUser.id) {
          return parsedUser.id.toString();
        }
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }
    
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
      console.log("User not authenticated, skipping cart fetch");
      setCart([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`https://shop-mate-ecommerce.onrender.com/api/cart/${currentUserId}`, {
        headers: getAuthHeader()
      });
      
      console.log("Cart fetched successfully:", res.data);
      
      if (!res.data || !res.data.products) {
        setCart([]);
        return;
      }
      
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
      setError("Failed to fetch cart");
      showError("Unable to load your cart. Please try again.");
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
      showError("Please log in to add items to your cart");
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
      
      const response = await axios.post("https://shop-mate-ecommerce.onrender.com/api/cart/add", 
        {
          userId: currentUserId,
          productId: product._id,
          quantity: quantity
        },
        { 
          headers: getAuthHeader() 
        }
      );
      
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
        showCartNotification(`${product.name} quantity updated (${quantity}) in cart`);
      } else {
        // Add new item
        setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
        showCartNotification(`${product.name} added to your cart!`);
      }
      
      // Then refresh from server to ensure consistency
      fetchCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add item to cart");
      showError("Failed to add item to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const currentUserId = getUserId();
    
    if (!currentUserId) {
      console.error("User ID missing while updating quantity");
      setError("You must be logged in to update items");
      showError("Please log in to update your cart");
      return;
    }
    
    // Find the product name for the notification
    const product = cart.find(item => item._id === productId);
    const productName = product ? product.name : 'Item';
    
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
      const response = await axios.post("https://shop-mate-ecommerce.onrender.com/api/cart/add", 
        {
          userId: currentUserId,
          productId,
          quantity // This should REPLACE the quantity, not add to it
        },
        { 
          headers: getAuthHeader() 
        }
      );
      
      console.log("Update quantity response:", response.data);
      showSuccess(`Updated ${productName} quantity to ${quantity}`);
      
      // Refetch cart from server to ensure consistency
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update item quantity");
      showError("Failed to update quantity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    const currentUserId = getUserId();
    
    if (!currentUserId) {
      console.error("User ID missing while removing from cart");
      setError("You must be logged in to remove items");
      showError("Please log in to update your cart");
      return;
    }
    
    // Find the product name for the notification
    const product = cart.find(item => item._id === productId);
    const productName = product ? product.name : 'Item';
    
    try {
      setLoading(true);
      setError(null);
      console.log("Removing from cart:", { userId: currentUserId, productId });
      
      // Update locally first for better UX
      setCart(prevCart => prevCart.filter(item => item._id !== productId));
      
      const response = await axios.delete("https://shop-mate-ecommerce.onrender.com/api/cart/remove", {
        headers: getAuthHeader(),
        data: { userId: currentUserId, productId }
      });
      
      console.log("Remove from cart response:", response.data);
      showSuccess(`${productName} removed from cart`);
      
      // Refetch cart from server to ensure consistency
      fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError("Failed to remove item from cart");
      showError("Failed to remove item. Please try again.");
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
      showError("Please log in to clear your cart");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Clearing cart for user:", currentUserId);
      
      // Clear locally first for better UX
      setCart([]);
      
      const response = await axios.post(
        "https://shop-mate-ecommerce.onrender.com/api/cart/clear", 
        { userId: currentUserId },
        { headers: getAuthHeader() }
      );
      
      console.log("Clear cart response:", response.data);
      showSuccess("Your cart has been cleared");
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Failed to clear cart");
      showError("Failed to clear cart. Please try again.");
      // Revert optimistic update on error
      fetchCart();
    } finally {
      setLoading(false);
    }
  };

  // Update effect to wait for authentication to complete and run only when needed
  useEffect(() => {
    // Skip if auth is still loading
    if (authLoading) {
      return;
    }
    
    const currentUserId = getUserId();
    if (currentUserId) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user, authLoading]); // Add authLoading as dependency

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
