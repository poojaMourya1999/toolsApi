const express = require('express');
const router = express.Router();
const {
  getAllMobileCovers,
  addMobileCover,
  getMobileCoversByFilter,
  updateMobileCoverImage,
  deleteCoverImage,
  deleteCovers
} = require('../controllers/mobileCoverController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAllMobileCovers);
router.get('/filter', authMiddleware, getMobileCoversByFilter);
router.post('/', authMiddleware, addMobileCover);
router.put('/', authMiddleware, updateMobileCoverImage);
router.delete('/image', authMiddleware, deleteCoverImage);
router.delete('/',authMiddleware, deleteCovers);

module.exports = router;
