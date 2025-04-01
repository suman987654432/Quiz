const mongoose = require('mongoose');

const connectDB = async () => {
  let retries = 5;
  
  while (retries) {
    try {
      const mongoURI = process.env.MONGODB_URI;
      console.log('Attempting to connect to MongoDB...');

      if (!mongoURI) {
        throw new Error('MongoDB URI is not defined in environment variables');
      }

      await mongoose.connect(mongoURI, {
        // Add these options for better reliability
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });
      
      console.log('Successfully connected to MongoDB');
      
      // Add connection error handlers
      mongoose.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });
      
      // Successfully connected
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${6 - retries}/5 failed:`, error.message);
      retries -= 1;
      
      if (retries === 0) {
        console.error('All MongoDB connection attempts failed');
        // Don't exit the process, let the app run in degraded mode
        return;
      }
      
      // Wait before next retry (exponential backoff)
      const waitTime = Math.pow(2, 5 - retries) * 1000;
      console.log(`Waiting ${waitTime}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Add a utility function to check DB connection status
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isConnected };