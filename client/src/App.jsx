import React from 'react'
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductDetail from './pages/ProductDetail'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Navbar from './components/Navbar'
import Orders from './pages/Orders'
import Checkout from './pages/Checkout'
import PrivateRoute from './components/PrivateRoute'
const App = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
    <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
    <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
    <Route path="/product/:id" element={<ProductDetail />} />  
    
  </Routes>

    </>
  );
};

export default App
