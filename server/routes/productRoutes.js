const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require("path");
const { addProduct, getAllProducts, getProductById } = require("../controllers/productController");
const { upload, uploadToCloudinary, isCloudinaryConfigured } = require("../utils/cloudinaryUpload");

// Routes
router.post("/add", addProduct);       // Add product
router.get("/", getAllProducts);       // Get all products
router.get("/:id", getProductById);    // Get product by ID

// Upload image route - now simplified using our improved utilities
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Upload using our utility (handles both Cloudinary and local storage)
    const result = await uploadToCloudinary(req.file.path);
    
    // Return the appropriate response based on where it was uploaded
    if (result.success) {
      return res.status(200).json({ 
        message: result.local 
          ? "File uploaded to local storage" 
          : "File uploaded to Cloudinary",
        imagePath: result.url,
        public_id: result.public_id,
        useCloudinary: !result.local
      });
    } else {
      return res.status(500).json({ 
        message: "Failed to upload image", 
        error: result.error 
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading file: " + error.message });
  }
});

module.exports = router;
