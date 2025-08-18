const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://ismanov98q:yLSmIc9UNze0Jkz6@tccluster.z8gmmlk.mongodb.net/?retryWrites=true&w=majority&appName=tccluster", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;