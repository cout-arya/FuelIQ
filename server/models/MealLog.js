const mongoose = require('mongoose');

const MealLogSchema = new mongoose.Schema({
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
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'snack', 'dinner', 'other'],
        required: true
    },

    // Original user input — preserved for transparency
    rawInput: { type: String, required: true },

    // Parsed food items with RAG-verified nutrition data
    parsedItems: [{
        foodName: { type: String, required: true },
        quantity: { type: String }, // e.g., "2 rotis", "1 bowl"
        quantityGrams: { type: Number }, // normalized weight
        portionTier: {
            type: String,
            enum: ['home', 'restaurant', 'dhaba', 'street', 'dabba', 'generic'],
            default: 'home'
        },
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 },
        fibre: { type: Number, default: 0 },

        // RAG traceability — every number has a source
        ragSourceId: { type: String }, // ICMR/NIN entry ID
        confidenceScore: { type: Number, min: 0, max: 1 }
    }],

    // Aggregated totals for quick queries
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFats: { type: Number, default: 0 },
    totalFibre: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for efficient daily lookups
MealLogSchema.index({ userId: 1, date: 1 });

// Pre-save: auto-calculate totals from parsed items
MealLogSchema.pre('save', function (next) {
    if (this.parsedItems && this.parsedItems.length > 0) {
        this.totalCalories = this.parsedItems.reduce((sum, item) => sum + (item.calories || 0), 0);
        this.totalProtein = this.parsedItems.reduce((sum, item) => sum + (item.protein || 0), 0);
        this.totalCarbs = this.parsedItems.reduce((sum, item) => sum + (item.carbs || 0), 0);
        this.totalFats = this.parsedItems.reduce((sum, item) => sum + (item.fats || 0), 0);
        this.totalFibre = this.parsedItems.reduce((sum, item) => sum + (item.fibre || 0), 0);
    }
    next();
});

module.exports = mongoose.model('MealLog', MealLogSchema);
