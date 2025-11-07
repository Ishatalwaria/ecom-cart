const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Add a verify-token endpoint after other routes
router.get('/verify-token', protect, (req, res) => {
  // If the protect middleware passed, then the token is valid
  res.json({
    isValid: true,
    user: {
      id: req.user.id,
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  });
});

module.exports = router;
