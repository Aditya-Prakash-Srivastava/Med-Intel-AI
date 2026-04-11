const mongoose = require('mongoose');

// Schema mapping user clinical uploads to absolute Cloudinary resources
const reportSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  subtitle: { 
    type: String, 
    default: 'MedIntel Verified Archive' 
  },
  date: { 
    type: String, // Stringified Exact Locale Date
    required: true
  },
  snippet: { 
    type: String, 
    default: '"Pending AI advanced diagnostic tracking..."' 
  },
  iconType: { 
    type: String, 
    default: "generic" 
  },
  // NATIVELY ATTACHED STORAGE FIELDS
  fileUrl: { 
    type: String, 
    required: true 
  },
  cloudinaryId: { 
    type: String, 
    required: true 
  },
  fileType: { 
    type: String, 
    default: 'image' 
  },
  aiAnalysis: {
    type: Object, // Store aiTitle, confidenceScore, findings (array), nextSteps (array)
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
