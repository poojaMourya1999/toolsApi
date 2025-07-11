const Tools = require('../models/Tools');

exports.createTools = async (req, res) => {
    try {
        // req.user = { _id: '6843e5e4180cac61ccdf77ec' };
        const { name, description, price, photo } = req.body;
        const tools = await Tools.create({
            name,
            description,
            price,
            photo,
            owner: req.user._id,
        });
        res.status(201).json(tools);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllAvailableTools = async (req, res) => {
    try {
        // req.user = { _id: '6843e5e4180cac61ccdf77ec' };
        const tools = await Tools.find({
            owner: { $ne: req.user._id },
            status: 'available'
        }).populate('owner', 'name');
        res.json(tools);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.buyTools = async (req, res) => {
    try {
        const tools = await Tools.findById(req.params.id);
        if (!tools || tools.status !== 'available') {
            return res.status(400).json({ error: 'tools not available' });
        }
        if (tools.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Cannot buy your own tools' });
        }
        tools.status = 'sold';
        await tools.save();
        res.json({ message: 'tools purchased successfully', tools });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTools = async (req, res) => {
    try {
        const tools = await Tools.find()
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });
        res.json(tools);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


