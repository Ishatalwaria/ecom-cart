const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes that require authentication
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Not authorized, invalid token format" });
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || (!decoded.id && !decoded._id)) {
          return res.status(401).json({ message: "Invalid token payload" });
        }

        // Get user ID from token (could be either id or _id)
        const userId = decoded.id || decoded._id;
        
        // Get user from token
        const user = await User.findById(userId).select("-password");
        
        if (!user) {
          console.error(`User not found for ID: ${userId}`);
          return res.status(401).json({ message: "User not found or deleted" });
        }

        // Attach user to request object
        req.user = user;
        next();
      } catch (jwtError) {
        console.error("JWT verification error:", jwtError.message);
        return res.status(401).json({ message: "Token invalid or expired" });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(401).json({ message: "Authentication failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to check if user is admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
}; 