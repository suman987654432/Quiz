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
});

module.exports = mongoose.model('Result', resultSchema); 