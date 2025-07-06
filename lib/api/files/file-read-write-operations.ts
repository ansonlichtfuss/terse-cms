import * as fs from 'fs';
import * as path from 'path';

import type { ExistenceInfo, FileContent, FileOperationResult } from './file-operations-types';
import { FilePathValidator } from './file-path-validator';

/**
 * Core file read/write operations utility class that handles reading and writing files.
 */
export class FileReadWriteOperations {
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
   * Reads a file and returns its content with comprehensive error handling.
   */
  async readFile(filePath: string): Promise<FileOperationResult<FileContent>> {
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

      // Check if it's a directory
      const stats = fs.lstatSync(fullPath);
      if (stats.isDirectory()) {
        return {
          success: false,
          error: 'Path is a directory, not a file',
          statusCode: 400
        };
      }

      const content = fs.readFileSync(fullPath, 'utf8');

      return {
        success: true,
        data: {
          path: filePath,
          content,
          lastModified: stats.mtime.toISOString()
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Error reading file:', error);
      return {
        success: false,
        error: 'Failed to read file',
        statusCode: 500
      };
    }
  }

  /**
   * Writes content to a file, creating parent directories as needed.
   */
  async writeFile(filePath: string, content: string): Promise<FileOperationResult> {
    const validation = FilePathValidator.validatePath(filePath);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        statusCode: 400
      };
    }

    if (content === undefined || content === null) {
      return {
        success: false,
        error: 'Content is required',
        statusCode: 400
      };
    }

    try {
      const fullPath = this.getFullPath(filePath);

      // Create directory if it doesn't exist
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Check if target is a directory
      if (fs.existsSync(fullPath)) {
        const stats = fs.lstatSync(fullPath);
        if (stats.isDirectory()) {
          return {
            success: false,
            error: 'Cannot write to directory',
            statusCode: 400
          };
        }
      }

      fs.writeFileSync(fullPath, content, 'utf8');

      return {
        success: true,
        statusCode: 200
      };
    } catch (error) {
      console.error('Error writing file:', error);
      return {
        success: false,
        error: 'Failed to write file',
        statusCode: 500
      };
    }
  }

  /**
   * Checks if a file or directory exists and returns detailed information.
   */
  async exists(filePath: string): Promise<FileOperationResult<ExistenceInfo>> {
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
          success: true,
          data: { exists: false, isDirectory: false },
          statusCode: 200
        };
      }

      const stats = fs.lstatSync(fullPath);
      return {
        success: true,
        data: {
          exists: true,
          isDirectory: stats.isDirectory()
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Error checking file existence:', error);
      return {
        success: false,
        error: 'Failed to check file existence',
        statusCode: 500
      };
    }
  }
}
