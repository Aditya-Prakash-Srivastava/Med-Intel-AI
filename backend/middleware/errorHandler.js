const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`[Express Error] Route: ${req.method} ${req.originalUrl} - Error: ${err.message}`, { 
    message: err.message, 
    stack: err.stack 
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
