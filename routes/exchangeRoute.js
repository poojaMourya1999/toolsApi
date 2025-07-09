const express = require('express');
const router = express.Router();
const exchangeCtrl = require('../controllers/exchangeController');
const auth = require('../middleware/authMiddleware');

router.post('/',  exchangeCtrl.createExchangeRequest);

module.exports = router;
