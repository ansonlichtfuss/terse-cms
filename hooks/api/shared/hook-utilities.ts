import { useRepositoryFromUrl } from '@/hooks/use-repository-from-url';

import { ApiClient } from './api-client';
import { useQueryInvalidation } from './query-utils';

/**
 * Hook to get an ApiClient instance for the current repository
 */
export function useApiClient() {
  const { currentRepositoryId } = useRepositoryFromUrl();
  return new ApiClient(currentRepositoryId);
}

/**
 * Hook to get standardized invalidation functions
 */
export function useStandardInvalidation() {
  const { currentRepositoryId } = useRepositoryFromUrl();
  const { invalidateFileQueries, invalidateGitQueries, invalidateRepositoryQueries } = useQueryInvalidation();

  return {
    invalidateFiles: () => invalidateFileQueries(currentRepositoryId),
    invalidateGit: () => invalidateGitQueries(currentRepositoryId),
    invalidateAll: () => invalidateRepositoryQueries(currentRepositoryId),
    currentRepositoryId
  };
}

/**
 * Hook to get the current repository ID from an ApiClient instance
 */
export function useRepositoryId(apiClient: ApiClient) {
  return apiClient.getRepositoryId();
}
