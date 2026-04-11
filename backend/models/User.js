const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Core Identifiers
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // Made optional for Google Auth Users
  googleId: { type: String }, // For Google Auth Users
  passwordChangedAt: { type: Date, default: Date.now },
  
  // Basic Demographics
  phone: { type: String, default: "" },
  countryCode: { type: String, default: "+91" },
  dob: { type: String, default: "" },
  gender: { type: String, default: "Not Specified" },
  
  // Biometrics
  height: { type: String, default: "" },
  weight: { type: String, default: "" },
  age: { type: String, default: "" },
  bloodPressure: { type: String, default: "120/80" },
  
  // Cloudinary References
  avatarUrl: { 
    type: String, 
    default: "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='24' height='24' fill='%23DFE5E7'/%3E%3Cpath d='M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z' fill='%23FFFFFF'/%3E%3C/svg%3E" // WhatsApp style default
  },
  avatarPublicId: { type: String, default: "" }, 
}, 
// Timestamps options automatically create 'createdAt' and 'updatedAt' fields
{ timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
