const mongoose = require('mongoose');

const connectDB = async () => {
  const dbUri = process.env.DATABASE || process.env.MONGODB_URI;
  if (!dbUri) {
    throw new Error('DATABASE or MONGODB_URI environment variable is missing');
  }

  await mongoose.connect(dbUri);
  console.log('Database connection established');
};

module.exports = connectDB;
