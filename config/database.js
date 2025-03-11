// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Removed deprecated options that are no longer needed in MongoDB driver v4.0+
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process on connection failure
  }
};

module.exports = connectDB;
