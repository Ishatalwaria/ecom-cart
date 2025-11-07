import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <ErrorBoundary>
            <ToastProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </ToastProvider>
          </ErrorBoundary>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
