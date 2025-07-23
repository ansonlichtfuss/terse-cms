import { useQuery } from '@tanstack/react-query';

import type { FileItem } from '@/components/file-browser/file-browser';

import { useApiClient, queryKeys } from './shared';

interface UseFilesQueryProps {
  currentPath: string;
}

interface UseFilesQueryOptions {
  enabled?: boolean;
}

export const useS3FilesQuery = ({ currentPath }: UseFilesQueryProps, options: UseFilesQueryOptions = {}) => {
  const apiClient = useApiClient();
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.s3Files(currentPath, apiClient.getRepositoryId()),
    queryFn: async (): Promise<FileItem[]> => {
      const endpoint = `/api/s3?path=${encodeURIComponent(currentPath)}`;
      const data = await apiClient.request<{ items: FileItem[] }>('GET', endpoint);
      return data.items || [];
    },
    enabled,
  });
};
