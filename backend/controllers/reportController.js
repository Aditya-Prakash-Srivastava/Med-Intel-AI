const Report = require('../models/Report');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

// @desc    Get all reports specifically belonging to the active authorized user
// @route   GET /api/reports
const getUserReports = async (req, res) => {
  try {
    logger.info(`Fetching reports for user: ${req.user._id}`);
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    logger.info(`Found ${reports.length} reports for user: ${req.user._id}`);
    res.json(reports);
  } catch (error) {
    logger.error(`Error fetching reports for user: ${req.user._id}`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new Clinical Report linked to Cloudinary Upload
// @route   POST /api/reports
const createReport = async (req, res) => {
  try {
    const { title, date, iconType, fileUrl, cloudinaryId, fileType } = req.body;
    logger.info(`Creating new report record: "${title}" for user: ${req.user._id}`);

    // User._id implicitly provided securely via the authMiddleware token
    const report = await Report.create({
      userId: req.user._id,
      title, date, iconType, fileUrl, cloudinaryId, fileType
    });
    logger.info(`Report created successfully with ID: ${report._id}`);
    res.status(201).json(report);
  } catch (error) {
    logger.error('Error creating report record', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rename/Update an existing report
// @route   PUT /api/reports/:id
const updateReport = async (req, res) => {
  try {
    logger.info(`Updating report ID: ${req.params.id}`);
    const report = await Report.findById(req.params.id);

    // Check ownership mapping strictly
    if (!report || report.userId.toString() !== req.user._id.toString()) {
      logger.warn(`Unauthorized update attempt or not found for report ID: ${req.params.id} by user: ${req.user._id}`);
      return res.status(404).json({ message: "Report artifact not found or unauthorized access" });
    }

    report.title = req.body.title || report.title;
    await report.save();
    logger.info(`Report updated successfully: ${report._id}`);

    res.json(report);
  } catch (error) {
    logger.error(`Error updating report ID: ${req.params.id}`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Completely obliterate a report from Database AND Cloudinary CDN
// @route   DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    logger.info(`Delete request initialized for report: ${req.params.id} by user: ${req.user._id}`);
    const report = await Report.findById(req.params.id);

    if (!report || report.userId.toString() !== req.user._id.toString()) {
      logger.warn(`Unauthorized delete attempt or not found for report ID: ${req.params.id} by user: ${req.user._id}`);
      return res.status(404).json({ message: "Report artifact not found or unauthorized access" });
    }

    // 1. DELETE FROM CLOUDINARY CDN (Critical instruction from User)
    logger.info(`Destroying asset on Cloudinary: ${report.cloudinaryId}`);
    await cloudinary.uploader.destroy(report.cloudinaryId);

    // 2. DELETE FROM MONGODB
    logger.info('Purging document from MongoDB...');
    await report.deleteOne();

    logger.info(`Report ${report._id} fully purged from database and Cloudinary.`);
    res.json({ message: 'Clinical Report fully purged from Cloudinary and UI safely.' });
  } catch (error) {
    logger.error(`deleteReport failed for report ID: ${req.params.id}`, error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserReports, createReport, updateReport, deleteReport };

