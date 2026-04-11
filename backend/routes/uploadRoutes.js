const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const cloudinary = require('../config/cloudinary'); // Import Cloudinary configuration to use deletion APIs

// @route   POST /api/upload
// @desc    Handles file uploads to Cloudinary, and deletes the old one if its ID is provided
// @access  Public

// The 'upload.single("file")' middleware uploads the new file to Cloudinary first
const uploadMiddleware = upload.single('file');

router.post('/', (req, res) => {
  uploadMiddleware(req, res, async function (err) {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ success: false, message: err.message, type: "MulterError" });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file found in the request. Please upload a file.' 
        });
      }

    // 1. DELETE OLD FILE LOGIC
    // Agar frontend se hume pichli photo ka 'oldImageId' milta hai, toh use Cloudinary se uda do
    const { oldImageId } = req.body;
    if (oldImageId) {
      try {
        await cloudinary.uploader.destroy(oldImageId);
        console.log(`Deleted orphaned image from Cloudinary: ${oldImageId}`);
      } catch (deleteError) {
        console.error("Warning: Failed to delete old image from Cloudinary:", deleteError);
        // We don't throw an error here because the new upload was successful, just orphaned a file.
      }
    }
    
    // 2. SUCCESS RESPONSE
    res.status(200).json({
      success: true,
      message: 'File successfully uploaded to Cloudinary',
      fileUrl: req.file.path, // Native exactly formatted URL
      publicId: req.file.filename,
      cloudinaryDetails: req.file 
    });
    
    } catch (error) {
      console.error("Upload API Error:", error);
      res.status(500).json({ 
        success: false, 
        message: 'A backend server error occurred during upload',
        error: error.message
      });
    }
  }); // Close the uploadMiddleware callback
});

module.exports = router;
