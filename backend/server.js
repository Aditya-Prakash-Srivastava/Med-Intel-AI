const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Config & Routes Imports
const connectDB = require('./config/db');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Initialize Environment Variables
dotenv.config();

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
  console.log(`\n========================================`);
  console.log(`🚀 [${new Date().toISOString()}] INCOMING REQUEST`);
  console.log(`➡️  METHOD: ${req.method} | ROUTE: ${req.originalUrl}`);
  
  // Conditionally log Body (excluding sensitive passwords)
  const safeBody = { ...req.body };
  if(safeBody.password) safeBody.password = "***HIDDEN***";
  console.log(`📦  PAYLOAD:`, Object.keys(safeBody).length ? safeBody : "Empty");
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusIcon = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusIcon}  RESPONSE STATUS: ${res.statusCode} | TIME: ${duration}ms`);
    console.log(`========================================\n`);
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running actively on port ${PORT}`);
});
