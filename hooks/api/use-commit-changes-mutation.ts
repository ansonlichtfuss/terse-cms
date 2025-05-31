import { useMutation, useQueryClient } from '@tanstack/react-query';

const commitChanges = async (message: string): Promise<void> => {
  const response = await fetch('/api/git/commit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    throw new Error('Failed to commit changes');
  }
};

export const useCommitChangesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commitChanges,
    onSuccess: () => {
      // Invalidate the git status query to refetch
      queryClient.invalidateQueries({ queryKey: ['gitStatus'] });
      // Invalidate the git history query to refetch
      queryClient.invalidateQueries({ queryKey: ['gitHistory'] });
    }
  });
};
