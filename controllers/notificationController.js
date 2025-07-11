const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    // req.user = { _id: '6843e5e4180cac61ccdf77ec' };
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};