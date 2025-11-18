/**
 * URL Validation Utilities
 */

/**
 * Validate if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true; // Empty is valid (optional field)
  
  try {
    const urlObj = new URL(url);
    // Check if protocol is http or https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate if a string is a valid YouTube URL
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true; // Empty is valid (optional field)
  
  if (!isValidUrl(url)) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if it's a YouTube domain
    return (
      hostname === 'www.youtube.com' ||
      hostname === 'youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'm.youtube.com'
    );
  } catch {
    return false;
  }
};

/**
 * Get error message for invalid URL
 */
export const getUrlErrorMessage = (url: string, fieldName: string = 'URL'): string => {
  if (!url || url.trim() === '') return '';
  
  if (!isValidUrl(url)) {
    return `${fieldName} must be a valid URL starting with http:// or https://`;
  }
  
  return '';
};

/**
 * Get error message for invalid YouTube URL
 */
export const getYouTubeUrlErrorMessage = (url: string, isRequired: boolean = false): string => {
  if (!url || url.trim() === '') {
    return isRequired ? 'Video URL is required' : '';
  }
  
  if (!isValidUrl(url)) {
    return 'Video URL must be a valid URL starting with http:// or https://';
  }
  
  if (!isValidYouTubeUrl(url)) {
    return 'Video URL must be a valid YouTube link (youtube.com or youtu.be)';
  }
  
  return '';
};

/**
 * Get error message for resource URL with required check
 */
export const getResourceUrlErrorMessage = (url: string, isRequired: boolean = false): string => {
  if (!url || url.trim() === '') {
    return isRequired ? 'Resource URL is required' : '';
  }
  
  if (!isValidUrl(url)) {
    return 'Resource URL must be a valid URL starting with http:// or https://';
  }
  
  return '';
};