const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { exportJSON, exportCSV } = require('../controllers/exportController');

router.get('/json', protect, exportJSON);
router.post('/', protect, exportJSON);
router.get('/csv', protect, exportCSV);

module.exports = router;
