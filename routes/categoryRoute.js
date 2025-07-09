const express = require('express');
const CategoryEnum = require('../config/categoryEnum');
const router = express.Router();

// ✅ Define route correctly
router.get('/categories', (req, res) => {
  res.json(Object.values(CategoryEnum));
});

// ✅ Export the router correctly
module.exports = router;
