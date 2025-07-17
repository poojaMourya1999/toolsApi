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

// Update Exchange Status
exports.updateExchangeStatus = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // ✅ 1. Validate incoming status
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // ✅ 2. Find exchange by ID with required tool info
    const exchange = await ExchangeRequest.findById(exchangeId)
      .populate('toolsRequested')
      .populate('toolsOffered');

    if (!exchange) {
      return res.status(404).json({ error: 'Exchange request not found' });
    }

    // ✅ 3. Check if current user is the rightful receiver
    if (!exchange.receiver.equals(userId)) {
      return res.status(403).json({ error: 'Only the receiver can update the status' });
    }

    // ✅ 4. Update exchange status
    exchange.status = status;
    await exchange.save();

    const toolsRequestedId = exchange.toolsRequested._id;
    const toolsOfferedId = exchange.toolsOffered._id;

    // ✅ 5. Handle tool status updates based on exchange status
    if (status === 'accepted') {
      await Tools.findByIdAndUpdate(toolsRequestedId, {
        status: 'exchanged',
        buyer: exchange.requester
      });
      await Tools.findByIdAndUpdate(toolsOfferedId, {
        status: 'exchanged',
        buyer: exchange.receiver
      });

      // 🔔 Notify requester
      await sendNotification(
        exchange.requester,
        'Exchange Accepted',
        `Your exchange request has been accepted by ${req.user.name}`
      );

    } else if (status === 'rejected') {
      await Tools.findByIdAndUpdate(toolsRequestedId, {
        status: 'available',
        buyer: null
      });
      await Tools.findByIdAndUpdate(toolsOfferedId, {
        status: 'available',
        buyer: null
      });

      // 🔔 Notify requester
      await sendNotification(
        exchange.requester,
        'Exchange Rejected',
        `Your exchange request has been rejected by ${req.user.name}`
      );

    } else if (status === 'pending') {
      await Tools.findByIdAndUpdate(toolsRequestedId, {
        status: 'pending_exchange'
      });
      await Tools.findByIdAndUpdate(toolsOfferedId, {
        status: 'pending_exchange'
      });
    }

    // ✅ 6. Respond with success
    res.json({
      message: `Exchange status updated to '${status}'`,
      exchange
    });

  } catch (err) {
    console.error('Exchange status update error:', err);
    res.status(500).json({ error: 'Server error occurred' });
  }
};
