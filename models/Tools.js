const mongoose = require('mongoose');

const toolsSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  photo:'String',
  status: { type: String, enum: ['available', 'pending_exchange', 'sold'], default: 'available' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Tools', toolsSchema);
