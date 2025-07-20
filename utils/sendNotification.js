const Notification = require('../models/Notification');

const sendNotification = async (userId, title, message) => {
  await Notification.create({ user: userId, title, message });
};

module.exports = sendNotification;

