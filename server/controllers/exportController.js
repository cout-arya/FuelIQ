const asyncHandler = require('express-async-handler');
const MealLog = require('../models/MealLog');
const MealPlan = require('../models/MealPlan');
const WeightLog = require('../models/WeightLog');
const User = require('../models/User');

// @desc    Export all user data as JSON
// @route   GET /api/export/json
// @access  Private
const exportJSON = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [user, mealLogs, mealPlans, weightLogs] = await Promise.all([
        User.findById(userId).select('-password'),
        MealLog.find({ userId }).sort({ date: -1 }),
        MealPlan.find({ userId }).sort({ date: -1 }),
        WeightLog.find({ userId }).sort({ date: -1 })
    ]);

    const exportData = {
        exportDate: new Date().toISOString(),
        app: 'FuelIQ',
        version: '1.0',
        user: {
            name: user.name,
            email: user.email,
            profile: user.profile,
            streak: user.streak,
            tdee: user.tdee,
            memberSince: user.createdAt
        },
        mealLogs: mealLogs.map(log => ({
            date: log.date,
            mealType: log.mealType,
            rawInput: log.rawInput,
            items: log.parsedItems,
            totals: {
                calories: log.totalCalories,
                protein: log.totalProtein,
                carbs: log.totalCarbs,
                fats: log.totalFats
            }
        })),
        mealPlans: mealPlans.map(plan => ({
            date: plan.date,
            targets: {
                calories: plan.targetCalories,
                protein: plan.targetProtein,
                carbs: plan.targetCarbs,
                fats: plan.targetFats
            },
            meals: plan.meals,
            isTrainingDay: plan.isTrainingDay
        })),
        weightHistory: weightLogs.map(w => ({
            date: w.date,
            weight: w.weight
        }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=fueliq_export_${new Date().toISOString().split('T')[0]}.json`);
    res.json(exportData);
});

// @desc    Export all user data as CSV
// @route   GET /api/export/csv
// @access  Private
const exportCSV = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const mealLogs = await MealLog.find({ userId }).sort({ date: 1 });

    // CSV headers
    let csv = 'Date,Meal Type,Food Input,Calories,Protein (g),Carbs (g),Fats (g),Fibre (g)\n';

    mealLogs.forEach(log => {
        const date = new Date(log.date).toISOString().split('T')[0];
        const input = log.rawInput.replace(/,/g, ';').replace(/"/g, "'");
        csv += `${date},${log.mealType},"${input}",${log.totalCalories},${log.totalProtein},${log.totalCarbs},${log.totalFats},${log.totalFibre}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=fueliq_meals_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
});

module.exports = { exportJSON, exportCSV };
