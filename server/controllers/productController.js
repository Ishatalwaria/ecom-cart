const Product = require("../models/Product");

exports.addProduct = async (req, res) => {
  try {
    // Create product with the provided data
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    // Add category filter if provided
    if (category) {
      // More robust category matching
      query.category = { $regex: new RegExp(category, 'i') }; // Case insensitive
      console.log(`Filtering by category: ${category}`);
    }
    
    // Add search filter if provided
    if (search) {
      query.name = { $regex: new RegExp(search, 'i') }; // Case insensitive
      console.log(`Searching for: ${search}`);
    }
    
    console.log('Query:', query);
    const products = await Product.find(query);
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    res.status(500).json({ message: "Server error" })
  }
}

