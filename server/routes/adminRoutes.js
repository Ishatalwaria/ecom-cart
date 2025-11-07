const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  deleteProduct,
  updateProduct,
  createProduct,
  getAllUsers,
  addAdminRole,
  removeAdminRole
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// Apply protect and admin middleware to all routes
router.use(protect);
router.use(admin);

// Order routes
router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderStatus);

// Product routes
router.post("/products", createProduct);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id", updateProduct);

// User routes
router.get("/users", getAllUsers);
router.put("/users/:id/make-admin", addAdminRole);
router.put("/users/:id/remove-admin", removeAdminRole);

module.exports = router;
