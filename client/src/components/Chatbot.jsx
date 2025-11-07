import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to the most recent message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Process user message and generate bot response
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = { text: inputText, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInputText('');

    // Process and generate response (this is a simple mock response)
    setTimeout(() => {
      processUserQuery(inputText);
    }, 600);
  };

  // Advanced pattern matching helper
  const matchesPattern = (query, patterns) => {
    const lowerQuery = query.toLowerCase().trim();
    return patterns.some(pattern => {
      // Check for exact phrase matches
      if (lowerQuery.includes(pattern)) {
        return true;
      }
      
      // Check for word boundary matches (full words only)
      const words = lowerQuery.split(/\s+/);
      return words.some(word => word === pattern);
    });
  };

  // Process user query and respond accordingly
  const processUserQuery = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    let botResponse = '';

    // Define pattern groups for better matching
    const shippingPatterns = ['shipping', 'delivery', 'ship', 'deliver', 'when will', 'how long', 'shipping cost', 'arrive'];
    const returnPatterns = ['return', 'refund', 'money back', 'send back', 'exchange', 'warranty'];
    const paymentPatterns = ['payment', 'pay', 'credit card', 'debit card', 'paypal', 'apple pay', 'method'];
    const discountPatterns = ['discount', 'coupon', 'promo', 'offer', 'sale', 'deal', 'code', 'percentage off'];
    const trackingPatterns = ['track', 'order status', 'where is', 'package', 'shipping status', 'delivery status'];
    const sizePatterns = ['size', 'sizing', 'fit', 'measurement', 'small', 'medium', 'large', 'xl', 'too big', 'too small'];
    const contactPatterns = ['contact', 'help', 'support', 'phone', 'email', 'chat', 'customer service', 'talk to'];
    const greetingPatterns = ['hi', 'hello', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening', 'what\'s up'];
    const thankPatterns = ['thank', 'thanks', 'appreciate', 'grateful', 'thx'];
    const productPatterns = ['product', 'item', 'buy', 'purchase', 'goods', 'merchandise', 'stock', 'available'];
    const pricePatterns = ['price', 'cost', 'how much', 'expensive', 'cheap', 'affordable', 'dollars', '$'];
    const accountPatterns = ['account', 'login', 'sign in', 'register', 'sign up', 'profile', 'password'];

    // Check patterns in priority order
    if (matchesPattern(lowerQuery, greetingPatterns)) {
      botResponse = 'Hello there! How can I assist you with your shopping today?';
    } 
    else if (lowerQuery.length < 3) {
      botResponse = 'Please provide more details so I can help you better.';
    }
    // Shipping and delivery
    else if (matchesPattern(lowerQuery, shippingPatterns)) {
      if (lowerQuery.includes('free') || lowerQuery.includes('cost')) {
        botResponse = 'We offer free shipping on orders over $50. Standard shipping costs $4.99 for orders below $50.';
      } else if (lowerQuery.includes('time') || lowerQuery.includes('long') || lowerQuery.includes('when')) {
        botResponse = 'Standard delivery takes 3-5 business days. Express shipping (2-day) is available for an additional $9.99.';
      } else if (lowerQuery.includes('international') || lowerQuery.includes('worldwide') || lowerQuery.includes('country')) {
        botResponse = 'Yes, we ship internationally! International shipping typically takes 7-14 business days depending on the destination.';
      } else {
        botResponse = 'We offer free shipping on orders over $50. Standard delivery takes 3-5 business days.';
      }
    } 
    // Returns and refunds
    else if (matchesPattern(lowerQuery, returnPatterns)) {
      if (lowerQuery.includes('how') || lowerQuery.includes('process')) {
        botResponse = 'To return an item, go to your order history, select the order, and click "Return Item". You\'ll receive a return shipping label to print.';
      } else if (lowerQuery.includes('time') || lowerQuery.includes('long') || lowerQuery.includes('days')) {
        botResponse = 'You can return items within 30 days of delivery for a full refund.';
      } else if (lowerQuery.includes('money') || lowerQuery.includes('refund')) {
        botResponse = 'Refunds are processed within 3-5 business days after we receive your return.';
      } else {
        botResponse = 'You can return items within 30 days of delivery for a full refund. Please check our Returns Policy for more details.';
      }
    } 
    // Payment methods
    else if (matchesPattern(lowerQuery, paymentPatterns)) {
      if (lowerQuery.includes('credit') || lowerQuery.includes('card')) {
        botResponse = 'We accept all major credit cards including Visa, Mastercard, American Express, and Discover.';
      } else if (lowerQuery.includes('paypal')) {
        botResponse = 'Yes, we accept PayPal as a payment method.';
      } else if (lowerQuery.includes('apple')) {
        botResponse = 'Yes, Apple Pay is accepted on our website and mobile app.';
      } else {
        botResponse = 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay.';
      }
    } 
    // Discounts and offers
    else if (matchesPattern(lowerQuery, discountPatterns)) {
      if (lowerQuery.includes('code') || lowerQuery.includes('enter')) {
        botResponse = 'You can enter discount codes on the shopping cart page before proceeding to checkout.';
      } else if (lowerQuery.includes('current') || lowerQuery.includes('available')) {
        botResponse = 'Check our homepage for current promotions, or sign up for our newsletter to receive exclusive offers!';
      } else {
        botResponse = 'You can apply discount codes during checkout. Sign up for our newsletter to receive exclusive offers!';
      }
    } 
    // Order tracking
    else if (matchesPattern(lowerQuery, trackingPatterns)) {
      if (lowerQuery.includes('how')) {
        botResponse = 'To track your order, go to "My Orders" in your account and click on the order you want to track. You\'ll see the current status and tracking number.';
      } else {
        botResponse = 'You can track your order in the "My Orders" section after logging in to your account.';
      }
    } 
    // Sizing information
    else if (matchesPattern(lowerQuery, sizePatterns)) {
      if (lowerQuery.includes('chart') || lowerQuery.includes('guide')) {
        botResponse = 'You can find our detailed size charts on each product page under the "Size Guide" tab.';
      } else if (lowerQuery.includes('fit') || lowerQuery.includes('true')) {
        botResponse = 'Our clothing generally fits true to size. If you\'re between sizes, we recommend sizing up for a more comfortable fit.';
      } else {
        botResponse = 'We provide detailed size guides on each product page. If you\'re between sizes, we generally recommend sizing up.';
      }
    } 
    // Product information
    else if (matchesPattern(lowerQuery, productPatterns)) {
      if (lowerQuery.includes('quality') || lowerQuery.includes('material')) {
        botResponse = 'All our products are made with high-quality materials and undergo strict quality control before shipping.';
      } else if (lowerQuery.includes('new') || lowerQuery.includes('latest')) {
        botResponse = 'Check our "New Arrivals" section for our latest products.';
      } else if (lowerQuery.includes('available') || lowerQuery.includes('stock')) {
        botResponse = 'Product availability is shown on each product page. If an item is out of stock, you can sign up to be notified when it\'s back.';
      } else {
        botResponse = 'We offer a wide range of products. You can browse categories from the navigation menu or use the search function to find specific items.';
      }
    }
    // Price information
    else if (matchesPattern(lowerQuery, pricePatterns)) {
      if (lowerQuery.includes('range') || lowerQuery.includes('average')) {
        botResponse = 'Our products range from $15 for accessories to $150 for premium items. Most popular items are in the $30-60 range.';
      } else if (lowerQuery.includes('match') || lowerQuery.includes('beat')) {
        botResponse = 'We offer price matching for identical products from authorized retailers. Contact customer support with details.';
      } else {
        botResponse = 'Product prices are clearly displayed on each product page. We regularly offer sales and promotions to provide the best value.';
      }
    }
    // Account questions
    else if (matchesPattern(lowerQuery, accountPatterns)) {
      if (lowerQuery.includes('create') || lowerQuery.includes('register') || lowerQuery.includes('sign up')) {
        botResponse = 'To create an account, click on the "Sign Up" button in the top right corner and follow the instructions.';
      } else if (lowerQuery.includes('forgot') || lowerQuery.includes('reset') || lowerQuery.includes('password')) {
        botResponse = 'If you forgot your password, click on "Login" and then "Forgot Password" to reset it via email.';
      } else if (lowerQuery.includes('delete') || lowerQuery.includes('remove')) {
        botResponse = 'To delete your account, go to your Profile settings and select "Delete Account". Note that this action cannot be undone.';
      } else {
        botResponse = 'You can manage your account settings, including address, payment methods, and preferences from your Profile page.';
      }
    }
    // Contact and support
    else if (matchesPattern(lowerQuery, contactPatterns)) {
      if (lowerQuery.includes('phone') || lowerQuery.includes('call')) {
        botResponse = 'Our customer support phone number is (123) 456-7890. We\'re available Monday-Friday, 9 AM to 6 PM EST.';
      } else if (lowerQuery.includes('email')) {
        botResponse = 'You can email our support team at support@example.com. We typically respond within 24 hours.';
      } else if (lowerQuery.includes('chat') || lowerQuery.includes('live')) {
        botResponse = 'Our live chat support is available during business hours. You\'re using it right now!';
      } else {
        botResponse = 'You can reach our customer support team at support@example.com or call us at (123) 456-7890.';
      }
    } 
    // Thank you messages
    else if (matchesPattern(lowerQuery, thankPatterns)) {
      botResponse = 'You\'re welcome! Feel free to ask if you have any other questions.';
    } 
    // Default fallback response for unrecognized queries
    else {
      botResponse = "I'm not sure I understand your question. Could you please rephrase or try asking about shipping, returns, payment methods, products, or contact information?";
    }

    // Add bot response
    setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
          <div className="chatbot-header">
            <h3>Customer Support</h3>
            <button className="close-btn" onClick={toggleChat}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}-message`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your question here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="send-btn">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
      <button className="chatbot-button" onClick={toggleChat}>
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment'}`}></i>
      </button>
    </div>
  );
};

export default Chatbot; 