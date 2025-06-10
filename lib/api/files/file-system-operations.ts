import { FileManagementOperations } from './file-management-operations';
import type { ExistenceInfo, FileContent, FileOperationResult } from './file-operations-types';
import { FileReadWriteOperations } from './file-read-write-operations';

/**
 * Core file system operations utility class that handles reading, writing, and deleting files.
 * This class provides secure file operations with comprehensive error handling.
 */
export class FileSystemOperations {
  private readWriteOps: FileReadWriteOperations;
  private managementOps: FileManagementOperations;

  constructor(rootDir: string) {
    this.readWriteOps = new FileReadWriteOperations(rootDir);
    this.managementOps = new FileManagementOperations(rootDir);
  }

  /**
   * Reads a file and returns its content with comprehensive error handling.
   */
  async readFile(filePath: string): Promise<FileOperationResult<FileContent>> {
    return this.readWriteOps.readFile(filePath);
  }

  /**
   * Writes content to a file, creating parent directories as needed.
   */
  async writeFile(filePath: string, content: string): Promise<FileOperationResult> {
    return this.readWriteOps.writeFile(filePath, content);
  }

  /**
   * Checks if a file or directory exists and returns detailed information.
   */
  async exists(filePath: string): Promise<FileOperationResult<ExistenceInfo>> {
    return this.readWriteOps.exists(filePath);
  }

  /**
   * Deletes a file or directory with comprehensive error handling.
   */
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    return this.managementOps.deleteFile(filePath);
  }

  /**
   * Moves a file or directory from source to destination path.
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<FileOperationResult> {
    return this.managementOps.moveFile(sourcePath, destinationPath);
  }

  /**
   * Renames a file or directory.
   */
  async renameFile(sourcePath: string, newName: string): Promise<FileOperationResult> {
    return this.managementOps.renameFile(sourcePath, newName);
  }
}
