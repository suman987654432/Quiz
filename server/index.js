const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB, isConnected } = require('./config/database');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

const app = express();
app.use(cors());
app.use(express.json());
connectDB().then(() => {
  console.log(`MongoDB connection state: ${isConnected() ? 'Connected' : 'Disconnected'}`);
}).catch(err => {
  console.error('Failed to initialize database connection:', err);
});
app.use('/user/login', (req, res, next) => {
  if (req.method === 'POST' && !isConnected()) {
    console.warn('Database is disconnected, but allowing login flow to continue');
  }
  next();
});
app.use(`/`, authRoutes); // Ensure this is registered
app.use(`/`, quizRoutes);
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');

  try {
   
    if (require('fs').existsSync(distPath)) {
      app.use(express.static(distPath));

      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } catch (err) {
    console.error('Error checking dist directory:', err);
  }
}

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


app.use((req, res) => {
  console.log('404 for:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});