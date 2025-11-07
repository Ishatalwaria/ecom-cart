import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    area: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      console.log("Profile component loaded with user:", user._id);
      // Extract address parts from existing address if available
      const addressParts = parseAddress(user.address || '');
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: addressParts.street || '',
        city: addressParts.city || '',
        state: addressParts.state || '',
        country: addressParts.country || '',
        pincode: addressParts.pincode || '',
        area: addressParts.area || ''
      });
      fetchOrders();
    } else if (!loading) {
      console.log("No user found, redirecting to login");
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Helper function to parse address string into components
  const parseAddress = (addressStr) => {
    // This is a simple parser that tries to extract common address patterns
    const parts = {};
    
    try {
      // Attempt to parse if it's in JSON format (we'll store it this way)
      const parsedAddress = JSON.parse(addressStr);
      return parsedAddress;
    } catch (e) {
      // If not JSON, try to parse manually
      // Extract pincode (assuming it's 6 digits)
      const pincodeMatch = addressStr.match(/\b(\d{6})\b/);
      if (pincodeMatch) parts.pincode = pincodeMatch[1];
      
      // Very simple parsing - not meant to be comprehensive
      if (addressStr.includes(',')) {
        const segments = addressStr.split(',').map(s => s.trim());
        if (segments.length >= 3) {
          parts.street = segments[0];
          parts.area = segments[1];
          parts.city = segments[2];
          
          if (segments.length >= 4) parts.state = segments[3];
          if (segments.length >= 5) parts.country = segments[4];
        } else {
          parts.street = addressStr;
        }
      } else {
        parts.street = addressStr;
      }
      
      return parts;
    }
  };

  // Function to compose full address from parts
  const composeAddress = () => {
    const addressObj = {
      street: formData.address,
      area: formData.area,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode
    };
    
    // Store as JSON string to maintain structure
    return JSON.stringify(addressObj);
  };

  const fetchOrders = async () => {
    if (!user || !user._id) return;

    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No auth token found");
        setError("Authentication error. Please login again.");
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      console.log("Fetching orders for user:", user._id);
      const res = await axios.get(`http://localhost:5000/api/orders/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Orders fetched:", res.data.length);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError("Failed to load orders. " + (err.response?.data?.message || ""));
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use a reverse geocoding service to get address from coordinates
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          const addressData = response.data.address;
          
          setFormData(prev => ({
            ...prev,
            address: addressData.road || addressData.pedestrian || '',
            area: addressData.suburb || addressData.neighbourhood || '',
            city: addressData.city || addressData.town || addressData.village || '',
            state: addressData.state || '',
            country: addressData.country || '',
            pincode: addressData.postcode || ''
          }));
          
          setGettingLocation(false);
        } catch (err) {
          console.error('Error getting location details:', err);
          setError('Failed to get location details. Please enter manually.');
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(`Error getting location: ${error.message}`);
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Create a copy of form data with the formatted address
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: composeAddress()
      };
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication error. Please login again.");
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      // Ensure we have a valid user ID
      if (!user || !user._id) {
        console.error("User ID missing in profile data");
        setError("User data invalid. Please log in again.");
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      // Convert to string to ensure proper format
      const userId = user._id.toString();
      console.log("Updating profile for user:", userId);
      console.log("Profile update data:", userData);
      
      const res = await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Profile update response:", res.data);
      
      // Update both the auth context and localStorage
      const updatedUser = { ...user, ...res.data };
      login(updatedUser);
      
      // Make sure localStorage has the updated user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Update profile error:', err);
      if (err.response && err.response.status === 404) {
        // Specific error for user not found
        setError('User profile not found. Please try logging in again.');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
      } else if (err.response && err.response.status === 400) {
        // Handle specific validation errors
        setError(err.response.data.message || 'Validation error. Please check your inputs.');
      } else {
        setError('Failed to update profile. Please try again later.');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format address for display
  const formatAddressForDisplay = (addressStr) => {
    try {
      const address = JSON.parse(addressStr);
      return [
        address.street,
        address.area,
        address.city,
        address.state,
        address.country,
        address.pincode
      ].filter(Boolean).join(', ');
    } catch (e) {
      return addressStr || 'Not set';
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="not-logged-in">
          <h2>You are not logged in</h2>
          <p>Please log in to view your profile</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <div className="profile-actions">
          <button 
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`} 
            onClick={handleEditToggle}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="profile-card">
            <h3>Personal Information</h3>
            
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <h4 className="address-heading">Address Information</h4>
                <div className="location-btn-container">
                  <button 
                    type="button" 
                    className="btn btn-outline-primary mb-3 location-btn"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-geo-alt-fill me-2"></i>
                        Use Current Location
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="area" className="form-label">Area/Locality</label>
                  <input
                    type="text"
                    className="form-control"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="pincode" className="form-label">Pincode</label>
                    <input
                      type="text"
                      className="form-control"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="state" className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="country" className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn btn-success w-100">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="profile-info">
                <p><strong>Name:</strong> {user.name || 'Not set'}</p>
                <p><strong>Email:</strong> {user.email || 'Not set'}</p>
                <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
                <div className="address-section">
                  <h4>Address</h4>
                  <p>{formatAddressForDisplay(user.address) || 'Not set'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="profile-card">
            <h3>Order History</h3>
            {loadingOrders ? (
              <div className="text-center">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading your orders...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="order-list">
                {orders.map(order => (
                  <div key={order._id} className="order-item">
                    <div className="order-header">
                      <div className="order-id">Order #{order._id.substring(0, 8)}</div>
                      <div className={`order-status status-${order.status?.toLowerCase() || 'pending'}`}>
                        {order.status || 'Pending'}
                      </div>
                    </div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="order-amount">₹{order.amount || order.totalPrice}</div>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-orders">
                <p>You haven't placed any orders yet.</p>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/')}
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 