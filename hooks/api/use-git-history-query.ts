import { useQuery } from '@tanstack/react-query';

import { useApiClient, queryKeys } from './shared';

interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  changes: {
    files: string[];
    insertions: number;
    deletions: number;
    totalFilesChanged?: number;
  };
}

export const useGitHistoryQuery = (filePath: string) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: queryKeys.gitHistory(apiClient.getRepositoryId(), filePath),
    queryFn: async () => {
      const endpoint = `/api/git/history?filePath=${encodeURIComponent(filePath)}`;
      return apiClient.request<Commit[]>('GET', endpoint);
    },
    enabled: !!filePath,
  });
};
