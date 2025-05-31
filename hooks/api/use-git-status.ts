import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const fetchGitStatus = async (): Promise<string[]> => {
  // Stage all changes before fetching status
  await fetch('/api/git/stage', { method: 'POST' });

  const response = await fetch('/api/git/status');
  if (!response.ok) {
    throw new Error('Failed to fetch git status');
  }
  const data = await response.json();
  return data.modifiedFiles as string[];
};

const stageGitChanges = async (): Promise<void> => {
  const response = await fetch('/api/git/stage', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to stage git changes');
  }
};

export const useGitStatusQuery = () => {
  return useQuery<string[], Error>({
    queryKey: ['gitStatus'], // Unique key for git status
    queryFn: fetchGitStatus
  });
};

export const useStageGitChangesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: stageGitChanges,
    onSuccess: () => {
      // Invalidate the gitStatus query to refetch after staging
      queryClient.invalidateQueries({ queryKey: ['gitStatus'] });
    }
  });
};
