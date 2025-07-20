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

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.delete('/:id', deleteUser);
router.put('/:id', updateUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/user/:id', getUserById);

module.exports = router;
