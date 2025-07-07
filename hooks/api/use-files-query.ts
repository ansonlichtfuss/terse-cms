import { useQuery } from '@tanstack/react-query';
import type { FileItem } from '@/components/file-browser/file-browser';
import { fileNodeToFileItem } from '@/components/file-browser/utils';

import { ApiClient, useApiClient } from './shared';

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
        const data = await apiClient.get<{ files: any[] }>('/api/files/tree');
        const files = data.files || [];
        return files.map(fileNodeToFileItem);
      } else if (type === 'media') {
        const endpoint = `/api/s3?path=${encodeURIComponent(currentPath)}`;
        const data = await apiClient.get<{ items: FileItem[] }>(endpoint);
        return data.items || [];
      }
      return [];
    }
  });
};
