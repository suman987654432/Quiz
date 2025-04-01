const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  loggedIn: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('User', UserSchema);