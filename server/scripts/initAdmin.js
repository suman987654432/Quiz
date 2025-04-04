require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

const createAdmin = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    
    await Admin.deleteMany({});
    console.log('Cleared existing admin accounts');

   
    const admin = new Admin({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD 
    });

    await admin.save();
    console.log('Admin saved to database');

    const savedAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!savedAdmin) {
      throw new Error('Failed to create admin user');
    }

    const isValid = await savedAdmin.comparePassword(ADMIN_PASSWORD);
    if (!isValid) {
      throw new Error('Password verification failed');
    }

    console.log('Admin user created successfully:');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Verification successful');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin(); 