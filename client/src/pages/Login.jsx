import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Auth.css'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { refetchCart } = useCart()

  // Debug login status
  useEffect(() => {
    console.log("Login component mounted");
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // If already logged in, redirect to home page
    if (user && token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      console.log("Attempting login with:", { email });
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      if (!res.data || !res.data.token) {
        throw new Error('Invalid response from server');
      }
      
      const { user, token } = res.data;
      console.log("Login successful, response:", res.data);
      
      // Ensure user object has consistent ID format
      if (user) {
        if (!user._id && user.id) {
          user._id = user.id;
        }
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Use the login function from AuthContext
        login(user);
        
        // Refresh cart after login
        setTimeout(() => {
          try {
            refetchCart();
          } catch (cartErr) {
            console.error("Error refreshing cart:", cartErr);
          }
        }, 500);
        
        navigate('/');
      } else {
        throw new Error('User data missing in response');
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  )
}

export default Login
