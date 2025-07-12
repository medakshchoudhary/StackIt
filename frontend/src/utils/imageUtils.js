import { uploadAPI } from '../services/uploadAPI';

/**
 * Extracts images from HTML content and uploads them if they're data URLs
 * @param {string} htmlContent - The HTML content containing images
 * @returns {Promise<string>} - The HTML content with uploaded image URLs
 */
export const processImagesInContent = async (htmlContent) => {
  if (!htmlContent) return htmlContent;

  // Find all img tags with data: URLs
  const imgRegex = /<img[^>]+src="data:image\/[^;]+;base64,[^"]*"[^>]*>/g;
  const matches = htmlContent.match(imgRegex);
  
  if (!matches) return htmlContent;

  let processedContent = htmlContent;
  
  // Process each data URL image
  for (const match of matches) {
    try {
      // Extract the data URL
      const srcMatch = match.match(/src="(data:image\/[^;]+;base64,[^"]*)"/);
      if (!srcMatch) continue;
      
      const dataUrl = srcMatch[1];
      
      // Convert data URL to file
      const file = await dataUrlToFile(dataUrl);
      
      // Upload the file
      const uploadResponse = await uploadAPI.uploadImage(file);
      
      if (uploadResponse.success) {
        // Get the uploaded image URL
        const imageUrl = uploadResponse.data.url.startsWith('http') 
          ? uploadResponse.data.url 
          : `${window.location.origin}${uploadResponse.data.url}`;
        
        // Replace the data URL with the uploaded URL
        processedContent = processedContent.replace(dataUrl, imageUrl);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      // Continue with other images even if one fails
    }
  }
  
  return processedContent;
};

/**
 * Converts a data URL to a File object
 * @param {string} dataUrl - The data URL to convert
 * @returns {Promise<File>} - The File object
 */
const dataUrlToFile = async (dataUrl) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  
  // Generate a filename based on the current timestamp
  const timestamp = Date.now();
  const filename = `image_${timestamp}.${getFileExtensionFromDataUrl(dataUrl)}`;
  
  return new File([blob], filename, { type: blob.type });
};

/**
 * Extracts file extension from data URL
 * @param {string} dataUrl - The data URL
 * @returns {string} - The file extension
 */
const getFileExtensionFromDataUrl = (dataUrl) => {
  const mimeType = dataUrl.split(';')[0].split(':')[1];
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
};

/**
 * Validates if content contains any unprocessed data URLs
 * @param {string} htmlContent - The HTML content to validate
 * @returns {boolean} - True if content contains data URLs
 */
export const containsDataUrls = (htmlContent) => {
  if (!htmlContent) return false;
  return /src="data:image\/[^;]+;base64,[^"]*"/.test(htmlContent);
};
