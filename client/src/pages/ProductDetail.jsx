import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import './ProductDetail.css' // ✅ Import styles
import { useUser } from '../context/UserContext';
const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const { addToCart } = useCart()
  const { user } = useUser();
  const userId = user?._id;
  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        if (res.data) {
          setProduct(res.data)
        } else {
          console.error("No product data returned.")
        }
      })
      .catch(err => console.error("Error fetching product:", err))
  }, [id])

  const handleAddToCart = () => {

    if (product) {
      addToCart(product)
      alert("Product added to cart!")
    }
  }

  return (
    <div className="container mt-5">
      {product ? (
        <div className="row align-items-center">
          <div className="col-md-6">
            <img src={product.image} alt={product.name} className="img-fluid" />
          </div>
          <div className="col-md-6">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <h3>₹{product.price}</h3>
            <button className="btn btn-success" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>
      ) : (
        <p>Loading product details...</p>
      )}
    </div>
  )
}

export default ProductDetail
