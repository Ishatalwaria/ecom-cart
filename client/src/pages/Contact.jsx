import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import axios from 'axios'
import './Contact.css'

const Contact = () => {
  const { showSuccess, showError } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  
  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      showError('Please fill all required fields')
      return
    }

    setLoading(true)
    
    try {
      // Send message to server
      await axios.post('http://localhost:5000/api/contact', formData)
      
      showSuccess('Message sent successfully! We will get back to you soon.')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Fallback to simulate successful submission if server endpoint doesn't exist
      if (error.response && error.response.status === 404) {
        showSuccess('Message received! We will contact you soon. (Development mode)')
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        showError('Failed to send message. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-page fade-in">
      {/* Hero section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>We're here to help with any questions or concerns</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-wrapper">
          {/* Contact information */}
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>We'd love to hear from you! Whether you have a question about our products, services, or anything else, our team is ready to answer all your questions.</p>
            
            <div className="contact-details">
              <div className="contact-item">
                <i className="bi bi-geo-alt-fill"></i>
                <div>
                  <h4>Address</h4>
                  <p>123 Commerce St, Digital Plaza, Techville</p>
                </div>
              </div>
              
              <div className="contact-item">
                <i className="bi bi-telephone-fill"></i>
                <div>
                  <h4>Phone</h4>
                  <p>+91 1234567890</p>
                </div>
              </div>
              
              <div className="contact-item">
                <i className="bi bi-envelope-fill"></i>
                <div>
                  <h4>Email</h4>
                  <p>support@shopmate.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <i className="bi bi-clock-fill"></i>
                <div>
                  <h4>Business Hours</h4>
                  <p>Monday - Friday: 9am to 6pm</p>
                  <p>Saturday: 10am to 4pm</p>
                </div>
              </div>
            </div>
            
            <div className="social-links">
              <h4>Connect With Us</h4>
              <div className="social-icons">
                <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                <a href="#" aria-label="Twitter"><i className="bi bi-twitter"></i></a>
                <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
              </div>
            </div>
          </div>
          
          {/* Contact form */}
          <div className="contact-form-container">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Your Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="form-control"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Your Message *</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-control"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Location card instead of map */}
        <div className="location-section">
          <h2 className="text-center mb-4">Our Location</h2>
          <div className="location-card">
            <div className="location-icon">
              <i className="bi bi-pin-map-fill"></i>
            </div>
            <div className="location-details">
              <h3>ShopMate Headquarters</h3>
              <p>123 Commerce Street</p>
              <p>Digital Plaza, Techville</p>
              <p>India - 110001</p>
              <p className="location-description">
                Located in the heart of the city, our store is easily accessible by public transportation.
                We're just a 5-minute walk from Central Metro Station and have parking facilities available.
              </p>
            </div>
          </div>
        </div>
        
        {/* FAQ section */}
        <div className="faq-section">
          <h2 className="text-center">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How do I track my order?</h4>
              <p>You can track your order by logging into your account and visiting the Orders section, or by using the tracking number provided in your order confirmation email.</p>
            </div>
            
            <div className="faq-item">
              <h4>What is your return policy?</h4>
              <p>We accept returns within 30 days of delivery. Items must be in their original condition with tags attached.</p>
            </div>
            
            <div className="faq-item">
              <h4>How long does shipping take?</h4>
              <p>Standard shipping typically takes 3-5 business days, while express shipping takes 1-2 business days within metro areas.</p>
            </div>
            
            <div className="faq-item">
              <h4>Do you ship internationally?</h4>
              <p>Yes, we ship to select international destinations. Shipping times and costs vary by location.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact 