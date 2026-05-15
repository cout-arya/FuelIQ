const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
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
router.get('/log/today', protect, getTodayLog);
router.get('/logs', protect, getMealLogs);
router.get('/logs/weekly', protect, getWeeklyLogs);
router.delete('/log/:id', protect, deleteMealLog);
router.delete('/logs/:id', protect, deleteMealLog);
router.get('/search', searchDish);
router.get('/dish/:id', getDishById);

module.exports = router;
