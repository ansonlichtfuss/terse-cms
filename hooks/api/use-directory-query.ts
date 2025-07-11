import { useQuery } from '@tanstack/react-query';

import type { DirectoryContents } from '@/lib/api/files/file-operations-types';

import { useApiClient } from './shared';
import { queryKeys } from './shared/query-utils';

interface UseDirectoryQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

/**
 * Hook to fetch the contents of a specific directory.
 *
 * This hook provides lazy loading of directory contents, only fetching
 * the immediate contents of the specified directory without recursively
 * loading subdirectories.
 *
 * @param directoryPath - The path to the directory to fetch (relative to root)
 * @param repositoryId - The repository ID (optional in mock mode)
 * @param options - Query options
 * @returns TanStack Query result with directory contents
 */
export const useDirectoryQuery = (
  directoryPath: string,
  repositoryId?: string,
  options: UseDirectoryQueryOptions = {}
) => {
  const { enabled = true } = options;
  const apiClient = useApiClient();

  return useQuery({
    queryKey: queryKeys.directory(directoryPath, repositoryId),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('path', directoryPath);
      if (repositoryId) {
        params.set('repo', repositoryId);
      }

      const response = await apiClient.request<DirectoryContents>('GET', `/api/files/directory?${params.toString()}`);

      return response;
    },
    enabled
  });
};
