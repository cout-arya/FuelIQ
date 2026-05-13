const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },

    // Macro targets for this plan
    targetCalories: { type: Number, required: true },
    targetProtein: { type: Number, required: true },
    targetCarbs: { type: Number, required: true },
    targetFats: { type: Number, required: true },

    // The 4-meal plan
    meals: [{
        mealType: {
            type: String,
            enum: ['breakfast', 'lunch', 'snack', 'dinner'],
            required: true
        },
        foodName: { type: String, required: true },
        description: { type: String }, // Detailed suggestion
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 },
        ragSourceId: { type: String },
        regenerateCount: { type: Number, default: 0 }
    }],

    // Context
    isTrainingDay: { type: Boolean, default: true },
    regionalCuisine: { type: String },
    budgetTier: { type: String },

    // 24h cache — plans expire and can be regenerated
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        index: { expires: 0 } // MongoDB TTL index
    }
}, { timestamps: true });

// Compound index for fetching today's plan
MealPlanSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('MealPlan', MealPlanSchema);
