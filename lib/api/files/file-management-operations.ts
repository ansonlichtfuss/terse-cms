import * as fs from 'fs';
import * as path from 'path';
import type { FileOperationResult } from './file-operations-types';
import { FilePathValidator } from './file-path-validator';

/**
 * File management operations utility class that handles deleting, moving, and renaming files.
 */
export class FileManagementOperations {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  /**
   * Gets the full system path for a given file path
   */
  private getFullPath(filePath: string): string {
    return path.join(this.rootDir, filePath);
  }

  /**
   * Deletes a file or directory with comprehensive error handling.
   */
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    const validation = FilePathValidator.validatePath(filePath);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        statusCode: 400
      };
    }

    try {
      const fullPath = this.getFullPath(filePath);

      if (!fs.existsSync(fullPath)) {
        return {
          success: false,
          error: 'File not found',
          statusCode: 404
        };
      }

      const stats = fs.lstatSync(fullPath);

      if (stats.isDirectory()) {
        // Remove directory recursively
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        // Remove file
        fs.unlinkSync(fullPath);
      }

      return {
        success: true,
        statusCode: 200
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: 'Failed to delete file',
        statusCode: 500
      };
    }
  }

  /**
   * Moves a file or directory from source to destination path.
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<FileOperationResult> {
    const sourceValidation = FilePathValidator.validatePath(sourcePath);
    if (!sourceValidation.isValid) {
      return {
        success: false,
        error: `Invalid source path: ${sourceValidation.error}`,
        statusCode: 400
      };
    }

    const destValidation = FilePathValidator.validatePath(destinationPath);
    if (!destValidation.isValid) {
      return {
        success: false,
        error: `Invalid destination path: ${destValidation.error}`,
        statusCode: 400
      };
    }

    try {
      const fullSourcePath = this.getFullPath(sourcePath);
      const fullDestPath = this.getFullPath(destinationPath);

      // Check if source exists
      if (!fs.existsSync(fullSourcePath)) {
        return {
          success: false,
          error: 'Source file not found',
          statusCode: 404
        };
      }

      // Create destination directory if it doesn't exist
      if (!fs.existsSync(fullDestPath)) {
        fs.mkdirSync(fullDestPath, { recursive: true });
      }

      const fileName = path.basename(fullSourcePath);
      const newFilePath = path.join(fullDestPath, fileName);

      // Move the file
      fs.renameSync(fullSourcePath, newFilePath);

      return {
        success: true,
        statusCode: 200
      };
    } catch (error) {
      console.error('Error moving file:', error);
      return {
        success: false,
        error: 'Failed to move file',
        statusCode: 500
      };
    }
  }

  /**
   * Renames a file or directory.
   */
  async renameFile(sourcePath: string, newName: string): Promise<FileOperationResult> {
    const validation = FilePathValidator.validatePath(sourcePath);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        statusCode: 400
      };
    }

    if (!newName || typeof newName !== 'string' || !newName.trim()) {
      return {
        success: false,
        error: 'New name is required',
        statusCode: 400
      };
    }

    try {
      const fullSourcePath = this.getFullPath(sourcePath);

      // Check if source exists
      if (!fs.existsSync(fullSourcePath)) {
        return {
          success: false,
          error: 'Source file not found',
          statusCode: 404
        };
      }

      const dirName = path.dirname(fullSourcePath);
      const newFilePath = path.join(dirName, newName.trim());

      // Rename the file
      fs.renameSync(fullSourcePath, newFilePath);

      return {
        success: true,
        statusCode: 200
      };
    } catch (error) {
      console.error('Error renaming file:', error);
      return {
        success: false,
        error: 'Failed to rename file',
        statusCode: 500
      };
    }
  }
}
