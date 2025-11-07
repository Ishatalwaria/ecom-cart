// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadStoredUser = async () => {
      setLoading(true);
      try {
        // Try to get token - if no token, user is not authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No token found, user is not authenticated");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Try to verify token with the server
        try {
          const response = await axios.get('http://localhost:5000/api/auth/verify-token', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.isValid) {
            console.log("Token verified with server, user is authenticated");
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            console.log("Token is invalid according to server");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }
        } catch (verifyError) {
          console.error("Error verifying token:", verifyError);
          // Token verification failed, consider token invalid
          setIsAuthenticated(false);
        }
        
        // Try to get user from localStorage as fallback
        const storedUser = localStorage.getItem('user');
        
        if (storedUser && !user) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Loaded user from localStorage");
            
            // Make sure user has the required ID property
            if (!parsedUser._id && parsedUser.id) {
              parsedUser._id = parsedUser.id; // Ensure _id is available
            }
            
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            // Invalid user data, clear it
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadStoredUser();
  }, []);

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token to verify");
        return false;
      }

      const response = await axios.get('http://localhost:5000/api/auth/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.isValid) {
        if (!user) {
          setUser(response.data.user);
        }
        setIsAuthenticated(true);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
      return false;
    }
  };

  const login = (userData) => {
    if (!userData) {
      console.error("Attempted to login with null/undefined user data");
      return;
    }
    
    // Create a consistent user object
    const normalizedUser = {
      ...userData
    };
    
    // Ensure user data has consistent ID format
    if (!normalizedUser._id && normalizedUser.id) {
      normalizedUser._id = normalizedUser.id;
      console.log("Added _id from id property");
    } else if (!normalizedUser.id && normalizedUser._id) {
      normalizedUser.id = normalizedUser._id;
      console.log("Added id from _id property");
    }
    
    // Ensure IDs are strings
    if (normalizedUser._id) {
      normalizedUser._id = normalizedUser._id.toString();
    }
    if (normalizedUser.id) {
      normalizedUser.id = normalizedUser.id.toString();
    }
    
    console.log("Setting user in context:", normalizedUser);
    setUser(normalizedUser);
    setIsAuthenticated(true);
    
    try {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } catch (error) {
      console.error("Error storing user in localStorage:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// 👇 Define useAuth below the provider, not before
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
