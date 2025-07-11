const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware,  notificationCtrl.getNotifications);

module.exports = router;
