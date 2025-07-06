import { createQueryHook, ApiClient } from './shared';
import type { FileItem } from '@/components/file-browser/file-browser';
import { fileNodeToFileItem } from '@/components/file-browser/utils';

interface UseFilesQueryProps {
  currentPath: string;
  type: 'files' | 'media';
}

export const useFilesQuery = ({ currentPath, type }: UseFilesQueryProps) => {
  return createQueryHook(
    (repositoryId) => ['files', type, currentPath, repositoryId],
    async (client: ApiClient): Promise<FileItem[]> => {
      if (type === 'files') {
        const data = await client.get<{ files: any[] }>('/api/files/tree');
        const files = data.files || [];
        return files.map(fileNodeToFileItem);
      } else if (type === 'media') {
        const endpoint = `/api/s3?path=${encodeURIComponent(currentPath)}`;
        const data = await client.get<{ items: FileItem[] }>(endpoint);
        return data.items || [];
      }
      return [];
    }
  )();
};
