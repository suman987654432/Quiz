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

        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('Successfully connected to MongoDB');


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

        return;
      }


      const waitTime = Math.pow(2, 5 - retries) * 1000;
      console.log(`Waiting ${waitTime}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};


const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isConnected };