const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.get('/',  notificationCtrl.getNotifications);

module.exports = router;
