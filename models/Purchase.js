// models/Purchase.js
const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  tool: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tools',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: String,
  transactionId: String
}, { timestamps: true });

module.exports = mongoose.model('Purchase', PurchaseSchema);