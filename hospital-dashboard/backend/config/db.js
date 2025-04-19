const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://amrudantss:12345@hms.mhqzzds.mongodb.net/?retryWrites=true&w=majority&appName=HMS';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 