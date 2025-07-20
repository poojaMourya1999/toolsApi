const mongoose = require('mongoose');
const Tools = require('../models/Tools');
const Cart = require('../models/Cart');
const Purchase = require('../models/Purchase')
const sendNotification = require('../utils/sendNotification');
const getToolsWithCartStatus = require('../utils/getToolsWithCartStatus');
const Razorpay = require('razorpay');
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


// 1. Create tool
exports.createTools = async (req, res) => {
  try {
    const { name, description, price, photo, quantity } = req.body;
    // Create the tool with the current user's ID and provided quantity (or default to 1)
    let tools = await Tools.create({
      name,
      description,
      price,
      photo,
      quantity: quantity || 1,
      owner: req.user._id,
    });

    // Populate owner details (name, email, etc.)
    tools = await tools.populate('owner', 'name email');
    res.status(201).json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Update tool (unchanged)
exports.updateTool = async (req, res) => {
  try {
    const { id } = req.params;
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

// 3. Get tools listed by current user
exports.getMyTools = async (req, res) => {
  try {
    const tools = await Tools.find({ owner: req.user._id }).populate('owner', 'name email');
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Get all tools (admin or for listing)
exports.getAllTools = async (req, res) => {
  try {
    const tools = await Tools.find().populate('owner', 'name email');
    const result = await getToolsWithCartStatus(tools, req.user?._id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 5. Get available tools (excluding current user’s tools)
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

// 6. Delete tool by ID
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

// 7. Buy a tool with quantity adjustment
// exports.buyTool = async (req, res) => {
//   try {
//     const toolId = req.params.id;
//     // Allow client to send a quantity to purchase; default to 1 if not provided
//     const purchaseQuantity = req.body.quantity ? Number(req.body.quantity) : 1;

//     const tool = await Tools.findById(toolId);
//     if (!tool || tool.status !== 'available') {
//       return res.status(400).json({ error: 'Tool not available' });
//     }
//     if (tool.owner.equals(req.user._id)) {
//       return res.status(403).json({ error: 'Cannot buy your own tool' });
//     }
//     // Check if enough quantity is available
//     if (tool.quantity < purchaseQuantity) {
//       return res.status(400).json({ error: 'Not enough stock available' });
//     }

//     // Decrease the stock by the purchased quantity
//     tool.quantity -= purchaseQuantity;
//     // If no stock remains, mark the tool as sold and set buyer
//     if (tool.quantity <= 0) {
//       tool.status = 'sold';
//       tool.buyer = req.user._id;
//     }
//     await tool.save();

//     const toolUrl = `/tools/${toolId}`;  // or your actual tool URL pattern

//     // Send notifications
//     await sendNotification(
//       tool.owner,
//       'Tool Sold',
//       `Your tool has been purchased. View: ${toolUrl}`
//     );
//     await sendNotification(
//       req.user._id,
//       'Purchase Successful',
//       `You bought a tool. View: ${toolUrl}`
//     );

//     res.json({
//       message: `Tool purchased successfully (Quantity: ${purchaseQuantity})`,
//       url: toolUrl
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.buyTool = async (req, res) => {
  try {
    const { toolId } = req.params;
    const { quantity, paymentId, orderId } = req.body;
    const userId = req.user._id;

    // Verify payment with Razorpay
    const payment = await instance.payments.fetch(paymentId);
    if (payment.status !== 'captured') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Process the purchase
    const tool = await Tools.findById(toolId);
    tool.quantity -= quantity;
    if (tool.quantity <= 0) {
      tool.status = 'sold';
      tool.buyer = userId;
    }
    await tool.save();

    // Create purchase record
    const purchase = await Purchase.create({
      tool: toolId,
      buyer: userId,
      seller: tool.owner,
      quantity,
      price: tool.price * quantity,
      paymentMethod: 'razorpay',
      transactionId: paymentId,
      status: 'completed'
    });

    res.json({
      message: 'Purchase completed successfully',
      purchase
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 8. Change tool status (manual toggle)
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

// 9. Add to Cart with quantity support
// Updated addToCart with proper conflict handling
exports.addToCart = async (req, res) => {
  try {
    const { toolId, quantity } = req.body;

    if (!toolId) {
      return res.status(400).json({ error: 'toolId is required' });
    }

    // Check if already in cart first
    const existingCartItem = await Cart.findOne({
      user: req.user._id,
      tool: toolId
    });

    if (existingCartItem) {
      return res.status(409).json({
        error: 'Tool already in cart',
        cartItemId: existingCartItem._id,
      });
    }

    // Rest of your addToCart logic...
    const requestedQuantity = quantity && quantity > 0 ? Number(quantity) : 1;
    const tool = await Tools.findById(toolId);

    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    if (tool.quantity < requestedQuantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }

    const cartItem = await Cart.create({
      user: req.user._id,
      tool: toolId,
      quantity: requestedQuantity
    });

    // Get updated status
    const tools = await Tools.find().populate('owner', 'name email');
    const result = await getToolsWithCartStatus(tools, req.user._id);

    return res.status(201).json({
      message: 'Added to cart successfully',
      cartItem,
      updatedTools: result
    });

  } catch (err) {
    console.error('Cart error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Updated removeFromCart
// 10. Remove tools from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({ error: 'Invalid cart item ID' });
    }

    const deletedItem = await Cart.findOneAndDelete({
      _id: cartItemId,
      user: req.user._id
    });

    if (!deletedItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Get updated status
    const tools = await Tools.find().populate('owner', 'name email');
    const result = await getToolsWithCartStatus(tools, req.user._id);

    res.json({
      message: 'Removed from cart successfully',
      deletedItem,
      updatedTools: result
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 11. Get Cart List (no changes needed here)
exports.getCartList = async (req, res) => {
  try {
    const userId = req.user._id;

    const cartItems = await Cart.find({ user: userId })
      .populate({
        path: 'tool',
        match: { _id: { $exists: true } } // Ignore invalid references
      })
      .lean();

    // Filter out items with invalid tools
    const validItems = cartItems.filter(item => item.tool !== null);

    res.status(200).json(validItems);
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart items'
    });
  }
};
// 12. get tool by id
exports.getToolById = async (req, res) => {
  try {
    const tool = await Tools.findById(req.params.id)
      .populate('owner', 'name email')
      .lean();                               // Convert to plain JS object

    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }

    // For authenticated users, check if tool is in their cart
    if (req.user) {
      const cartItem = await Cart.findOne({
        user: req.user._id,
        tool: tool._id
      });
      tool.inCart = !!cartItem;
      tool.cartItemId = cartItem?._id || null;
    }

    res.status(200).json({
      success: true,
      data: tool
    });

  } catch (err) {
    console.error(`Error getting tool ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
// 13. create order 
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

