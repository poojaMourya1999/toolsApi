const Razorpay = require('razorpay');
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    const { toolId, quantity, amount } = req.body;
    
    // Validate tool availability
    const tool = await Tools.findById(toolId);
    if (!tool || tool.status !== 'available' || tool.quantity < quantity) {
      return res.status(400).json({ error: 'Tool not available' });
    }

    // Create Razorpay order
    const order = await instance.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `order_${toolId}_${Date.now()}`
    });

    res.json({
      orderId: order.id,
      amount: order.amount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};