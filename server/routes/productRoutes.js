const express = require("express");
const router = express.Router();
const { addProduct, getAllProducts ,  getProductById} = require("../controllers/productController");

// Routes
router.post("/add", addProduct);       // Add product
router.get("/", getAllProducts);       // Get all products
router.get("/:id", getProductById) 

module.exports = router;
