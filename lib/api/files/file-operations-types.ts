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
  /** ISO date string of when the file was last modified */
  lastModified: string;
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
  /** ISO date string of when the file/directory was last modified */
  lastModified?: string;
}
