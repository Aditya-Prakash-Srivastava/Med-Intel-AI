const Report = require('../models/Report');
const cloudinary = require('../config/cloudinary');

// @desc    Get all reports specifically belonging to the active authorized user
// @route   GET /api/reports
const getUserReports = async (req, res) => {
  try {
    console.log(`🗃️  [DB] Fetching reports for user: ${req.user._id}`);
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    console.log(`✅ [DB] Found ${reports.length} reports.`);
    res.json(reports);
  } catch (error) { 
    console.error(`❌ [DB ERROR] ${error.message}`);
    res.status(500).json({ message: error.message }); 
  }
};

// @desc    Register a new Clinical Report linked to Cloudinary Upload
// @route   POST /api/reports
const createReport = async (req, res) => {
  try {
    const { title, date, iconType, fileUrl, cloudinaryId, fileType } = req.body;
    console.log(`📝 [DB] Creating new report record: ${title}`);
    
    // User._id implicitly provided securely via the authMiddleware token
    const report = await Report.create({
      userId: req.user._id,
      title, date, iconType, fileUrl, cloudinaryId, fileType
    });
    console.log(`✅ [DB] Report created successfully with ID: ${report._id}`);
    res.status(201).json(report);
  } catch (error) { 
    console.error(`❌ [DB ERROR] ${error.message}`);
    res.status(500).json({ message: error.message }); 
  }
};

// @desc    Rename/Update an existing report
// @route   PUT /api/reports/:id
const updateReport = async (req, res) => {
  try {
    console.log(`🔄 [DB] Updating report ID: ${req.params.id}`);
    const report = await Report.findById(req.params.id);
    
    // Check ownership mapping strictly
    if (!report || report.userId.toString() !== req.user._id.toString()) {
      console.log(`🚫 [DB] Unauthorized update attempt or not found!`);
      return res.status(404).json({ message: "Report artifact not found or unauthorized access" });
    }
    
    report.title = req.body.title || report.title;
    await report.save();
    console.log(`✅ [DB] Report updated.`);
    
    res.json(report);
  } catch (error) { 
    console.error(`❌ [DB ERROR] ${error.message}`);
    res.status(500).json({ message: error.message }); 
  }
};

// @desc    Completely obliterate a report from Database AND Cloudinary CDN
// @route   DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    console.log(`🗑️ [DB] Delete request initialized for report: ${req.params.id}`);
    const report = await Report.findById(req.params.id);
    
    if (!report || report.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Report artifact not found or unauthorized access" });
    }
    
    // 1. DELETE FROM CLOUDINARY CDN (Critical instruction from User)
    console.log(`☁️ [CDN] Destroying asset on Cloudinary: ${report.cloudinaryId}`);
    await cloudinary.uploader.destroy(report.cloudinaryId);
    
    // 2. DELETE FROM MONGODB
    console.log(`🧹 [DB] Purging document from MongoDB...`);
    await report.deleteOne();
    
    console.log(`✅ [DB] Report fully purged.`);
    res.json({ message: 'Clinical Report fully purged from Cloudinary and UI safely.' });
  } catch (error) { 
    console.error(`❌ [DB ERROR] deleteReport failed: ${error.message}`);
    res.status(500).json({ message: error.message }); 
  }
};

module.exports = { getUserReports, createReport, updateReport, deleteReport };
