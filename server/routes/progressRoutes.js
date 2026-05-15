const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    logWeight,
    getWeightHistory,
    getWeeklyProgress,
    getStreak,
    getSummary
} = require('../controllers/progressController');

router.post('/weight', protect, logWeight);
router.get('/weight', protect, getWeightHistory);
router.get('/weekly', protect, getWeeklyProgress);
router.get('/streak', protect, getStreak);
router.get('/summary', protect, getSummary);

module.exports = router;
