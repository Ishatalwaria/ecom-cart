const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Check for required environment variables
const hasCloudinaryConfig = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  // Configure Cloudinary only if all required credentials are present
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary configured successfully');
} else {
  console.warn('Cloudinary credentials missing. File uploads will use local storage.');
}

module.exports = { 
  cloudinary,
  isConfigured: hasCloudinaryConfig
}; 