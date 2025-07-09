const Product = require('../models/Products');
const CategoryEnum = require('../config/categoryEnum');

// create 
exports.createProduct = async (req, res) => {
  try {
    const { name, description, stock, category } = req.body;
    const image = req.file ? req.file.filename : null;

    // Optional: Validate category manually
    if (!Object.values(CategoryEnum).includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product already exists' });
    }

    const product = await Product.create({
      name,
      description,
      stock,
      category,
      image
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, category, stock },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
