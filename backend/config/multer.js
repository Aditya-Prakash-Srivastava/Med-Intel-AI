const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Define how and where files should be stored when uploaded
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Dynamically fetch the exact extension from the uploaded file
    let ext = file.originalname ? file.originalname.split('.').pop().toLowerCase() : '';
    // Optional fallback if extension is missing but mimetype exists
    if (!ext && file.mimetype) {
         ext = file.mimetype.split('/').pop().toLowerCase();
    }
    
    let fileType = 'auto';
    if (ext === 'pdf' || file.mimetype === 'application/pdf') {
       fileType = 'raw';
    }
    return {
      folder: 'medintel_ai_uploads',
      resource_type: fileType, // Raw guarantees 100% original untouch PDF bytes
      // Raw mode natively keeps original extensions, no format override needed for PDFs
      format: fileType === 'raw' ? undefined : ext 
    };
  },
});

// Create the Multer middleware instance
const upload = multer({ storage: storage });

module.exports = upload;
