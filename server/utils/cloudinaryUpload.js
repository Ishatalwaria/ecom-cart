const { cloudinary, isConfigured } = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for temporary file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use the uploads directory directly for simplicity
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File type filter - only images
const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Function to upload to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'products') => {
  // If Cloudinary is not configured, return the local path
  if (!isConfigured) {
    console.log('Skipping Cloudinary upload (not configured)');
    const filename = path.basename(filePath);
    return {
      url: `/uploads/${filename}`,
      public_id: null,
      success: true,
      local: true
    };
  }

  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto', // auto-detect file type
      use_filename: true, // keep original filename
      unique_filename: true, // add unique ID to filename
    });
    
    // Delete the local file after successful Cloudinary upload
    try {
      fs.unlinkSync(filePath);
      console.log('Temporary file deleted after Cloudinary upload');
    } catch (err) {
      console.warn('Could not delete temporary file:', err);
    }
    
    // Return the secure URL and public ID
    return {
      url: result.secure_url,
      public_id: result.public_id,
      success: true,
      local: false
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    
    // Fallback to local storage
    const filename = path.basename(filePath);
    return {
      url: `/uploads/${filename}`,
      public_id: null,
      success: true,
      local: true,
      cloudinaryError: error.message
    };
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  isCloudinaryConfigured: isConfigured
}; 