const express = require('express');
const router = express.Router();
const exchangeCtrl = require('../controllers/exchangeController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth.authMiddleware, exchangeCtrl.createExchangeRequest);
router.get('/', auth.authMiddleware, exchangeCtrl.getExchangeList);
router.put('/status/:id', auth.authMiddleware, exchangeCtrl.updateExchangeStatus);

module.exports = router;
