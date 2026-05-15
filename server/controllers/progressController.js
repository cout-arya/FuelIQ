const asyncHandler = require('express-async-handler');
const WeightLog = require('../models/WeightLog');
const MealLog = require('../models/MealLog');
const User = require('../models/User');

// @desc    Log weight
// @route   POST /api/progress/weight
// @access  Private
const logWeight = asyncHandler(async (req, res) => {
    const { weight } = req.body;

    if (!weight || weight < 20 || weight > 300) {
        res.status(400);
        throw new Error('Please provide a valid weight (20-300 kg)');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert — one entry per day
    const log = await WeightLog.findOneAndUpdate(
        { userId: req.user._id, date: today },
        { userId: req.user._id, date: today, weight },
        { upsert: true, new: true }
    );

    // Also update user profile weight
    await User.findByIdAndUpdate(req.user._id, {
        'profile.weight': weight
    });

    res.json(log);
});

// @desc    Get weight history (last 30 days)
// @route   GET /api/progress/weight
// @access  Private
const getWeightHistory = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const logs = await WeightLog.find({
        userId: req.user._id,
        date: { $gte: startDate }
    }).sort({ date: 1 });

    res.json(logs);
});

// @desc    Get weekly macro adherence
// @route   GET /api/progress/weekly
// @access  Private
const getWeeklyProgress = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const mealLogs = await MealLog.find({
        userId: req.user._id,
        date: { $gte: weekAgo }
    });

    // Group by day
    const dailyData = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekAgo);
        d.setDate(d.getDate() + i);
        const dateKey = d.toISOString().split('T')[0];

        const dayLogs = mealLogs.filter(log => {
            const logDate = new Date(log.date).toISOString().split('T')[0];
            return logDate === dateKey;
        });

        dailyData.push({
            date: dateKey,
            dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
            calories: dayLogs.reduce((s, l) => s + l.totalCalories, 0),
            protein: dayLogs.reduce((s, l) => s + l.totalProtein, 0),
            carbs: dayLogs.reduce((s, l) => s + l.totalCarbs, 0),
            fats: dayLogs.reduce((s, l) => s + l.totalFats, 0),
            mealCount: dayLogs.length
        });
    }

    const user = await User.findById(req.user._id);
    const targets = user?.getMacroTargets(true) || null;

    res.json({ dailyData, targets, streak: user?.streak });
});

// @desc    Get streak data
// @route   GET /api/progress/streak
// @access  Private
const getStreak = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({
        count: user?.streak?.count || 0,
        lastLogDate: user?.streak?.lastLogDate || null
    });
});

// @desc    Get progress summary
// @route   GET /api/progress/summary
// @access  Private
const getSummary = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const logs = await MealLog.find({ userId: req.user._id });
    
    let currentStreak = 0;
    if (logs.length > 0) {
        currentStreak = user?.streak?.count || 1;
    }

    res.json({
        weeklyAdherence: 85,
        weightTrend: -2,
        currentStreak
    });
});

module.exports = { logWeight, getWeightHistory, getWeeklyProgress, getStreak, getSummary };
