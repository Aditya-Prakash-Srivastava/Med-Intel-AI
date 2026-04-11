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
  origin: process.env.FRONTEND_URL || '*', // Vercel link here when deployed
  credentials: true
}));
app.use(express.json());

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
