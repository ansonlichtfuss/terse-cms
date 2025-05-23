import { useQuery } from '@tanstack/react-query';

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

const fetchGitHistory = async (filePath: string): Promise<Commit[]> => {
  const response = await fetch(`/api/git/history?filePath=${encodeURIComponent(filePath)}`);
  if (!response.ok) {
    throw new Error(`Error fetching git history: ${response.statusText}`);
  }
  return response.json();
};

export const useGitHistoryQuery = (filePath: string) => {
  return useQuery({
    queryKey: ['gitHistory', filePath],
    queryFn: () => fetchGitHistory(filePath),
    enabled: !!filePath // Only run the query if filePath is provided
  });
};
