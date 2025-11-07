const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  deleteProduct,
  updateProduct
} = require("../controllers/adminController");

// GET all orders
router.get("/orders", getAllOrders);

// PUT update order status
router.put("/orders/:id", updateOrderStatus);

// DELETE product
router.delete("/products/:id", deleteProduct);

// PUT update product
router.put("/products/:id", updateProduct);

module.exports = router;
