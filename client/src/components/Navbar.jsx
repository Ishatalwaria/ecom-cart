import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Calculate total items in cart - only when user is authenticated
  const totalItems = user ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-store"></i>
         ShopMate
        </Link>
        
        <button 
          className="navbar-toggler"
          type="button" 
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                onClick={closeMenu}
              >
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
            </li>
            
            {user ? (
              <>
                <li className="nav-item">
                  <Link 
                    to="/orders" 
                    className={`nav-link ${isActive('/orders') ? 'active' : ''}`} 
                    onClick={closeMenu}
                  >
                    <i className="fas fa-box"></i>
                    <span>Orders</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/cart" 
                    className={`nav-link ${isActive('/cart') ? 'active' : ''}`} 
                    onClick={closeMenu}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    <span>Cart</span>
                    {totalItems > 0 && (
                      <span className="cart-badge">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/profile" 
                    className={`nav-link ${isActive('/profile') ? 'active' : ''}`} 
                    onClick={closeMenu}
                  >
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                  </Link>
                </li>
                {user.isAdmin && (
                  <li className="nav-item">
                    <Link 
                      to="/admin" 
                      className={`nav-link ${isActive('/admin') ? 'active' : ''}`} 
                      onClick={closeMenu}
                    >
                      <i className="fas fa-cog"></i>
                      <span>Admin</span>
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link 
                    to="#" 
                    className="nav-link logout-link" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                      closeMenu();
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link 
                    to="/login" 
                    className={`nav-link ${isActive('/login') ? 'active' : ''}`} 
                    onClick={closeMenu}
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/register" 
                    className={`nav-link ${isActive('/register') ? 'active' : ''}`} 
                    onClick={closeMenu}
                  >
                    <i className="fas fa-user-plus"></i>
                    <span>Register</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
