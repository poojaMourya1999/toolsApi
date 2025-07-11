require('dotenv').config();
// const jwt = require('jsonwebtoken');

// exports.authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer '))
//     return res.status(401).json({ error: 'No token provided' });

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user info to request
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };





// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Your JWT secret
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user; // ✅ Now req.user is available in controllers
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
