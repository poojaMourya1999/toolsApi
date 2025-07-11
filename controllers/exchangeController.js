// // controllers/exchangeController.js
const ExchangeRequest = require('../models/ExchangeRequest');
const Tools = require('../models/Tools');
const sendNotification = require('../utils/sendNotification');

// exports.createExchangeRequest = async (req, res) => {
//   try {
//     const { toolsRequestedId, toolsOfferedId } = req.body;

//     const toolsRequested = await Tools.findById(toolsRequestedId);
//     const toolsOffered = await Tools.findById(toolsOfferedId);

//     if (!toolsRequested || !toolsOffered) {
//       return res.status(404).json({ error: 'One or both tools not found' });
//     }

//     if (toolsRequested.owner.equals(req.user._id)) {
//       return res.status(400).json({ error: 'You cannot request exchange for your own tool' });
//     }

//     // Create exchange request
//     const exchange = await ExchangeRequest.create({
//       requester: req.user._id,
//       receiver: toolsRequested.owner,
//       toolsRequested: toolsRequestedId,
//       toolsOffered: toolsOfferedId,
//     });

//     // Optionally mark both tools as 'pending_exchange'
//     await Tools.findByIdAndUpdate(toolsRequestedId, { status: 'pending_exchange' });
//     await Tools.findByIdAndUpdate(toolsOfferedId, { status: 'pending_exchange' });

//     res.status(201).json({ message: 'Exchange request sent', exchange });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

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
