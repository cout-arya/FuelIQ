const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true
    },
    weight: {
        type: Number,
        required: true,
        min: 20,
        max: 300
    }
}, { timestamps: true });

// One weight entry per user per day
WeightLogSchema.index({ userId: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('WeightLog', WeightLogSchema);
