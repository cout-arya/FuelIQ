const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    generateMealPlan,
    getTodayPlan,
    regenerateMeal,
    getCurrentPlan,
    regenerateMealById
} = require('../controllers/aiController');

router.post('/generate', protect, generateMealPlan);
router.get('/today', protect, getTodayPlan);
router.get('/current', protect, getCurrentPlan);
router.post('/regenerate-meal', protect, regenerateMeal);
router.post('/:planId/regenerate-meal', protect, regenerateMealById);

module.exports = router;
