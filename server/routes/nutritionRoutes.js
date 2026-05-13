const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    logMeal,
    getMealLogs,
    getWeeklyLogs,
    deleteMealLog
} = require('../controllers/aiController');

router.post('/log', protect, logMeal);
router.get('/logs', protect, getMealLogs);
router.get('/logs/weekly', protect, getWeeklyLogs);
router.delete('/logs/:id', protect, deleteMealLog);

module.exports = router;
