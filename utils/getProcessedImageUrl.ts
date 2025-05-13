import { MarkdownCMSConfig } from "@/types";

let config: MarkdownCMSConfig | null = null;

// Attempt to load the configuration file.
// Using dynamic import to avoid issues if the file doesn't exist or has errors.
async function loadConfig(): Promise<MarkdownCMSConfig | null> {
  if (config) {
    return config;
  }
  try {
    // Use a dynamic import to avoid bundling the config if it's not used
    const configFile = await import("@/markdowncms.config.js");
    config = configFile.default || configFile; // Handle both default and non-default exports
    return config;
  } catch (error) {
    // If the config file doesn't exist or there's an error loading it,
    // we'll just proceed without the thumbnail service.
    console.warn(
      "Could not load markdowncms.config.js. Thumbnail service will not be available.",
      error
    );
    return null;
  }
}

/**
 * Processes an image URL using the optional thumbnail service if configured.
 * @param {string} originalUrl - The original image URL.
 * @param {number} width - The target width of the image element.
 * @param {number} height - The target height of the image element.
 * @returns {Promise<string>} - The processed image URL (thumbnail or original).
 */
export async function getProcessedImageUrl(
  originalUrl: string,
  width: number,
  height: number
): Promise<string> {
  const loadedConfig = await loadConfig();

  if (
    loadedConfig?.imageService?.matcher &&
    loadedConfig.imageService.getThumbnailUrl
  ) {
    try {
      if (loadedConfig.imageService.matcher(originalUrl)) {
        const thumbnailUrl = loadedConfig.imageService.getThumbnailUrl(
          originalUrl,
          width,
          height
        );
        // Basic validation for the returned URL
        if (thumbnailUrl && typeof thumbnailUrl === "string") {
          return thumbnailUrl;
        } else {
          console.error(
            "Thumbnail service getThumbnailUrl returned an invalid value. Using original URL."
          );
          return originalUrl;
        }
      }
    } catch (error) {
      console.error(
        "Error processing image URL with thumbnail service:",
        error
      );
      return originalUrl; // Fallback to original URL on error
    }
  }

  // If no config, no imageService, no matcher, or no getThumbnailUrl, return original URL
  return originalUrl;
}
