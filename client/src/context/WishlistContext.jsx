import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const isFetching = useRef(false);
  const lastFetchTime = useRef(0);

  // Fetch wishlist only once when user logs in
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated, user?._id]);

  const fetchWishlist = useCallback(async (force = false) => {
    // Prevent multiple simultaneous fetches and rate limit requests
    const now = Date.now();
    if (isFetching.current && !force) return;
    if (now - lastFetchTime.current < 2000 && !force) return;
    
    try {
      // Set fetching flag to prevent duplicate requests
      isFetching.current = true;
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setWishlist([]);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setWishlist(response.data);
      } else {
        setWishlist([]);
      }
      
      lastFetchTime.current = now;
    } catch (error) {
      console.error('Error fetching wishlist:', error.message);
      setWishlist([]);
      showError('Failed to load wishlist');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [showError]);

  const addToWishlist = async (product) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showError('Please log in to add items to your wishlist');
      return false;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/wishlist',
        { productId: product._id },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data) {
        // Update the wishlist state without causing a re-fetch
        setWishlist(prev => [...prev, response.data]);
        showSuccess('Added to your wishlist!');
        return true;
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update state immediately without causing a re-fetch
      setWishlist(prev => 
        prev.filter(item => {
          const itemProductId = item.product?._id || item.product;
          return itemProductId != productId;
        })
      );
      
      return true;
    } catch (error) {
      showError('Failed to remove from wishlist');
      return false;
    }
  };

  const isInWishlist = useCallback((productId) => {
    if (!productId || !wishlist.length) return false;
    return wishlist.some(item => {
      const itemProductId = item.product?._id || item.product;
      return itemProductId == productId;
    });
  }, [wishlist]);

  // Create a stable context value to prevent component re-renders
  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: () => fetchWishlist(true)
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext; 