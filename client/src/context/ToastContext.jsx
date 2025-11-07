import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

// Create a context for the toast notifications
const ToastContext = createContext();

// Generate a unique ID for each toast
const generateId = () => Math.random().toString(36).substring(2, 9);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to add a new toast
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = generateId();
    const newToast = { id, message, type, duration };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    return id;
  }, []);

  // Function to remove a toast by ID
  const removeToast = useCallback(id => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Shorthand functions for different toast types
  const showSuccess = useCallback((message, duration) => 
    addToast(message, 'success', duration), [addToast]);
    
  const showError = useCallback((message, duration) => 
    addToast(message, 'error', duration), [addToast]);
    
  const showInfo = useCallback((message, duration) => 
    addToast(message, 'info', duration), [addToast]);
    
  const showWarning = useCallback((message, duration) => 
    addToast(message, 'warning', duration), [addToast]);
    
  const showCartNotification = useCallback((message, duration) => 
    addToast(message, 'cart', duration), [addToast]);

  return (
    <ToastContext.Provider 
      value={{ 
        addToast, 
        removeToast, 
        showSuccess, 
        showError, 
        showInfo, 
        showWarning,
        showCartNotification
      }}
    >
      {children}
      
      {/* Render the toast container and all active toasts */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}; 