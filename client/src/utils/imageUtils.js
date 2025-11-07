/**
 * Utility functions for image handling
 */

// The server base URL - could be moved to environment variables
const SERVER_BASE_URL = 'http://localhost:5000';

/**
 * Returns the full URL for an image path
 * If the path is already a full URL (starts with http), returns it unchanged
 * If the path is relative (starts with /), prepends the server base URL
 * @param {string} imagePath - The image path to process
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return ''; // Return empty if no image
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return imagePath.startsWith('/') ? `${SERVER_BASE_URL}${imagePath}` : imagePath;
}; 