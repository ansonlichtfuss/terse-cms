/**
 * Result of path validation with success flag and optional error message.
 */
export interface PathValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Utility class for validating and sanitizing file paths to prevent security vulnerabilities.
 * Provides comprehensive path validation including traversal attack prevention.
 */
export class FilePathValidator {
  /**
   * Validates and sanitizes file path to prevent traversal attacks.
   *
   * @param filePath - The file path to validate
   * @returns PathValidationResult indicating if the path is valid and any error message
   */
  static validatePath(filePath: string): PathValidationResult {
    if (!filePath || typeof filePath !== 'string') {
      return { isValid: false, error: 'Invalid file path' };
    }

    // Remove leading/trailing whitespace
    const cleanPath = filePath.trim();

    if (!cleanPath) {
      return { isValid: false, error: 'Empty file path' };
    }

    // Check for path traversal attempts
    if (cleanPath.includes('..') || cleanPath.includes('~')) {
      return { isValid: false, error: 'Path traversal not allowed' };
    }

    // Check for absolute paths
    if (cleanPath.startsWith('/') || cleanPath.includes(':')) {
      return { isValid: false, error: 'Absolute paths not allowed' };
    }

    return { isValid: true };
  }
}
