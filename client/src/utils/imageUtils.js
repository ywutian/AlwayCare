import API_BASE_URL from '../config';

/**
 * Get the full URL for an image
 * @param {string} filename - The image filename
 * @returns {string} - The full URL to the image
 */
export const getImageUrl = (filename) => {
  if (!filename) return '';
  
  // If it's already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Remove leading slash if present
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  
  // Construct the full URL
  return `${API_BASE_URL}/${cleanFilename}`;
};
