import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      const res = await axios.post('https://shop-mate-ecommerce.onrender.com/api/auth/register', {
        name,
        email,
        password
      });

      // The register endpoint only returns a success message, not user data
      console.log("Registration successful:", res.data.message);
      setSuccess('Registration successful! Redirecting to login...');
      
      // Wait 2 seconds before redirecting to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  }

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
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
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  )
}

export default Register
