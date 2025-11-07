import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import './Admin.css';
import { getImageUrl } from '../utils/imageUtils';

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    countInStock: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      if (!user.isAdmin) {
        // Redirect non-admin users
        showError("Access denied. Admin privileges required.");
        navigate('/');
        return;
      }
      fetchData();
    } else if (!loading) {
      navigate('/login');
    }
  }, [user, loading, navigate, activeTab, showError]);

  const fetchData = () => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://shop-mate-ecommerce.onrender.com/api/products');
      setProducts(response.data);
    } catch (err) {
      showError('Failed to fetch products: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://shop-mate-ecommerce.onrender.com/api/admin/orders',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(response.data);
    } catch (err) {
      showError('Failed to fetch orders: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://shop-mate-ecommerce.onrender.com/api/admin/users',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response.data);
    } catch (err) {
      showError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm({
      ...productForm,
      [name]: value
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      category: '',
      image: '',
      countInStock: '',
      _previewImage: null,
      cloudinary_id: null
    });
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      image: product.image || '',
      countInStock: product.countInStock || 0,
      cloudinary_id: product.cloudinary_id || null
    });
    setIsEditing(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://shop-mate-ecommerce.onrender.com/api/admin/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      showError('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        countInStock: parseInt(productForm.countInStock),
        // Include cloudinary_id if it exists
        cloudinary_id: productForm.cloudinary_id || null
      };
      
      if (isEditing && selectedProduct) {
        // Update existing product
        await axios.put(
          `https://shop-mate-ecommerce.onrender.com/api/admin/products/${selectedProduct._id}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showSuccess('Product updated successfully');
      } else {
        // Create new product - Use admin endpoint instead of regular products endpoint
        await axios.post(
          'https://shop-mate-ecommerce.onrender.com/api/admin/products',
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showSuccess('Product created successfully');
      }
      
      resetProductForm();
      fetchProducts();
    } catch (err) {
      showError('Failed to save product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://shop-mate-ecommerce.onrender.com/api/admin/orders/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess(`Order ${orderId.substring(0, 8)} updated to ${status}`);
      fetchOrders();
    } catch (err) {
      showError('Failed to update order: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        // This will show a local preview while the image is being uploaded
        setProductForm({
          ...productForm,
          _previewImage: reader.result // Use a temporary preview
        });
      };
      reader.readAsDataURL(file);
      
      // Upload the image to the server
      uploadImage(file);
    }
  };
  
  const uploadImage = async (file) => {
    setIsLoading(true);
    showInfo('Uploading image...');
    
    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('token');
      
      // Upload the image to Cloudinary via our server endpoint
      const response = await axios.post(
        'https://shop-mate-ecommerce.onrender.com/api/products/upload',
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      
      // Update the product form with the image URL and Cloudinary ID returned from server
      if (response.data && response.data.imagePath) {
        setProductForm({
          ...productForm,
          image: response.data.imagePath,
          cloudinary_id: response.data.public_id, // Store Cloudinary ID
          _previewImage: null // Clear preview as we have the real URL now
        });
        showSuccess('Image uploaded successfully to Cloudinary!');
      }
    } catch (err) {
      showError('Failed to upload image: ' + (err.response?.data?.message || err.message));
      // Keep the preview but don't update the image field
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="admin-container loading">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="admin-container not-authorized">
        <h2>Not Authorized</h2>
        <p>You must be an admin to view this page.</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/')}
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>
      
      <div className="tab-content">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-tab">
            <div className="row">
              <div className="col-md-5">
                <div className="card product-form-card">
                  <div className="card-header">
                    <h4>{isEditing ? 'Edit Product' : 'Add New Product'}</h4>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmitProduct}>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">Product Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={productForm.name}
                          onChange={handleProductFormChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="price" className="form-label">Price (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="price"
                          name="price"
                          value={productForm.price}
                          onChange={handleProductFormChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          value={productForm.description}
                          onChange={handleProductFormChange}
                          rows="3"
                        ></textarea>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="category" className="form-label">Category</label>
                        <select
                          className="form-select"
                          id="category"
                          name="category"
                          value={productForm.category}
                          onChange={handleProductFormChange}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Home">Home</option>
                          <option value="Beauty">Beauty</option>
                          <option value="Sports">Sports</option>
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="image" className="form-label">Product Image</label>
                        <div className="d-flex flex-column">
                          {(productForm.image || productForm._previewImage) && (
                            <div className="image-preview mb-2">
                              {productForm._previewImage && (
                                <div className="preview-badge">
                                  <span className="badge bg-info">Preview</span>
                                </div>
                              )}
                              <img 
                                src={productForm._previewImage || getImageUrl(productForm.image)} 
                                alt="Product preview" 
                                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                              />
                              {productForm.image && (
                                <div className="mt-2">
                                  <small className="text-muted">Image Path: {productForm.image}</small>
                                  <br/>
                                  <small className="text-muted">Full URL: {getImageUrl(productForm.image)}</small>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              id="image"
                              name="image"
                              value={productForm.image}
                              onChange={handleProductFormChange}
                              placeholder="Image URL or upload an image"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => document.getElementById('imageUpload').click()}
                            >
                              Browse...
                            </button>
                          </div>
                          <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                          />
                          <small className="form-text text-muted">
                            Enter an image URL or upload a new image.
                          </small>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="countInStock" className="form-label">Count In Stock</label>
                        <input
                          type="number"
                          className="form-control"
                          id="countInStock"
                          name="countInStock"
                          value={productForm.countInStock}
                          onChange={handleProductFormChange}
                          required
                          min="0"
                        />
                      </div>
                      
                      <div className="d-flex justify-content-between">
                        <button type="submit" className="btn btn-success">
                          {isEditing ? 'Update Product' : 'Add Product'}
                        </button>
                        {isEditing && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={resetProductForm}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-7">
                <div className="card product-list-card">
                  <div className="card-header">
                    <h4>Product List</h4>
                  </div>
                  <div className="card-body">
                    {products.length === 0 ? (
                      <p>No products found.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Price</th>
                              <th>Category</th>
                              <th>Stock</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map(product => (
                              <tr key={product._id}>
                                <td>{product.name}</td>
                                <td>₹{product.price}</td>
                                <td>{product.category || 'N/A'}</td>
                                <td>{product.countInStock || 0}</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-primary me-1"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteProduct(product._id)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-tab">
            <div className="card">
              <div className="card-header">
                <h4>All Orders</h4>
              </div>
              <div className="card-body">
                {orders.length === 0 ? (
                  <p>No orders found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>User</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order._id}>
                            <td>{order._id.substring(0, 8)}</td>
                            <td>{order.userId?.email || 'Unknown'}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>₹{order.amount || order.totalPrice}</td>
                            <td>
                              <span className={`badge status-${order.status?.toLowerCase() || 'placed'}`}>
                                {order.status || 'Placed'}
                              </span>
                            </td>
                            <td>
                              <select 
                                className="form-select form-select-sm" 
                                value={order.status || 'Placed'}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              >
                                {['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="card">
              <div className="card-header">
                <h4>All Users</h4>
              </div>
              <div className="card-body">
                {users.length === 0 ? (
                  <p>No users found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Admin</th>
                          <th>Joined On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id}>
                            <td>{user._id.substring(0, 8)}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              {user.isAdmin ? (
                                <span className="badge bg-success">Yes</span>
                              ) : (
                                <span className="badge bg-secondary">No</span>
                              )}
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;