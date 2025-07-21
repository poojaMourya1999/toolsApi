const express = require('express');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart
} = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/cart - Add to cart
router.post('/', authMiddleware, addToCart);

// GET /api/cart - Get cart items
router.get('/', authMiddleware, getCart);

// PUT /api/cart/:id - Update quantity
router.put('/:id', authMiddleware, updateCartItem);

// DELETE /api/cart/:id - Remove item
router.delete('/:id', authMiddleware, removeFromCart);

module.exports = router;