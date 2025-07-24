const express = require('express');
const router = express.Router();
const toolsCtrl = require('../controllers/toolsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, toolsCtrl.createTools);
router.put('/:id', authMiddleware, toolsCtrl.updateTool);
router.get('/mine', authMiddleware, toolsCtrl.getMyTools);
router.get('/available', authMiddleware, toolsCtrl.getAvailableTools);
router.get('/', toolsCtrl.getAllTools);
router.delete('/:id', authMiddleware, toolsCtrl.deleteTool);
router.get('/:id', authMiddleware, toolsCtrl.getToolById);

// add to cart 
router.post('/add-to-cart', authMiddleware, toolsCtrl.addToCart);

// create order 
router.post('/order', authMiddleware, toolsCtrl.createOrder);

module.exports = router;
