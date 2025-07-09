const express = require('express');
const router = express.Router();
const toolsCtrl = require('../controllers/toolsController');
const auth = require('../middleware/authMiddleware');

router.post('/',  toolsCtrl.createTools);
router.get('/',  toolsCtrl.getAllAvailableTools);
router.get('/all',  toolsCtrl.getAllTools);
router.post('/:id/buy',  toolsCtrl.buyTools);

module.exports = router;
