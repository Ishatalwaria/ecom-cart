import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <input
              type="text"
              placeholder="Search for products..."
              className="form-control form-control-lg shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>


      {/* Categories Carousel */}
      <section className="categories container my-5">
        <h2 className="text-center mb-4">Shop by Category</h2>
        <div className="row text-center">
          {['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports'].map((category, i) => (
            <div className="col-6 col-md-2 mb-3" key={i}>
              <div className="category-box p-3 bg-light rounded shadow-sm">
                <i className="bi bi-bag-fill fs-2 text-primary"></i>
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
        <h2 className="mb-4">All Products</h2>
        <div className="row">
          {products.map(product => (
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
          ))}
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
