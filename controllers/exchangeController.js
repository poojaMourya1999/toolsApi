const ExchangeRequest = require('../models/ExchangeRequest');
const tools = require('../models/Tools');
const sendNotification = require('../utils/sendNotification');

exports.createExchangeRequest = async (req, res) => {
  try {
    const { toolsRequestedId, toolsOfferedId } = req.body;
    const toolsRequested = await tools.findById(toolsRequestedId);
    const toolsOffered = await tools.findById(toolsOfferedId);

    if (!toolsRequested || !toolsOffered || toolsRequested.owner.equals(req.user._id)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // req.user = { _id: '6843e5e4180cac61ccdf77ec' };

    const exchange = await ExchangeRequest.create({
      requester: req.user._id,
      receiver: toolsRequested.owner,
      toolsRequested,
      toolsOffered,
    });

    await tools.findByIdAndUpdate(toolsRequestedId, { status: 'pending_exchange' });
    await tools.findByIdAndUpdate(toolsOfferedId, { status: 'pending_exchange' });

    await sendNotification(toolsRequested.owner, 'Exchange Request', `User ${req.user.name} wants to exchange a tools with you.`);

    res.status(201).json({ message: 'Exchange request sent', exchange });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
