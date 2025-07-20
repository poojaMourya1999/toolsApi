const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/me', authMiddleware,  purchaseController.getNotifications);
router.get('/sales', authMiddleware, purchaseController.markRead);

module.exports = router;
