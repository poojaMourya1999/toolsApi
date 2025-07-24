const Tools = require('../models/Tools');
const ExchangeRequest = require('../models/ExchangeRequest');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [userToolsCount, exchangeToolsCount, totalToolsCount] = await Promise.all([
      Tools.countDocuments({ owner: userId }),
      ExchangeRequest.countDocuments({
        $or: [
          { requester: userId },
          { receiver: userId }
        ]
      }),
      Tools.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        totalTools: totalToolsCount,
        exchangeTools: exchangeToolsCount,
        userTools: userToolsCount
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch dashboard stats',
      message: error.message 
    });
  }
};
