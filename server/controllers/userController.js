const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { clearUserCache } = require('../utils/cacheHelpers');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        onboardingComplete: user.onboardingComplete,
        streak: user.streak,
        tdee: user.tdee,
        notificationPrefs: user.notificationPrefs,
        macroTargets: user.getMacroTargets(true)
    });
});

// @desc    Update user profile (body metrics, dietary prefs, etc.)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { name, profile, notificationPrefs } = req.body;

    if (name) user.name = name;

    if (profile) {
        // Merge profile fields — don't overwrite unset fields
        const fields = [
            'age', 'gender', 'height', 'weight', 'activityLevel',
            'dietaryProfile', 'regionalCuisine', 'goal', 'budgetTier'
        ];
        fields.forEach(field => {
            if (profile[field] !== undefined) {
                user.profile[field] = profile[field];
            }
        });

        if (profile.trainingSchedule) {
            if (!user.profile.trainingSchedule) user.profile.trainingSchedule = {};
            if (profile.trainingSchedule.daysPerWeek !== undefined) {
                user.profile.trainingSchedule.daysPerWeek = profile.trainingSchedule.daysPerWeek;
            }
            if (profile.trainingSchedule.timing !== undefined) {
                user.profile.trainingSchedule.timing = profile.trainingSchedule.timing;
            }
        }
    }

    if (notificationPrefs) {
        if (notificationPrefs.dailyMealPlan !== undefined) {
            user.notificationPrefs.dailyMealPlan = notificationPrefs.dailyMealPlan;
        }
        if (notificationPrefs.weeklySummary !== undefined) {
            user.notificationPrefs.weeklySummary = notificationPrefs.weeklySummary;
        }
    }

    user.markModified('profile');
    const updatedUser = await user.save();

    await clearUserCache(req.user._id, '/api/users/profile');

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile,
        onboardingComplete: updatedUser.onboardingComplete,
        streak: updatedUser.streak,
        tdee: updatedUser.tdee,
        notificationPrefs: updatedUser.notificationPrefs,
        macroTargets: updatedUser.getMacroTargets(true)
    });
});

// @desc    Complete onboarding
// @route   POST /api/users/complete-onboarding
// @access  Private
const completeOnboarding = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { profile } = req.body;

    // Set all profile fields from onboarding
    if (profile) {
        user.profile = { ...user.profile, ...profile };
    }

    user.onboardingComplete = true;
    user.markModified('profile');
    const updatedUser = await user.save();

    await clearUserCache(req.user._id, '/api/users/profile');

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile,
        onboardingComplete: updatedUser.onboardingComplete,
        streak: updatedUser.streak,
        tdee: updatedUser.tdee,
        macroTargets: updatedUser.getMacroTargets(true),
        token: req.headers.authorization?.split(' ')[1] // Return existing token
    });
});

// @desc    Delete account (full data purge)
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Per PRD: account deletion triggers full data purge
    const MealLog = require('../models/MealLog');
    const MealPlan = require('../models/MealPlan');
    const WeightLog = require('../models/WeightLog');

    await Promise.all([
        MealLog.deleteMany({ userId }),
        MealPlan.deleteMany({ userId }),
        WeightLog.deleteMany({ userId }),
        User.findByIdAndDelete(userId)
    ]);

    res.json({ message: 'Account and all data permanently deleted' });
});

module.exports = { getUserProfile, updateUserProfile, completeOnboarding, deleteAccount };
