const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if header contains the Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from string "Bearer eyJhbGci..."
      token = req.headers.authorization.split(' ')[1];

      // Verify and decode token using the same Secret Key used during Login
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medintel_super_secret_key_2026');

      // Find user in DB and attach it to req object (without password)
      req.user = await User.findById(decoded.id).select('-password');

      // Secure passing to the next Controller function
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: 'Not authorized, security token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
