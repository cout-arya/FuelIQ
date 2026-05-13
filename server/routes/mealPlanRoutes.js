const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    generateMealPlan,
    getTodayPlan,
    regenerateMeal
} = require('../controllers/aiController');

router.post('/generate', protect, generateMealPlan);
router.get('/today', protect, getTodayPlan);
router.post('/regenerate-meal', protect, regenerateMeal);

module.exports = router;
