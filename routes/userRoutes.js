const express = require('express');
const {
  registerUser,
  loginUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  updateUser,
  getUserById,
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.delete('/:id', authMiddleware, deleteUser);
router.put('/:id', authMiddleware, updateUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/user/:id',authMiddleware, getUserById);

module.exports = router;
