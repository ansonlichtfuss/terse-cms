import { useQuery } from '@tanstack/react-query';
import { queryKeys, ApiClient, useApiClient } from './shared';
import type { FileData } from '@/types';

export const useFileContentQuery = (filePath: string) => {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: queryKeys.fileContent(filePath, apiClient.getRepositoryId()),
    queryFn: async () => {
      // Use the ApiClient's buildUrl method by adding path as query param
      const endpoint = `/api/files?path=${encodeURIComponent(filePath)}`;
      const data = await apiClient.get<{ content: string; lastModified: string }>(endpoint);
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
