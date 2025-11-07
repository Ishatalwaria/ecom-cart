// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredUser = () => {
      setLoading(true);
      try {
        // Try to get token - if no token, user is not authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No token found, user is not authenticated");
          setLoading(false);
          return;
        }
        
        // Try to get user from localStorage
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Loaded user from localStorage");
            
            // Make sure user has the required ID property
            if (!parsedUser._id && parsedUser.id) {
              parsedUser._id = parsedUser.id; // Ensure _id is available
            }
            
            setUser(parsedUser);
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            // Invalid user data, clear it
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStoredUser();
  }, []);

  const login = (userData) => {
    if (!userData) {
      console.error("Attempted to login with null/undefined user data");
      return;
    }
    
    // Ensure user data has consistent ID format
    if (!userData._id && userData.id) {
      userData._id = userData.id;
    }
    
    console.log("Setting user in context:", userData);
    setUser(userData);
    
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("Error storing user in localStorage:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
