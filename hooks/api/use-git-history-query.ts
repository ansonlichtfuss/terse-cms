import { createQueryHook, ApiClient } from './shared';

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
  return createQueryHook(
    (repositoryId) => ['gitHistory', filePath, repositoryId],
    async (client: ApiClient) => {
      const endpoint = `/api/git/history?filePath=${encodeURIComponent(filePath)}`;
      return client.get<Commit[]>(endpoint);
    },
    { enabled: !!filePath }
  )();
};
