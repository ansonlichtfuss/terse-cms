/**
 * @type {import('./types').MarkdownCMSConfig}
 */
const config = {
  imageService: {
    /**
     * Determines if the thumbnail service should handle a given image URL.
     * @param {string} url - The original image URL.
     * @returns {boolean} - True if the service should handle the URL, false otherwise.
     */
    matcher: (url) => {
      // TODO: Implement actual URL pattern matching logic
      console.warn('Thumbnail service matcher is not implemented. All images will use original URLs.');
      return false; // Default to not matching
    },

    /**
     * Generates the thumbnail URL for a given image URL and dimensions.
     * This function is only called if the matcher returns true.
     * @param {string} url - The original image URL.
     * @param {number} width - The target width of the image element.
     * @param {number} height - The target height of the image element.
     * @returns {string} - The processed thumbnail URL.
     */
    getThumbnailUrl: (url, width, height) => {
      // TODO: Implement actual thumbnail URL generation logic
      console.warn('Thumbnail service getThumbnailUrl is not implemented. Using original URL.');
      return url; // Default to returning original URL
    }
  }
  // Other configurations can be added here later
};

module.exports = config;
