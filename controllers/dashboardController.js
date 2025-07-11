const Tools = require('../models/Tools');
const ExchangeRequest = require('../models/ExchangeRequest');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Tools listed by the user
    const userTools = await Tools.find({ owner: userId });

    // Exchange requests made by the user
    const exchangeRequests = await ExchangeRequest.find({ requester: userId })
      .populate('toolsRequested', 'name photo')
      .populate('toolsOffered', 'name photo')
      .populate('receiver', 'name');

    res.json({
      totalTools: userTools.length,
      totalExchangeRequests: exchangeRequests.length,
      tools: userTools,
      exchangeRequests,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
