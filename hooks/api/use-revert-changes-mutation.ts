import { useMutation, useQueryClient } from '@tanstack/react-query';

const revertChanges = async (): Promise<void> => {
  const response = await fetch('/api/git/revert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to revert changes');
  }
};

export const useRevertChangesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revertChanges,
    onSuccess: () => {
      // Invalidate the git status query to refetch
      queryClient.invalidateQueries({ queryKey: ['gitStatus'] });
      // Invalidate the git history query to refetch
      queryClient.invalidateQueries({ queryKey: ['gitHistory'] });
    }
  });
};
