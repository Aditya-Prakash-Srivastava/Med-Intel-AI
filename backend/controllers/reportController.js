const Report = require('../models/Report');
const cloudinary = require('../config/cloudinary');

// @desc    Get all reports specifically belonging to the active authorized user
// @route   GET /api/reports
const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Register a new Clinical Report linked to Cloudinary Upload
// @route   POST /api/reports
const createReport = async (req, res) => {
  try {
    const { title, date, iconType, fileUrl, cloudinaryId, fileType } = req.body;
    
    // User._id implicitly provided securely via the authMiddleware token
    const report = await Report.create({
      userId: req.user._id,
      title, date, iconType, fileUrl, cloudinaryId, fileType
    });
    res.status(201).json(report);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Rename/Update an existing report
// @route   PUT /api/reports/:id
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    // Check ownership mapping strictly
    if (!report || report.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Report artifact not found or unauthorized access" });
    }
    
    report.title = req.body.title || report.title;
    await report.save();
    
    res.json(report);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Completely obliterate a report from Database AND Cloudinary CDN
// @route   DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report || report.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Report artifact not found or unauthorized access" });
    }
    
    // 1. DELETE FROM CLOUDINARY CDN (Critical instruction from User)
    await cloudinary.uploader.destroy(report.cloudinaryId);
    
    // 2. DELETE FROM MONGODB
    await report.deleteOne();
    
    res.json({ message: 'Clinical Report fully purged from Cloudinary and UI safely.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getUserReports, createReport, updateReport, deleteReport };
