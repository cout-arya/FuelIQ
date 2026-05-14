const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, index: true },
    password: { type: String },

    // FuelIQ Nutrition Profile
    profile: {
        age: Number,
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        height: Number, // cm
        weight: Number, // kg
        activityLevel: {
            type: String,
            enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
            default: 'moderately_active'
        },
        trainingSchedule: {
            daysPerWeek: { type: Number, default: 4, min: 0, max: 7 },
            timing: { type: String, enum: ['morning', 'evening', 'varies'], default: 'evening' }
        },
        dietaryProfile: {
            type: String,
            enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan'],
            default: 'non_vegetarian'
        },
        regionalCuisine: {
            type: String,
            enum: ['north_indian', 'south_indian', 'bengali', 'gujarati', 'no_preference'],
            default: 'no_preference'
        },
        goal: {
            type: String,
            enum: ['muscle_gain', 'fat_loss', 'maintenance', 'endurance'],
            default: 'maintenance'
        },
        budgetTier: {
            type: String,
            enum: ['150', '300', '500', 'no_constraint'],
            default: '300'
        }
    },

    // Streak tracking — single streak, never notification-pushed
    streak: {
        count: { type: Number, default: 0 },
        lastLogDate: { type: Date }
    },

    // Onboarding state
    onboardingComplete: { type: Boolean, default: false },

    // Notification preferences — both opt-in, max 2 types per PRD
    notificationPrefs: {
        dailyMealPlan: { type: Boolean, default: false },
        weeklySummary: { type: Boolean, default: false }
    },

    // Cached TDEE for quick macro target access
    tdee: { type: Number }
}, { timestamps: true });

/**
 * Calculate TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor
 * This is the gold standard equation used by actual dietitians
 */
UserSchema.methods.calculateTDEE = function () {
    const { age, gender, height, weight, activityLevel } = this.profile || {};
    if (!age || !height || !weight) return null;

    // Mifflin-St Jeor BMR
    let bmr;
    if (gender === 'Female') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    }

    // Activity multipliers
    const multipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725
    };

    const multiplier = multipliers[activityLevel] || 1.55;
    return Math.round(bmr * multiplier);
};

/**
 * Get macro targets based on goal
 * Returns { calories, protein, carbs, fats } in grams
 */
UserSchema.methods.getMacroTargets = function (isTrainingDay = true) {
    const tdee = this.calculateTDEE();
    if (!tdee) return null;

    const { goal } = this.profile || {};
    const weight = this.profile?.weight || 70;

    let calories, proteinPerKg, carbPercent, fatPercent;

    switch (goal) {
        case 'muscle_gain':
            calories = tdee + 300; // Slight surplus
            proteinPerKg = 2.0;
            carbPercent = 0.45;
            fatPercent = 0.25;
            break;
        case 'fat_loss':
            calories = tdee - 400; // Moderate deficit
            proteinPerKg = 2.2; // Higher protein to preserve muscle
            carbPercent = 0.35;
            fatPercent = 0.30;
            break;
        case 'endurance':
            calories = tdee + 200;
            proteinPerKg = 1.6;
            carbPercent = 0.55;
            fatPercent = 0.20;
            break;
        default: // maintenance
            calories = tdee;
            proteinPerKg = 1.8;
            carbPercent = 0.40;
            fatPercent = 0.30;
    }

    // Training day adjustment: +15% carbs, -10% fats on training days
    if (!isTrainingDay) {
        calories -= 150;
        carbPercent -= 0.05;
        fatPercent += 0.05;
    }

    const protein = Math.round(weight * proteinPerKg);
    const proteinCalories = protein * 4;
    const remainingCalories = calories - proteinCalories;
    const carbs = Math.round((remainingCalories * carbPercent) / 4);
    const fats = Math.round((remainingCalories * fatPercent) / 9);

    return {
        calories: Math.round(calories),
        protein,
        carbs,
        fats
    };
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Auto-calculate TDEE on profile save
UserSchema.pre('save', function (next) {
    if (this.isModified('profile')) {
        this.tdee = this.calculateTDEE();
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
