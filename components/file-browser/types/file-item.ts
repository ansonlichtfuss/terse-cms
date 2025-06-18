export interface FileItem {
  key: string;
  path?: string;
  name?: string;
  type: 'file' | 'folder' | 'directory';
  children?: FileItem[];
  size?: number;
  lastModified?: string;
  url?: string;
}
