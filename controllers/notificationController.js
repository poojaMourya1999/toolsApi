const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    // req.user = { _id: '6843e5e4180cac61ccdf77ec' };
    try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    res.json({ message: 'Marked as read', notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
