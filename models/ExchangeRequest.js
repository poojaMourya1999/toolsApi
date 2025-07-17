const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toolsRequested: { type: mongoose.Schema.Types.ObjectId, ref: 'Tools', required: true },
  toolsOffered: { type: mongoose.Schema.Types.ObjectId, ref: 'Tools', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
