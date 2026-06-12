const logger = require('../utils/logger');

const validateEnv = () => {
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'GEMINI_API_KEY'
  ];

  const optional = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RESEND_API_KEY',
    'BREVO_API_KEY',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];

  let missingRequired = [];
  required.forEach(key => {
    if (!process.env[key]) {
      missingRequired.push(key);
    }
  });

  if (missingRequired.length > 0) {
    logger.error(`CRITICAL CONFIGURATION ERROR: Missing required environment variables: ${missingRequired.join(', ')}`);
    logger.error('Please configure these variables in your environment or backend/.env file before running.');
    process.exit(1);
  }

  // Warn about optional features that will be disabled if key env variables are missing
  let missingOptional = [];
  optional.forEach(key => {
    if (!process.env[key]) {
      missingOptional.push(key);
    }
  });

  if (missingOptional.length > 0) {
    logger.warn(`Optional services may be limited. Missing environment variables: ${missingOptional.join(', ')}`);
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      logger.warn('⚠️ Cloudinary uploads will fail.');
    }
    if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
      logger.warn('⚠️ Email delivery (welcome emails, OTP verification) will be unavailable.');
    }
  } else {
    logger.info('✅ Environment configuration successfully validated.');
  }
};

module.exports = validateEnv;
