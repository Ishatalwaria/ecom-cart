import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import './Home.css'
import { getImageUrl } from '../utils/imageUtils'

const Home = () => {
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Category icons mapping
  const categoryIcons = {
    'Electronics': 'bi-laptop',
    'Clothing': 'bi-tag',
    'Home': 'bi-house',
    'Beauty': 'bi-droplet',
    'Sports': 'bi-trophy'
  }
  
  // Get the current category from URL params
  const currentCategory = searchParams.get('category') || ''
  
  useEffect(() => {
    // Initialize search term from URL
    const searchFromUrl = searchParams.get('search') || ''
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchParams])
  
  // Fetch all products for featured section - independent of filters
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products')
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Get 3 random products for featured section
          const randomProducts = [...res.data].sort(() => 0.5 - Math.random()).slice(0, 3)
          setFeaturedProducts(randomProducts)
          console.log('Featured products loaded:', randomProducts)
        } else {
          console.log('No products returned from API, setting default featured products')
          setDefaultFeaturedProducts()
        }
      } catch (err) {
        console.error('Error fetching featured products:', err)
        setDefaultFeaturedProducts()
      }
    }
    
    const setDefaultFeaturedProducts = () => {
      // Set default products with placeholders if API fails
      setFeaturedProducts([
        {
          _id: 'sample1',
          name: 'Premium Headphones',
          price: 2999,
          description: 'High-quality wireless headphones with noise cancellation',
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=684&q=80'
        },
        {
          _id: 'sample2',
          name: 'Stylish Watch',
          price: 1499,
          description: 'Classic design with modern features',
          image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
        },
        {
          _id: 'sample3',
          name: 'Smartphone',
          price: 15999,
          description: 'Latest model with advanced camera system',
          image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=727&q=80'
        }
      ])
    }
    
    fetchFeaturedProducts()
  }, [])
  
  // Fetch products with filtering
  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query parameters
      let url = 'http://localhost:5000/api/products'
      const params = new URLSearchParams()
      
      // Get search and category from URL params
      const urlCategory = searchParams.get('category')
      const urlSearch = searchParams.get('search')
      
      if (urlCategory) {
        params.append('category', urlCategory)
      }
      
      if (urlSearch) {
        params.append('search', urlSearch)
      }
      
      // Add params to URL if any exist
      if (params.toString()) {
        url += '?' + params.toString()
      }
      
      console.log('Fetching products from:', url)
      const res = await axios.get(url)
      
      if (res.data && Array.isArray(res.data)) {
        console.log(`Loaded ${res.data.length} products`)
        setProducts(res.data)
      } else {
        console.error('Invalid response format:', res.data)
        setProducts([])
        setError('Received invalid data from server')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products. Please try again.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch products when search params change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts()
  }, [searchParams])
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault()
    
    // Update URL with search params
    const params = new URLSearchParams(searchParams)
    
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    
    setSearchParams(params)
  }
  
  // Handle category click
  const handleCategoryClick = (category) => {
    console.log(`Category clicked: ${category}`)
    
    // Update URL with category param
    const params = new URLSearchParams(searchParams)
    
    if (category === currentCategory) {
      // If clicking the same category, clear the filter
      console.log('Clearing category filter')
      params.delete('category')
    } else {
      console.log(`Setting category filter to: ${category}`)
      params.set('category', category)
    }
    
    setSearchParams(params)
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    navigate('/')
  }

  return (
    <div className="home-page fade-in">
      {/* Hero Banner */}
      <section className="hero-section" style={{ 
        backgroundImage: "url('bghome.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Welcome to ShopMate</h1>
          <p className="hero-subtitle">Discover amazing products with great deals</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-secondary btn-lg hero-button">Register Now</Link>
            <Link to="/login" className="btn btn-outline-light btn-lg hero-button">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Orders Shortcut */}
      <section className="section section-dark">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">Track Your Orders</h2>
            <p>Keep track of all your purchases in one place</p>
            <Link to="/orders" className="btn btn-outline-primary btn-lg">
              <i className="bi bi-box-seam me-2"></i> My Orders
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <form onSubmit={handleSearch}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="form-control form-control-lg shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(currentCategory || searchParams.get('search')) && (
        <div className="container mt-3">
          <div className="d-flex align-items-center justify-content-center flex-wrap">
            <div className="active-filters">
              {currentCategory && (
                <span className="badge badge-primary me-2">
                  Category: {currentCategory}
                  <button 
                    className="btn-close btn-close-white ms-2" 
                    onClick={() => handleCategoryClick(currentCategory)}>
                  </button>
                </span>
              )}
              {searchParams.get('search') && (
                <span className="badge badge-primary me-2">
                  Search: {searchParams.get('search')}
                  <button 
                    className="btn-close btn-close-white ms-2" 
                    onClick={() => {
                      setSearchTerm('');
                      const params = new URLSearchParams(searchParams);
                      params.delete('search');
                      setSearchParams(params);
                    }}>
                  </button>
                </span>
              )}
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={clearFilters}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="grid grid-2 grid-md-3 grid-lg-5 text-center">
            {['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports'].map((category, i) => (
              <div 
                className={`category-box p-3 rounded shadow-sm ${currentCategory === category ? 'bg-primary text-white' : 'bg-light'}`}
                onClick={() => handleCategoryClick(category)}
                key={i}
              >
                <i className={`bi ${categoryIcons[category] || 'bi-bag-fill'} fs-2 ${currentCategory === category ? 'text-white' : 'text-primary'}`}></i>
                <p className="mt-2 mb-0">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-primary">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <div className="grid grid-1 grid-md-3 stagger-children">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <div className="product-card" key={product._id}>
                  <img 
                    src={getImageUrl(product.image)} 
                    className="product-img" 
                    alt={product.name} 
                  />
                  <div className="product-body">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-price">₹{product.price}</p>
                    <p className="product-description">{product.description ? product.description.substring(0, 60) + '...' : ''}</p>
                    <div className="btn-container">
                      <Link to={`/product/${product._id}`} className="btn btn-primary w-100">View Details</Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-white">
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading featured products...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">
            {currentCategory ? `${currentCategory} Products` : 'All Products'}
            {loading && <small className="ms-2 text-muted">(Loading...)</small>}
          </h2>
          
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading products...</p>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
                  <p className="mt-3">No products found. Try a different search or category.</p>
                  <button className="btn btn-primary" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="products-grid">
                  {products.map(product => (
                    <div className="product-card" key={product._id}>
                      <img 
                        src={getImageUrl(product.image)} 
                        className="product-img" 
                        alt={product.name} 
                      />
                      <div className="product-body">
                        <h3 className="product-title">{product.name}</h3>
                        <p className="product-price">₹{product.price}</p>
                        <p className="product-description">{product.description ? product.description.substring(0, 60) + '...' : ''}</p>
                        <div className="btn-container">
                          <Link to={`/product/${product._id}`} className="btn btn-primary w-100">View Details</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-dark">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="grid grid-1 grid-md-3 gap-4">
            <div className="card p-4 text-center">
              <div className="mb-3">
                <span className="fs-1 text-warning">★★★★★</span>
              </div>
              <p className="card-text">"Excellent quality products and fast delivery. Will definitely shop again!"</p>
              <p className="fw-bold mb-0">- Amit S.</p>
            </div>
            <div className="card p-4 text-center">
              <div className="mb-3">
                <span className="fs-1 text-warning">★★★★★</span>
              </div>
              <p className="card-text">"Great customer service and the return process was so easy. Loved shopping here."</p>
              <p className="fw-bold mb-0">- Priya M.</p>
            </div>
            <div className="card p-4 text-center">
              <div className="mb-3">
                <span className="fs-1 text-warning">★★★★★</span>
              </div>
              <p className="card-text">"The best online shopping experience I've had in a long time. Highly recommended!"</p>
              <p className="fw-bold mb-0">- Rahul K.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="grid grid-1 grid-md-4 gap-4">
            <div>
              <h5>ShopMate</h5>
              <p>Your favorite online shopping destination for high-quality products at affordable prices.</p>
              <div className="footer-social">
                <a href="#" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                  </svg>
                </a>
                <a href="#" aria-label="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h5>Quick Links</h5>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/orders">Orders</Link></li>
                <li><Link to="/profile">My Account</Link></li>
              </ul>
            </div>
            <div>
              <h5>Categories</h5>
              <ul>
                {['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports'].map((category, i) => (
                  <li key={i}>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryClick(category); }}>
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5>Contact Us</h5>
              <p>Email: support@shopmate.com</p>
              <p>Phone: +91 1234567890</p>
              <p>Address: 123 Commerce St, Digital Plaza, Techville</p>
              <Link to="/contact" className="btn btn-outline-primary btn-sm mt-2">Send Message</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} ShopMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
