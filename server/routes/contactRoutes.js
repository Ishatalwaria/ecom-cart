const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// @route   POST /api/contact
// @desc    Submit a contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please provide name, email, and message' });
    }
    
    // Create new contact entry
    const newContact = new Contact({
      name,
      email,
      subject: subject || 'General Inquiry', // Default subject if not provided
      message
    });
    
    // Save to database
    const savedContact = await newContact.save();
    
    // Send response
    res.status(201).json({ 
      success: true,
      message: 'Your message has been received. We will contact you soon.',
      contactId: savedContact._id
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Server error processing your request' });
  }
});

// @route   GET /api/contact
// @desc    Get all contact submissions (for admin purposes)
// @access  Private (should be protected with auth middleware in production)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 