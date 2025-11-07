const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { addProduct, getAllProducts, getProductById } = require("../controllers/productController");

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.post("/add", addProduct);       // Add product
router.get("/", getAllProducts);       // Get all products
router.get("/:id", getProductById);    // Get product by ID
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Return the file path that can be stored in the database
    const imagePath = `/uploads/${req.file.filename}`;
    res.status(200).json({ 
      message: "File uploaded successfully",
      imagePath: imagePath
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file" });
  }
});

module.exports = router;
