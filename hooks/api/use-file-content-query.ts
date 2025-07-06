import { createQueryHook, queryKeys, ApiClient } from './shared';
import type { FileData } from '@/types';

export const useFileContentQuery = (filePath: string) => {
  return createQueryHook(
    (repositoryId) => queryKeys.fileContent(filePath, repositoryId),
    async (client: ApiClient) => {
      // Use the ApiClient's buildUrl method by adding path as query param
      const endpoint = `/api/files?path=${encodeURIComponent(filePath)}`;
      const data = await client.get<{ content: string; lastModified: string }>(endpoint);
      return {
        path: filePath,
        content: data.content,
        isModified: false,
        lastModified: data.lastModified
      } as FileData;
    },
    { enabled: !!filePath }
  )();
};
