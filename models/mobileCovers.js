const mongoose = require('mongoose');

const mobileCoverSchema = new mongoose.Schema({
  company: { type: String, required: true },
  model: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('MobileCover', mobileCoverSchema);
