const express = require("express");
const router = express.Router();
const { addToCart, getCart, removeItem, clearCart } = require("../controllers/cartController");

router.post("/add", addToCart);
router.get("/:userId", getCart);
router.delete("/remove", removeItem);
router.post("/clear", clearCart);

module.exports = router;
