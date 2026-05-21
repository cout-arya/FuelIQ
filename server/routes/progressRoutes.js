const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { cacheRoute } = require('../middleware/cacheMiddleware');
const {
    logWeight,
    getWeightHistory,
    getWeeklyProgress,
    getStreak,
    getSummary
} = require('../controllers/progressController');

router.post('/weight', protect, logWeight);
router.get('/weight', protect, cacheRoute(3600), getWeightHistory);
router.get('/weekly', protect, cacheRoute(3600), getWeeklyProgress);
router.get('/streak', protect, cacheRoute(3600), getStreak);
router.get('/summary', protect, cacheRoute(3600), getSummary);

module.exports = router;
