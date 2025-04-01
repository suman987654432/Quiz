const mongoose = require('mongoose');

const quizSettingsSchema = new mongoose.Schema({
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 180
    },
    isLive: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('QuizSettings', quizSettingsSchema);