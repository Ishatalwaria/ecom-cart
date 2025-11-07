import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import './Home.css'

const Home = () => {
  const [products, setProducts] = useState([])
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
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero d-flex align-items-center justify-content-center text-center">
        <div className="hero-content">
          <h1>Welcome to ShopMate</h1>
          <p>Your favorite online store for everything</p>
          <Link to="/register" className="btn btn-warning btn-lg">Register Now</Link>
        </div>
      </section>

      {/* Orders Shortcut */}
      <section className="container my-5 text-center">
        <Link to="/orders" className="btn btn-outline-dark btn-lg">
           <i className="bi bi-box-seam me-2"></i> My Orders
        </Link>
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
          <div className="d-flex align-items-center justify-content-center">
            <div className="active-filters">
              {currentCategory && (
                <span className="badge bg-primary me-2">
                  Category: {currentCategory}
                  <button 
                    className="btn-close btn-close-white ms-2" 
                    onClick={() => handleCategoryClick(currentCategory)}>
                  </button>
                </span>
              )}
              {searchParams.get('search') && (
                <span className="badge bg-primary me-2">
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

      {/* Categories Carousel */}
      <section className="categories container my-5">
        <h2 className="text-center mb-4">Shop by Category</h2>
        <div className="row text-center">
          {['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports'].map((category, i) => (
            <div className="col-6 col-md-2 mb-3" key={i}>
              <div 
                className={`category-box p-3 rounded shadow-sm ${currentCategory === category ? 'bg-primary text-white' : 'bg-light'}`}
                onClick={() => handleCategoryClick(category)}
              >
                <i className={`bi ${categoryIcons[category] || 'bi-bag-fill'} fs-2 ${currentCategory === category ? 'text-white' : 'text-primary'}`}></i>
                <p className="mt-2">{category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Deals */}
      <section className="container my-5">
        <h2 className="mb-4">🔥 Today's Deals</h2>
        <div className="row">
          {products.slice(0, 3).map(product => (
            <div className="col-md-4 mb-4" key={product._id}>
              <div className="card h-100 shadow">
                <img src={product.image} className="card-img-top" alt={product.name} />
                <div className="card-body d-flex flex-column justify-content-between">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-success">₹{product.price}</p>
                  <Link to={`/product/${product._id}`} className="btn btn-outline-primary mt-auto">Buy Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section className="container my-5">
        <h2 className="mb-4">
          {currentCategory ? `${currentCategory} Products` : 'All Products'}
          {loading && <small className="ms-2 text-muted">(Loading...)</small>}
        </h2>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <div className="row">
          {products.length > 0 ? (
            products.map(product => (
              <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={product._id}>
                <div className="card h-100">
                  <img src={product.image} className="card-img-top" alt={product.name} />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">₹{product.price}</p>
                    <Link to={`/product/${product._id}`} className="btn btn-primary mt-auto">View</Link>
                  </div>
                </div>
              </div>
            ))
          ) : loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="col-12 text-center py-5">
              <h3>No products found</h3>
              <p>Try different search criteria or browse all products.</p>
              <button className="btn btn-outline-primary" onClick={clearFilters}>
                Show All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials bg-light py-5">
        <div className="container text-center">
          <h2 className="mb-4">What Our Customers Say</h2>
          <div className="row">
            <div className="col-md-4">
              <p>"Best shopping experience ever!"</p>
              <strong>- Anjali</strong>
            </div>
            <div className="col-md-4">
              <p>"Great products at great prices."</p>
              <strong>- Ravi</strong>
            </div>
            <div className="col-md-4">
              <p>"Customer support is top-notch!"</p>
              <strong>- Sneha</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-4">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} ShopMate | All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
