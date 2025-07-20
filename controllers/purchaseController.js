const Purchase = require('../models/Purchase')
// Get all purchases for a user
exports.getUserPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyer: req.user._id })
      .populate('tool')
      .populate('seller', 'name email');
      
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all sales for a user (tools they sold)
exports.getUserSales = async (req, res) => {
  try {
    const sales = await Purchase.find({ seller: req.user._id })
      .populate('tool')
      .populate('buyer', 'name email');
      
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};