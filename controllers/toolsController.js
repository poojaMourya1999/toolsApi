const Tools = require('../models/Tools');

// 1. Create tool
exports.createTools = async (req, res) => {
  try {
    const { name, description, price, photo } = req.body;

    // Create the tool with the current user's ID
    let tools = await Tools.create({
      name,
      description,
      price,
      photo,
      owner: req.user._id, // ✅ Assumes auth middleware sets req.user
    });

    // Populate owner details (name, email etc.)
    tools = await tools.populate('owner', 'name email');

    res.status(201).json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/toolsController.js

exports.updateTool = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the tool exists and belongs to the logged-in user
    const tool = await Tools.findById(id);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    if (!tool.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized: Not your tool' });
    }

    const updates = req.body;

    const updatedTool = await Tools.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ message: 'Tool updated successfully', updatedTool });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 2. Get tools listed by current user
exports.getMyTools = async (req, res) => {
  try {
    const tools = await Tools.find({ owner: req.user._id }).populate('owner', 'name email');
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get all tools (admin or for listing)
exports.getAllTools = async (req, res) => {
  try {
    const tools = await Tools.find().populate('owner', 'name email');
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Get available tools (excluding current user’s tools)
exports.getAvailableTools = async (req, res) => {
  try {
    const tools = await Tools.find({
      owner: { $ne: req.user._id },
      status: 'available'
    }).populate('owner', 'name');
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Delete tool by ID
exports.deleteTool = async (req, res) => {
  try {
    const tool = await Tools.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!tool) return res.status(404).json({ error: 'Tool not found or unauthorized' });
    res.json({ message: 'Tool deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Buy a tool
exports.buyTool = async (req, res) => {
  try {
    const tool = await Tools.findById(req.params.id);

    if (!tool || tool.status !== 'available') {
      return res.status(400).json({ error: 'Tool not available for purchase' });
    }

    if (tool.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'You cannot buy your own tool' });
    }

    tool.status = 'sold';
    tool.buyer = req.user._id; // ✅ optional, to log buyer
    await tool.save();

    res.json({ message: 'Tool purchased successfully', tool });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 7. Change tool status (manual toggle)
exports.changeToolStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'pending_exchange', 'sold'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedTool = await Tools.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true }
    );

    if (!updatedTool) return res.status(404).json({ error: 'Tool not found or unauthorized' });

    res.json({ message: 'Status updated', tool: updatedTool });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
