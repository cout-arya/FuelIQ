const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { cacheRoute } = require('../middleware/cacheMiddleware');
const {
    logMeal,
    getMealLogs,
    getWeeklyLogs,
    deleteMealLog,
    searchDish,
    getDishById,
    getTodayLog
} = require('../controllers/aiController');

router.post('/log', protect, logMeal);
router.get('/log/today', protect, cacheRoute(3600), getTodayLog);
router.get('/logs', protect, cacheRoute(3600), getMealLogs);
router.get('/logs/weekly', protect, cacheRoute(3600), getWeeklyLogs);
router.delete('/log/:id', protect, deleteMealLog);
router.delete('/logs/:id', protect, deleteMealLog);
router.get('/search', searchDish);
router.get('/dish/:id', getDishById);

module.exports = router;
