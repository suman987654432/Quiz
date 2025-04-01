const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [
      array => array.length === 4,
      'Question must have exactly 4 options'
    ]
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  timer: {
    type: Number,
    default: 30,
    min: 10,
    max: 180
  }
});

module.exports = mongoose.model('Question', questionSchema); 