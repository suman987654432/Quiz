const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const mongoose = require('mongoose'); // Add this missing import

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Received login attempt:', { email }); // Log the attempt

    // Simple admin check
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

      console.log('Token generated successfully'); // Log token generation

      return res.json({
        token,
        user: {
          email,
          role: 'admin'
        }
      });
    }

    console.log('Invalid credentials provided'); // Log invalid attempt
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

    // Enhanced validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (typeof name !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    // Check if MongoDB is connected before attempting operations
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected when attempting user login');
      return res.status(503).json({ message: 'Database service unavailable' });
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // Check if user is already logged in
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
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({ message: 'Database query failed', detail: dbError.message });
    }

    // Proceed with user creation
    try {
      const newUser = new User({ 
        name, 
        email, 
        loggedIn: true,
        lastLogin: new Date()
      });
      await newUser.save();
      
      console.log(`New user created: ${name} (${email})`);
      res.status(201).json({
        message: 'User created successfully',
        user: { name, email }
      });
    } catch (saveError) {
      console.error('Error saving new user:', saveError);
      
      // Check for duplicate key error (MongoDB error code 11000)
      if (saveError.code === 11000) {
        // Try to update the user's login status again (race condition handling)
        try {
          const user = await User.findOne({ email });
          if (user && !user.loggedIn) {
            user.loggedIn = true;
            user.lastLogin = new Date();
            await user.save();
            
            return res.status(200).json({
              message: 'Login successful',
              user: { name: user.name, email: user.email }
            });
          } else if (user && user.loggedIn) {
            return res.status(403).json({
              message: 'User already logged in',
              alreadyLoggedIn: true
            });
          }
        } catch (err) {
          console.error('Error handling duplicate key:', err);
        }
      }
      
      return res.status(500).json({ message: 'Failed to create user', detail: saveError.message });
    }
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
    
    // Check if MongoDB is connected
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