import { shouldUseMockApi } from '@/lib/env';
import { getMarkdownRootDir } from '@/lib/paths';

/**
 * Standard result interface for all file operations with comprehensive error handling.
 *
 * @template T - The type of data returned on successful operations
 */
export interface FileOperationResult<T = unknown> {
  /** Whether the operation completed successfully */
  success: boolean;
  /** The data returned by the operation (only present when success is true) */
  data?: T;
  /** Error message describing what went wrong (only present when success is false) */
  error?: string;
  /** HTTP-style status code indicating the result type */
  statusCode: number;
}

/**
 * Represents the content of a file along with its path information.
 */
export interface FileContent {
  /** The relative path to the file */
  path: string;
  /** The UTF-8 content of the file */
  content: string;
}

/**
 * Result of checking file/directory existence.
 */
export interface ExistenceInfo {
  /** Whether the file or directory exists */
  exists: boolean;
  /** Whether the target is a directory (false for files or non-existent paths) */
  isDirectory: boolean;
}

/**
 * Represents a node in the file tree structure.
 * Can be either a file or directory with optional children for directories.
 */
export interface FileNode {
  /** The name of the file or directory */
  name: string;
  /** The relative path from the root directory */
  path: string;
  /** Whether this node represents a file or directory */
  type: 'file' | 'directory';
  /** Child nodes (only present for directories) */
  children?: FileNode[];
}

/**
 * A comprehensive file operations utility class that provides secure file system operations
 * with built-in path validation, error handling, and support for both mock and real file systems.
 *
 * This class handles all file operations including reading, writing, deleting, and checking
 * file existence while ensuring security through path validation and proper error handling.
 *
 * @example
 * ```typescript
 * const fileOps = new FileOperations();
 * const result = await fileOps.readFile('example.md');
 * if (result.success) {
 *   console.log(result.data.content);
 * }
 * ```
 */
export class FileOperations {
  private rootDir: string;

  /**
   * Creates a new FileOperations instance.
   * Automatically determines whether to use mock data or real file system
   * based on the environment configuration.
   */
  constructor() {
    this.rootDir = shouldUseMockApi() ? 'mock-data/filesystem' : getMarkdownRootDir();
  }

  /**
   * Validates and sanitizes file path to prevent traversal attacks
   */
  private validatePath(filePath: string): { isValid: boolean; error?: string } {
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

  /**
   * Gets the full system path for a given file path
   */
  private async getFullPath(filePath: string): Promise<string> {
    const path = await import('path');
    return path.join(this.rootDir, filePath);
  }

  /**
   * Reads a file and returns its content with comprehensive error handling.
   *
   * This method validates the file path, checks for file existence, ensures the target
   * is not a directory, and safely reads the file content as UTF-8 text.
   *
   * @param filePath - The relative path to the file to read (e.g., 'blog/post.md')
   * @returns A promise that resolves to a FileOperationResult containing the file content
   *
   * @example
   * ```typescript
   * const result = await fileOps.readFile('example.md');
   * if (result.success) {
   *   console.log('File content:', result.data.content);
   *   console.log('File path:', result.data.path);
   * } else {
   *   console.error('Error:', result.error);
   * }
   * ```
   *
   * @throws Returns error result for:
   * - Invalid or unsafe file paths (400)
   * - File not found (404)
   * - Target is a directory (400)
   * - File system errors (500)
   */
  async readFile(filePath: string): Promise<FileOperationResult<FileContent>> {
    const validation = this.validatePath(filePath);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        statusCode: 400
      };
    }

    try {
      const fs = await import('fs');
      const fullPath = await this.getFullPath(filePath);

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
          content
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
   *
   * This method validates the file path, ensures content is provided, creates any
   * necessary parent directories, and safely writes the content to the file.
   * It prevents writing to existing directories and handles file system errors gracefully.
   *
   * @param filePath - The relative path where the file should be written (e.g., 'blog/new-post.md')
   * @param content - The content to write to the file as a UTF-8 string
   * @returns A promise that resolves to a FileOperationResult indicating success or failure
   *
   * @example
   * ```typescript
   * const result = await fileOps.writeFile('blog/new-post.md', '# My New Post\n\nContent here...');
   * if (result.success) {
   *   console.log('File written successfully');
   * } else {
   *   console.error('Write failed:', result.error);
   * }
   * ```
   *
   * @throws Returns error result for:
   * - Invalid or unsafe file paths (400)
   * - Missing or null content (400)
   * - Target is an existing directory (400)
   * - File system errors (500)
   */
  async writeFile(filePath: string, content: string): Promise<FileOperationResult> {
    const validation = this.validatePath(filePath);
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
      const fs = await import('fs');
      const path = await import('path');
      const fullPath = await this.getFullPath(filePath);

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
   * Deletes a file or directory with comprehensive error handling.
   *
   * This method validates the file path, checks for existence, and safely removes
   * the target. For directories, it performs recursive deletion. For files, it
   * removes the single file. The operation is atomic and handles permissions properly.
   *
   * @param filePath - The relative path to the file or directory to delete (e.g., 'blog/old-post.md')
   * @returns A promise that resolves to a FileOperationResult indicating success or failure
   *
   * @example
   * ```typescript
   * // Delete a file
   * const result = await fileOps.deleteFile('blog/old-post.md');
   *
   * // Delete a directory (recursive)
   * const dirResult = await fileOps.deleteFile('old-blog-folder');
   *
   * if (result.success) {
   *   console.log('Deletion successful');
   * } else {
   *   console.error('Deletion failed:', result.error);
   * }
   * ```
   *
   * @throws Returns error result for:
   * - Invalid or unsafe file paths (400)
   * - File or directory not found (404)
   * - File system errors or permission issues (500)
   */
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    const validation = this.validatePath(filePath);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        statusCode: 400
      };
    }

    try {
      const fs = await import('fs');
      const fullPath = await this.getFullPath(filePath);

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
   * Checks if a file or directory exists and returns detailed information.
   *
   * This method validates the file path and safely checks for the existence of
   * the target file or directory. It also determines whether the target is a
   * directory or a regular file, providing comprehensive existence information.
   *
   * @param filePath - The relative path to check for existence (e.g., 'blog/post.md')
   * @returns A promise that resolves to a FileOperationResult containing existence and type information
   *
   * @example
   * ```typescript
   * const result = await fileOps.exists('blog/post.md');
   * if (result.success) {
   *   if (result.data.exists) {
   *     console.log(`Found ${result.data.isDirectory ? 'directory' : 'file'}`);
   *   } else {
   *     console.log('File does not exist');
   *   }
   * } else {
   *   console.error('Check failed:', result.error);
   * }
   * ```
   *
   * @throws Returns error result for:
   * - Invalid or unsafe file paths (400)
   * - File system errors (500)
   */
  async exists(filePath: string): Promise<FileOperationResult<ExistenceInfo>> {
    const validation = this.validatePath(filePath);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        statusCode: 400
      };
    }

    try {
      const fs = await import('fs');
      const fullPath = await this.getFullPath(filePath);

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

  /**
   * Moves a file or directory from source to destination path.
   *
   * This method validates both paths, checks source existence, creates destination
   * directories as needed, and safely moves the file or directory.
   *
   * @param sourcePath - The relative path of the source file/directory to move
   * @param destinationPath - The relative path of the destination directory
   * @returns A promise that resolves to a FileOperationResult indicating success or failure
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<FileOperationResult> {
    const sourceValidation = this.validatePath(sourcePath);
    if (!sourceValidation.isValid) {
      return {
        success: false,
        error: `Invalid source path: ${sourceValidation.error}`,
        statusCode: 400
      };
    }

    const destValidation = this.validatePath(destinationPath);
    if (!destValidation.isValid) {
      return {
        success: false,
        error: `Invalid destination path: ${destValidation.error}`,
        statusCode: 400
      };
    }

    try {
      const fs = await import('fs');
      const path = await import('path');

      const fullSourcePath = await this.getFullPath(sourcePath);
      const fullDestPath = await this.getFullPath(destinationPath);

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
   *
   * This method validates the path, checks source existence, and safely renames
   * the file or directory to the new name in the same directory.
   *
   * @param sourcePath - The relative path of the source file/directory to rename
   * @param newName - The new name for the file/directory
   * @returns A promise that resolves to a FileOperationResult indicating success or failure
   */
  async renameFile(sourcePath: string, newName: string): Promise<FileOperationResult> {
    const validation = this.validatePath(sourcePath);
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
      const fs = await import('fs');
      const path = await import('path');

      const fullSourcePath = await this.getFullPath(sourcePath);

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

  /**
   * Builds a file tree structure from the configured root directory.
   *
   * This method recursively scans the file system and builds a tree structure
   * containing only markdown files and directories. It automatically handles
   * both mock and real file systems based on the current configuration.
   *
   * @returns A promise that resolves to a FileOperationResult containing the file tree
   */
  async getFileTree(): Promise<FileOperationResult<{ files: FileNode[] }>> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      // Function to build the file tree
      const buildFileTree = (dir: string, basePath = ''): FileNode[] => {
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

            if (entry.isDirectory()) {
              return {
                name: entry.name,
                path: relativePath,
                type: 'directory',
                children: buildFileTree(fullPath, relativePath)
              } as FileNode;
            } else {
              return {
                name: entry.name,
                path: relativePath,
                type: 'file'
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
      if (!fs.existsSync(this.rootDir)) {
        fs.mkdirSync(this.rootDir, { recursive: true });
      }

      const files = buildFileTree(this.rootDir);

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
