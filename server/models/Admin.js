const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
});

adminSchema.pre('save', async function(next) {

  if (!this.isModified('password')) return next();

  try {
   
    const salt = await bcrypt.genSalt(12);
    
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

module.exports = mongoose.model('Admin', adminSchema); 