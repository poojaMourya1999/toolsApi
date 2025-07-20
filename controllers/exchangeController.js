// // controllers/exchangeController.js
const ExchangeRequest = require('../models/ExchangeRequest');
const Tools = require('../models/Tools');
const sendNotification = require('../utils/sendNotification');

exports.createExchangeRequest = async (req, res) => {
  try {
    const { toolsRequestedId, toolsOfferedId } = req.body;

    const toolsRequested = await Tools.findById(toolsRequestedId);
    const toolsOffered = await Tools.findById(toolsOfferedId);

    if (!toolsRequested || !toolsOffered) {
      return res.status(404).json({ error: 'One or both tools not found' });
    }

    if (toolsRequested.owner.equals(req.user._id)) {
      return res.status(400).json({ error: 'Cannot request exchange with your own tool' });
    }

    const exchange = await ExchangeRequest.create({
      requester: req.user._id,
      receiver: toolsRequested.owner,
      toolsRequested,
      toolsOffered,
    });

    // Change tool statuses
    await Tools.findByIdAndUpdate(toolsRequestedId, { status: 'pending_exchange' });
    await Tools.findByIdAndUpdate(toolsOfferedId, { status: 'pending_exchange' });

    // 🔔 Send notification
    await sendNotification(
      toolsRequested.owner,
      'Exchange Request',
      `User ${req.user.name} wants to exchange a tool with you.`
    );
    
    res.status(201).json({ message: 'Exchange request sent', exchange });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExchangeList = async (req, res) => {
  try {
    const userId = req.user._id;

    const exchanges = await ExchangeRequest.find({
      $or: [
        { requester: userId },
        { receiver: userId }
      ]
    })
    .populate('requester', 'name email')
    .populate('receiver', 'name email')
    .populate('toolsRequested', 'name photo description status') // Only include necessary fields
    .populate('toolsOffered', 'name photo description status')  // Only include necessary fields
    .sort({ createdAt: -1 });

    // Format the response to clearly show which exchanges are incoming vs outgoing
    const formattedExchanges = exchanges.map(exchange => {
      const isRequester = exchange.requester._id.equals(userId);
      return {
        ...exchange.toObject(),
        type: isRequester ? 'outgoing' : 'incoming',
        otherParty: isRequester ? exchange.receiver : exchange.requester
      };
    });

    res.json({
      success: true,
      count: exchanges.length,
      exchanges: formattedExchanges
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch exchanges',
      message: err.message 
    });
  }
};

// controllers/exchangeController.js

exports.updateExchangeStatus = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const { status } = req.body;

    const validStatuses = ['accepted', 'rejected', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const exchange = await ExchangeRequest.findById(exchangeId)
      .populate('requester', 'name email')
      .populate('receiver', 'name email')
      .populate('toolsRequested')
      .populate('toolsOffered');

    if (!exchange) {
      return res.status(404).json({ error: 'Exchange not found' });
    }

    // Only the receiver or requester can update the status
    const userId = req.user._id;
    if (!exchange.receiver.equals(userId) && !exchange.requester.equals(userId)) {
      return res.status(403).json({ error: 'Not authorized to update this exchange' });
    }

    // Update exchange status
    exchange.status = status;
    await exchange.save();

    // Optional: update tool statuses based on the exchange status
    if (status === 'accepted') {
      await Tools.findByIdAndUpdate(exchange.toolsRequested._id, { status: 'exchanged' });
      await Tools.findByIdAndUpdate(exchange.toolsOffered._id, { status: 'exchanged' });
    } else if (status === 'rejected' || status === 'cancelled') {
      await Tools.findByIdAndUpdate(exchange.toolsRequested._id, { status: 'available' });
      await Tools.findByIdAndUpdate(exchange.toolsOffered._id, { status: 'available' });
    }

    // Determine the other party and send notification
    const isRequester = exchange.requester._id.equals(userId);
    const otherUser = isRequester ? exchange.receiver : exchange.requester;

    await sendNotification(
      otherUser._id,
      'Exchange Status Updated',
      `Your exchange request has been ${status} by ${req.user.name}.`
    );

    res.json({ success: true, message: `Exchange ${status} successfully`, exchange });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

