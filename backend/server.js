const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const validateEnv = require('./config/configValidation');
const errorHandler = require('./middleware/errorHandler');

// Config & Routes Imports
const connectDB = require('./config/db');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Initialize Environment Variables
dotenv.config();

// Validate Environment Variables on Startup
validateEnv();

// Connect to MongoDB Atlas remotely
connectDB();

// Initialize App
const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || 
        origin === process.env.FRONTEND_URL || 
        origin.endsWith('.vercel.app') || 
        origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// 🔥 Global Advanced Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Conditionally copy Body (excluding sensitive fields)
  const safeBody = { ...req.body };
  if (safeBody.password) safeBody.password = "***HIDDEN***";
  if (safeBody.otp) safeBody.otp = "***HIDDEN***";
  if (safeBody.googleToken) safeBody.googleToken = "***HIDDEN***";
  
  logger.info(`INCOMING REQUEST - METHOD: ${req.method} | ROUTE: ${req.originalUrl}`, {
    method: req.method,
    route: req.originalUrl,
    ip: req.ip,
    body: Object.keys(safeBody).length ? safeBody : "Empty"
  });
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      logger.warn(`API RESPONSE - STATUS: ${res.statusCode} | ROUTE: ${req.originalUrl} | TIME: ${duration}ms`, {
        status: res.statusCode,
        route: req.originalUrl,
        durationMs: duration
      });
    } else {
      logger.info(`API RESPONSE - STATUS: ${res.statusCode} | ROUTE: ${req.originalUrl} | TIME: ${duration}ms`, {
        status: res.statusCode,
        route: req.originalUrl,
        durationMs: duration
      });
    }
  });
  
  next();
});

// Routes Mounts
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', require('./routes/aiRoutes'));

// Root Hello Route
app.get('/', (req, res) => {
  res.send("MedIntel AI Backend is running with MongoDB connection active!");
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running actively on port ${PORT}`);
});

