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

router.get('/', getAllMobileCovers);
router.get('/filter', getMobileCoversByFilter);
router.post('/', addMobileCover);
router.put('/', updateMobileCoverImage);
router.delete('/image', deleteCoverImage);
router.delete('/', deleteCovers);

module.exports = router;
