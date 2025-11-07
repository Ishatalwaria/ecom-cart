const express = require("express");
const router = express.Router();
const { addToCart, getCart, removeItem, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// Apply authentication middleware to all cart routes
router.use(protect);

// Cart routes
router.post("/add", addToCart);
router.get("/:userId", getCart);
router.delete("/remove", removeItem);
router.post("/clear", clearCart);

module.exports = router;
