const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected Successfully to host: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB database', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;

