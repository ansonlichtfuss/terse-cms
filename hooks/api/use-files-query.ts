import { useQuery } from '@tanstack/react-query';

import type { FileItem } from '@/components/file-browser/file-browser';
import { fileNodeToFileItem } from '@/components/file-browser/utils';
import { FileNode } from '@/types';

import { useApiClient } from './shared';

interface UseFilesQueryProps {
  currentPath: string;
  type: 'files' | 'media';
}

export const useFilesQuery = ({ currentPath, type }: UseFilesQueryProps) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ['files', type, currentPath, apiClient.getRepositoryId()],
    queryFn: async (): Promise<FileItem[]> => {
      if (type === 'files') {
        const data = await apiClient.request<{ files: FileNode[] }>('GET', '/api/files/tree');
        const files = data.files || [];
        return files.map(fileNodeToFileItem);
      } else if (type === 'media') {
        const endpoint = `/api/s3?path=${encodeURIComponent(currentPath)}`;
        const data = await apiClient.request<{ items: FileItem[] }>('GET', endpoint);
        return data.items || [];
      }
      return [];
    }
  });
};
