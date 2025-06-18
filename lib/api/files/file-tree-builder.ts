import * as fs from 'fs';
import * as path from 'path';

import type { FileNode, FileOperationResult } from './file-operations-types';

/**
 * Utility class for building file tree structures from the filesystem.
 * Handles recursive directory scanning and filtering for markdown files.
 */
export class FileTreeBuilder {
  /**
   * Builds a file tree structure from the specified root directory.
   *
   * This method recursively scans the file system and builds a tree structure
   * containing only markdown files and directories. It automatically handles
   * sorting and filtering of entries.
   *
   * @param rootDir - The root directory to scan
   * @returns A promise that resolves to a FileOperationResult containing the file tree
   */
  static async buildFileTree(rootDir: string): Promise<FileOperationResult<{ files: FileNode[] }>> {
    try {
      // Function to build the file tree recursively
      const buildTree = (dir: string, basePath = ''): FileNode[] => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        return entries
          .filter((entry) => {
            // Skip hidden files and directories
            if (entry.name.startsWith('.')) return false;

            // Only include markdown files
            if (entry.isFile() && !entry.name.endsWith('.md')) return false;

            return true;
          })
          .map((entry) => {
            const relativePath = path.join(basePath, entry.name);
            const fullPath = path.join(dir, entry.name);

            // Get file modification time with error handling
            let lastModified: string | undefined;
            try {
              const stats = fs.statSync(fullPath);
              lastModified = stats.mtime.toISOString();
            } catch (error) {
              // If stat fails, leave lastModified undefined
              console.warn(`Failed to get modification time for ${fullPath}:`, error);
            }

            if (entry.isDirectory()) {
              return {
                name: entry.name,
                path: relativePath,
                type: 'directory',
                children: buildTree(fullPath, relativePath),
                lastModified
              } as FileNode;
            } else {
              return {
                name: entry.name,
                path: relativePath,
                type: 'file',
                lastModified
              } as FileNode;
            }
          })
          .sort((a, b) => {
            // Sort directories first, then by name
            if (a.type === 'directory' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'directory') return 1;
            return a.name.localeCompare(b.name);
          });
      };

      // Check if root directory exists, create if it doesn't
      if (!fs.existsSync(rootDir)) {
        fs.mkdirSync(rootDir, { recursive: true });
      }

      const files = buildTree(rootDir);

      return {
        success: true,
        data: { files },
        statusCode: 200
      };
    } catch (error) {
      console.error('Error reading file tree:', error);
      return {
        success: false,
        error: 'Failed to read file tree',
        statusCode: 500
      };
    }
  }
}
