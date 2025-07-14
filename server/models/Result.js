const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    user: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    subject: {
        type: String,
        required: true,
        default: 'General'
    },
    score: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    answers: [{
        question: String,
        userAnswer: String,
        correctAnswer: String,
        correct: Boolean
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure unique results for the same user within a short period
resultSchema.index({ 'user.email': 1, createdAt: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);