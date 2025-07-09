const mongoose = require('mongoose');
const CategoryEnum = require('../config/categoryEnum');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure product names are unique
  },
  description: String,
  category: {
    type: String,
    enum: Object.values(CategoryEnum), // ✅ restrict to enum values
    required: true
  },
  stock: Number,
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
