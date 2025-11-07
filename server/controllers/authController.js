const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const user = await User.create({ name, email, password: hashedPassword });
    console.log("User registered successfully:", user._id);
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration: " + err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    console.log("User logged in successfully:", user._id);
    
    // Return user data (excluding password) and token
    res.json({ 
      token, 
      user: { 
        _id: user._id, 
        id: user._id, // Include both for compatibility
        name: user.name, 
        email: user.email, 
        phone: user.phone || "",
        address: user.address || "",
        isAdmin: user.isAdmin 
      } 
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login: " + err.message });
  }
};
