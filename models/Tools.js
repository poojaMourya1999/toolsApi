const mongoose = require('mongoose');

const toolsSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  type: { type: String, enum: ['sell', 'exchange'] },
  status: { type: String, enum: ['available', 'pending_exchange', 'sold'], default: 'available' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Tools', toolsSchema);
