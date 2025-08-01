import { shouldUseMockApi } from '@/lib/env';
import { getRepositoryPath } from '@/lib/paths';

import type { DirectoryContents, ExistenceInfo, FileContent, FileOperationResult } from './file-operations-types';
import { FileSystemOperations } from './file-system-operations';
import { FileTreeBuilder } from './file-tree-builder';

// Re-export types for backward compatibility
export type {
  DirectoryContents,
  ExistenceInfo,
  FileContent,
  FileNode,
  FileOperationResult
} from './file-operations-types';

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
   * @param repositoryId - Repository ID. Required when not using mock API
   */
  constructor(repositoryId?: string) {
    this.repositoryId = repositoryId;

    if (shouldUseMockApi()) {
      this.rootDir = 'mock-data/filesystem';
    } else {
      if (!repositoryId) {
        throw new Error('Repository ID is required when not using mock API');
      }
      this.rootDir = getRepositoryPath(repositoryId);
    }

    this.fileSystemOps = new FileSystemOperations(this.rootDir);
  }

  /**
   * Gets the repository ID associated with this FileOperations instance.
   *
   * @returns The repository ID, or undefined if using mock API
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
   * Gets the contents of a specific directory.
   *
   * This method reads only the immediate contents of the specified directory,
   * without recursively loading subdirectories. This is more efficient for
   * large directory structures.
   *
   * @param directoryPath - The path to the directory to read (relative to root)
   * @returns A promise that resolves to a FileOperationResult containing the directory contents
   */
  async getDirectoryContents(directoryPath: string): Promise<FileOperationResult<DirectoryContents>> {
    return FileTreeBuilder.buildDirectoryContents(this.rootDir, directoryPath);
  }
}
