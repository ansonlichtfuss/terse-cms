import * as fs from 'fs';
import * as path from 'path';

import type { DirectoryContents, FileNode, FileOperationResult } from './file-operations-types';

/**
 * Utility class for building file tree structures from the filesystem.
 * Handles recursive directory scanning and filtering for markdown files.
 */
export class FileTreeBuilder {
  /**
   * Builds the contents of a specific directory without recursively loading subdirectories.
   *
   * This method reads only the immediate contents of the specified directory,
   * which is more efficient for large directory structures.
   *
   * @param rootDir - The root directory path
   * @param directoryPath - The path to the directory to read (relative to root)
   * @returns A promise that resolves to a FileOperationResult containing the directory contents
   */
  static async buildDirectoryContents(
    rootDir: string,
    directoryPath: string
  ): Promise<FileOperationResult<DirectoryContents>> {
    try {
      // Construct the full path to the directory
      const fullDirPath = path.join(rootDir, directoryPath);

      // Check if the directory exists
      if (!fs.existsSync(fullDirPath)) {
        return {
          success: false,
          error: `Directory not found: ${directoryPath}`,
          statusCode: 404
        };
      }

      // Check if it's actually a directory
      const stats = fs.statSync(fullDirPath);
      if (!stats.isDirectory()) {
        return {
          success: false,
          error: `Path is not a directory: ${directoryPath}`,
          statusCode: 400
        };
      }

      // Read directory contents
      const entries = fs.readdirSync(fullDirPath, { withFileTypes: true });

      const items = entries
        .filter((entry) => {
          // Skip hidden files and directories
          if (entry.name.startsWith('.')) return false;

          // Only include markdown files and directories
          if (entry.isFile() && !entry.name.endsWith('.md')) return false;

          return true;
        })
        .map((entry) => {
          const relativePath = directoryPath ? path.join(directoryPath, entry.name) : entry.name;
          const fullPath = path.join(fullDirPath, entry.name);

          // Get file modification time with error handling
          let lastModified: string | undefined;
          try {
            const stats = fs.statSync(fullPath);
            lastModified = stats.mtime.toISOString();
          } catch (error) {
            console.warn(`Failed to get modification time for ${fullPath}:`, error);
          }

          return {
            name: entry.name,
            path: relativePath,
            type: entry.isDirectory() ? 'directory' : 'file',
            lastModified
          } as FileNode;
        })
        .sort((a, b) => {
          // Sort directories first, then by name
          if (a.type === 'directory' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'directory') return 1;
          return a.name.localeCompare(b.name);
        });

      // Determine parent path
      const hasParent = directoryPath !== '';
      const parentPath = hasParent ? path.dirname(directoryPath) : undefined;

      return {
        success: true,
        data: {
          currentPath: directoryPath,
          items,
          hasParent,
          parentPath: parentPath === '.' ? '' : parentPath
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Error reading directory contents:', error);
      return {
        success: false,
        error: 'Failed to read directory contents',
        statusCode: 500
      };
    }
  }
}
