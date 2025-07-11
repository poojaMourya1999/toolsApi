const express = require('express');
const router = express.Router();
const toolsCtrl = require('../controllers/toolsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, toolsCtrl.createTools);
router.get('/', authMiddleware, toolsCtrl.getAllAvailableTools);
router.get('/all', authMiddleware, toolsCtrl.getAllTools);
router.post('/:id/buy', authMiddleware, toolsCtrl.buyTools);

module.exports = router;
