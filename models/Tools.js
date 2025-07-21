const mongoose = require('mongoose');

const toolsSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  photo: String, // fixed
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [0, 'Quantity cannot be negative'],
  },
  status: {
    type: String,
    enum: ['available', 'pending_exchange', 'sold'],
    default: 'available'
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Tools', toolsSchema);
