const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    logWeight,
    getWeightHistory,
    getWeeklyProgress,
    getStreak
} = require('../controllers/progressController');

router.post('/weight', protect, logWeight);
router.get('/weight', protect, getWeightHistory);
router.get('/weekly', protect, getWeeklyProgress);
router.get('/streak', protect, getStreak);

module.exports = router;
