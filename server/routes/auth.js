const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const mongoose = require('mongoose'); 

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Received login attempt:', { email }); // Log the attempt

   
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Admin credentials matched'); // Log successful match

      const token = jwt.sign(
        {
          email,
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Token generated successfully'); 

      return res.json({
        token,
        user: {
          email,
          role: 'admin'
        }
      });
    }

    console.log('Invalid credentials provided'); 
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple User Login
router.post('/user/login', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (typeof name !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected when attempting user login');
      return res.status(503).json({ message: 'Database service unavailable' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.loggedIn) {
        console.log(`User with email ${email} is already logged in`);
        return res.status(403).json({
          message: 'User already logged in',
          alreadyLoggedIn: true
        });
      }

      // Update login status
      existingUser.loggedIn = true;
      existingUser.lastLogin = new Date();
      await existingUser.save();

      return res.status(200).json({
        message: 'Login successful',
        user: { name: existingUser.name, email: existingUser.email }
      });
    }

    // Create a new user if not found
    const newUser = new User({
      name,
      email,
      loggedIn: true,
      lastLogin: new Date()
    });
    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { name, email }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
});

// Add a logout endpoint
router.post('/user/logout', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected when attempting user logout');
      return res.status(503).json({ message: 'Database service unavailable' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update login status
    user.loggedIn = false;
    await user.save();
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
});

module.exports = router;