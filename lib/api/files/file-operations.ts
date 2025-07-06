import { shouldUseMockApi } from '@/lib/env';
import { getMarkdownRootDir, getRepositoryPath } from '@/lib/paths';

import type { ExistenceInfo, FileContent, FileNode, FileOperationResult } from './file-operations-types';
import { FileSystemOperations } from './file-system-operations';
import { FileTreeBuilder } from './file-tree-builder';

// Re-export types for backward compatibility
export type { ExistenceInfo, FileContent, FileNode, FileOperationResult } from './file-operations-types';

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
 *
 * @example
 * ```typescript
 * // Using with a specific repository
 * const fileOps = new FileOperations('repo1');
 * const result = await fileOps.readFile('example.md');
 * ```
 */
export class FileOperations {
  private rootDir: string;
  private fileSystemOps: FileSystemOperations;
  private repositoryId?: string;

  /**
   * Creates a new FileOperations instance.
   * Automatically determines whether to use mock data or real file system
   * based on the environment configuration.
   *
   * @param repositoryId - Optional repository ID. If provided, operations will be scoped to that repository
   */
  constructor(repositoryId?: string) {
    this.repositoryId = repositoryId;

    if (shouldUseMockApi()) {
      this.rootDir = 'mock-data/filesystem';
    } else if (repositoryId) {
      this.rootDir = getRepositoryPath(repositoryId);
    } else {
      this.rootDir = getMarkdownRootDir();
    }

    this.fileSystemOps = new FileSystemOperations(this.rootDir);
  }

  /**
   * Gets the repository ID associated with this FileOperations instance.
   *
   * @returns The repository ID, or undefined if using the default repository
   */
  getRepositoryId(): string | undefined {
    return this.repositoryId;
  }

  /**
   * Gets the root directory path for this FileOperations instance.
   *
   * @returns The root directory path
   */
  getRootDir(): string {
    return this.rootDir;
  }

  /**
   * Reads a file and returns its content with comprehensive error handling.
   */
  async readFile(filePath: string): Promise<FileOperationResult<FileContent>> {
    return this.fileSystemOps.readFile(filePath);
  }

  /**
   * Writes content to a file, creating parent directories as needed.
   */
  async writeFile(filePath: string, content: string): Promise<FileOperationResult> {
    return this.fileSystemOps.writeFile(filePath, content);
  }

  /**
   * Deletes a file or directory with comprehensive error handling.
   */
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    return this.fileSystemOps.deleteFile(filePath);
  }

  /**
   * Checks if a file or directory exists and returns detailed information.
   */
  async exists(filePath: string): Promise<FileOperationResult<ExistenceInfo>> {
    return this.fileSystemOps.exists(filePath);
  }

  /**
   * Moves a file or directory from source to destination path.
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<FileOperationResult> {
    return this.fileSystemOps.moveFile(sourcePath, destinationPath);
  }

  /**
   * Renames a file or directory.
   */
  async renameFile(sourcePath: string, newName: string): Promise<FileOperationResult> {
    return this.fileSystemOps.renameFile(sourcePath, newName);
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
    return FileTreeBuilder.buildFileTree(this.rootDir);
  }
}
