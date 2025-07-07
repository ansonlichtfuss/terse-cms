import { useQuery } from '@tanstack/react-query';

import type { FileData } from '@/types';

import { queryKeys, useApiClient } from './shared';

export const useFileContentQuery = (filePath: string) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: queryKeys.fileContent(filePath, apiClient.getRepositoryId()),
    queryFn: async () => {
      // Use the ApiClient's buildUrl method by adding path as query param
      const endpoint = `/api/files?path=${encodeURIComponent(filePath)}`;
      const data = await apiClient.request<{ content: string; lastModified: string }>('GET', endpoint);
      return {
        path: filePath,
        content: data.content,
        isModified: false,
        lastModified: data.lastModified
      } as FileData;
    },
    enabled: !!filePath
  });
};
