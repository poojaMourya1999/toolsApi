// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['TOOL_ADDED', 'EXCHANGE_REQUEST', 'ORDER_RECEIVED', 'OTHER','ORDER_CREATED'] 
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedEntityModel'
  },
  relatedEntityModel: {
    type: String,
    enum: ['Tool', 'Exchange', 'Order']
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);