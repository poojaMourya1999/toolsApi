const express = require('express');
const {
  registerUser,
  loginUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  updateUser,
} = require('../controllers/userController');

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.delete('/:id', deleteUser);
router.put('/:id', updateUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
