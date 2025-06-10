import type React from 'react';

// Re-export file operation types for convenience
export type { FileNode, FileOperationResult, FileContent, ExistenceInfo } from '@/lib/api/files/file-operations-types';

export interface FileData {
  path: string;
  content: string;
  isModified: boolean;
}

// S3/Media-related types
export interface S3Item {
  key: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: string;
  url?: string;
}

// Git-related types
export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  changes: {
    files: string[];
    insertions: number;
    deletions: number;
  };
}

// Editor-related types
export interface EditorToolbarAction {
  icon: React.ReactNode;
  action: string;
  value?: string;
  tooltip: string;
  onClick?: () => void;
}

export interface EditorToolbarGroup {
  group: string;
  items: EditorToolbarAction[];
}

// Thumbnail Service types
export interface ImageServiceConfig {
  matcher: (url: string) => boolean;
  getThumbnailUrl: (url: string, width: number, height: number) => string;
}

export interface MarkdownCMSConfig {
  imageService?: ImageServiceConfig;
  // Other config types can be added here
}
