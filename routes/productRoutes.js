const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/'});
router.post('/', authMiddleware, upload.single('image'), productController.createProduct);
router.get('/', authMiddleware, productController.getProducts);
router.get('/:id', authMiddleware, productController.getProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);
module.exports = router;
