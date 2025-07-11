const express = require('express');
const router = express.Router();
const toolsCtrl = require('../controllers/toolsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, toolsCtrl.createTools);
router.get('/mine', authMiddleware, toolsCtrl.getMyTools);
router.get('/available', authMiddleware, toolsCtrl.getAvailableTools);
router.get('/', authMiddleware, toolsCtrl.getAllTools);
router.delete('/:id', authMiddleware, toolsCtrl.deleteTool);
router.put('/buy/:id', authMiddleware, toolsCtrl.buyTool);
router.put('/status/:id', authMiddleware, toolsCtrl.changeToolStatus);

module.exports = router;
