const Tools = require('../models/Tools');
const ExchangeRequest = require('../models/ExchangeRequest');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts in parallel for better performance
    const [userToolsCount, exchangeToolsCount, totalToolsCount] = await Promise.all([
      Tools.countDocuments({ owner: userId }),
      ExchangeRequest.countDocuments({ owner: userId }),
      Tools.countDocuments() // Or add any filter if needed for total tools
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